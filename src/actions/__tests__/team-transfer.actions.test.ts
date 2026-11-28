import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  session,
  teamMembers,
  teamOwnershipTransfers,
  teamPaymentSettings,
  teamStaff,
  teamStaffEvents,
  teams,
  user as userTable,
} from "@/db/schema";

type Call = { method: string; args: unknown[] };
type Op = { kind: string; table: unknown; inTx: boolean; calls: Call[] };

const mocks = vi.hoisted(() => {
  const ops: Op[] = [];
  const results = {
    select: new Map<unknown, unknown[][]>(),
    insert: new Map<unknown, unknown[][]>(),
    update: new Map<unknown, unknown[][]>(),
    delete: new Map<unknown, unknown[][]>(),
  };

  function take(map: Map<unknown, unknown[][]>, table: unknown) {
    const queue = map.get(table);
    return queue?.length ? queue.shift() : [];
  }

  function chain(kind: keyof typeof results, table: unknown, inTx: boolean) {
    const op: Op = { kind, table, inTx, calls: [] };
    ops.push(op);
    const proxy: unknown = new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === "then") {
            return (
              resolve: (v: unknown) => unknown,
              reject: (e: unknown) => unknown,
            ) =>
              Promise.resolve(take(results[kind], op.table)).then(
                resolve,
                reject,
              );
          }
          return (...args: unknown[]) => {
            if (prop === "from") op.table = args[0];
            op.calls.push({ method: String(prop), args });
            return proxy;
          };
        },
      },
    );
    return proxy;
  }

  function executor(inTx: boolean) {
    return {
      select: vi.fn(() => chain("select", null, inTx)),
      insert: vi.fn((table: unknown) => chain("insert", table, inTx)),
      update: vi.fn((table: unknown) => chain("update", table, inTx)),
      delete: vi.fn((table: unknown) => chain("delete", table, inTx)),
    };
  }

  const root = executor(false);
  const tx = executor(true);

  return {
    ops,
    results,
    root,
    transaction: vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
    getTeamAccess: vi.fn(),
    getSession: vi.fn(),
    revalidatePath: vi.fn(),
    sendTeamTransferEmail: vi.fn(
      async (): Promise<{ success: boolean }> => ({ success: true }),
    ),
    isTesterEmail: vi.fn(async (_email: string) => true),
  };
});

vi.mock("@/db/client", () => ({
  db: { ...mocks.root, transaction: mocks.transaction },
}));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/team-authz", () => ({
  getTeamAccess: mocks.getTeamAccess,
  can: vi.fn(),
  isTeamOwner: vi.fn(),
  canViewTeam: vi.fn(),
  getAccessibleTeamIds: vi.fn(),
}));
vi.mock("@/lib/email", () => ({
  sendTeamTransferEmail: mocks.sendTeamTransferEmail,
}));
vi.mock("@/lib/notion", () => ({ isTesterEmail: mocks.isTesterEmail }));

const {
  acceptOwnershipTransfer,
  acceptOwnershipTransferById,
  cancelOwnershipTransfer,
  declineOwnershipTransfer,
  getMyIncomingTransfers,
  getPendingTransfer,
  getTransferByToken,
  requestOwnershipTransfer,
} = await import("@/actions/team-transfer.actions");

const T = teamOwnershipTransfers;
const TOKEN = "a".repeat(43);
const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");
const FUTURE = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
const PAST = new Date(Date.now() - 60 * 1000);

const base = {
  teamExists: true,
  isOwner: false,
  isAthlete: false,
  staff: null,
};
const ownerAccess = { ...base, isOwner: true };
const athleteAccess = { ...base, isAthlete: true };
const staffOnlyAccess = {
  ...base,
  staff: { title: "coach", permissions: ["events.manage"] },
};

function signIn(id: string, email = `${id}@example.com`) {
  mocks.getSession.mockResolvedValue({
    session: {},
    user: { id, name: id, email },
  });
}

function accessFor(map: Record<string, unknown>) {
  mocks.getTeamAccess.mockImplementation(
    async (userId: string) => map[userId] ?? base,
  );
}

function queue(
  kind: keyof typeof mocks.results,
  table: unknown,
  ...rows: unknown[][]
) {
  mocks.results[kind].set(table, rows);
}

function opsOf(kind: string, table: unknown) {
  return mocks.ops.filter(op => op.kind === kind && op.table === table);
}

function argOf(op: Op, method: string) {
  return op.calls.find(c => c.method === method)?.args[0] as Record<
    string,
    unknown
  >;
}

function lockOf(op: Op) {
  return op.calls.find(c => c.method === "for")?.args[0];
}

/** Param values and column names referenced by a `.where(...)` clause. */
function whereTerms(op: Op): unknown[] {
  const out: unknown[] = [];
  const seen = new Set<unknown>();
  const walk = (node: unknown) => {
    if (node === null || typeof node !== "object" || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) return node.forEach(walk);
    const obj = node as Record<string, unknown>;
    if (Array.isArray(obj.queryChunks)) return obj.queryChunks.forEach(walk);
    if ("columnType" in obj) return void out.push(obj.name);
    if (obj.constructor?.name === "Param") return void out.push(obj.value);
  };
  walk(op.calls.find(c => c.method === "where")?.args);
  return out;
}

function eventTypes() {
  return opsOf("insert", teamStaffEvents).map(op => argOf(op, "values").type);
}

function transferRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 5,
    teamId: 7,
    fromUserId: "owner",
    toUserId: "target",
    toEmail: null,
    tokenHash: sha256(TOKEN),
    status: "pending",
    expiresAt: FUTURE,
    createdAt: new Date(),
    resolvedAt: null,
    ...overrides,
  };
}

const verified = (id: string, extra: Record<string, unknown> = {}) => ({
  email: `${id}@example.com`,
  emailVerified: true,
  planTier: "pro",
  ...extra,
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  mocks.isTesterEmail.mockResolvedValue(true);
  mocks.ops.length = 0;
  for (const map of Object.values(mocks.results)) map.clear();
});

describe("requestOwnershipTransfer", () => {
  const input = {
    teamId: 7,
    toUserId: "target",
    confirmTeamName: "Os Craques",
  };

  beforeEach(() => signIn("owner"));

  it("forbids non-owners", async () => {
    accessFor({ owner: staffOnlyAccess });

    const result = await requestOwnershipTransfer(input);

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("requires exactly one of toUserId / toEmail", async () => {
    accessFor({ owner: ownerAccess });

    const both = await requestOwnershipTransfer({
      ...input,
      toEmail: "x@example.com",
    });
    const none = await requestOwnershipTransfer({
      teamId: 7,
      confirmTeamName: "Os Craques",
    });

    for (const result of [both, none]) {
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("rejects a team name that differs (case-sensitive, trimmed)", async () => {
    accessFor({ owner: ownerAccess, target: athleteAccess });
    queue("select", teams, [{ name: "Os Craques" }]);

    const result = await requestOwnershipTransfer({
      ...input,
      confirmTeamName: "os craques",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "TEAM_NAME_MISMATCH" },
    });
  });

  it("accepts the team name with surrounding spaces", async () => {
    accessFor({ owner: ownerAccess, target: athleteAccess });
    queue("select", teams, [{ name: "Os Craques" }], [{ ownerId: "owner" }]);
    queue("select", userTable, [{ email: "target@example.com" }]);
    queue("insert", T, [{ id: 5 }]);

    const result = await requestOwnershipTransfer({
      ...input,
      confirmTeamName: "  Os Craques ",
    });

    expect(result.success).toBe(true);
  });

  it("rejects transferring to self (by id and by email)", async () => {
    accessFor({ owner: ownerAccess });
    queue("select", teams, [{ name: "Os Craques" }], [{ name: "Os Craques" }]);

    const byId = await requestOwnershipTransfer({
      ...input,
      toUserId: "owner",
    });
    const byEmail = await requestOwnershipTransfer({
      teamId: 7,
      toEmail: "  OWNER@example.com ",
      confirmTeamName: "Os Craques",
    });

    for (const result of [byId, byEmail]) {
      expect(result).toEqual({
        success: false,
        error: { code: "CANNOT_TRANSFER_TO_SELF" },
      });
    }
  });

  it("rejects a toUserId outside the roster and staff", async () => {
    accessFor({ owner: ownerAccess, target: base });
    queue("select", teams, [{ name: "Os Craques" }]);

    const result = await requestOwnershipTransfer(input);

    expect(result).toEqual({
      success: false,
      error: { code: "RECIPIENT_NOT_MEMBER" },
    });
  });

  it("rejects a second request while one is pending", async () => {
    accessFor({ owner: ownerAccess, target: athleteAccess });
    queue("select", teams, [{ name: "Os Craques" }], [{ ownerId: "owner" }]);
    queue("select", userTable, [{ email: "target@example.com" }]);
    queue("select", T, [transferRow()]);

    const result = await requestOwnershipTransfer(input);

    expect(result).toEqual({
      success: false,
      error: { code: "TRANSFER_ALREADY_PENDING" },
    });
    expect(opsOf("insert", T)).toHaveLength(0);
    expect(mocks.sendTeamTransferEmail).not.toHaveBeenCalled();
  });

  it("expires a stale pending request and creates a new one", async () => {
    accessFor({ owner: ownerAccess, target: athleteAccess });
    queue("select", teams, [{ name: "Os Craques" }], [{ ownerId: "owner" }]);
    queue("select", userTable, [{ email: "target@example.com" }]);
    queue("select", T, [transferRow({ id: 4, expiresAt: PAST })]);
    queue("update", T, [{ id: 4 }]);
    queue("insert", T, [{ id: 5 }]);

    const result = await requestOwnershipTransfer(input);

    expect(result.success).toBe(true);
    expect(argOf(opsOf("update", T)[0], "set")).toMatchObject({
      status: "expired",
    });
    expect(eventTypes()).toEqual([
      "ownership_transfer_expired",
      "ownership_transfer_requested",
    ]);
  });

  it("stores only the token hash and emails a link with the token", async () => {
    accessFor({ owner: ownerAccess, target: athleteAccess });
    queue("select", teams, [{ name: "Os Craques" }], [{ ownerId: "owner" }]);
    queue("select", userTable, [{ email: "Target@Example.com" }]);
    queue("insert", T, [{ id: 5 }]);

    const result = await requestOwnershipTransfer(input);

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.transferId).toBe(5);
    expect(result.data.expiresAt.getTime()).toBeGreaterThan(
      Date.now() + 6.9 * 24 * 60 * 60 * 1000,
    );
    expect(JSON.stringify(result)).not.toMatch(/transfer\//);

    const values = argOf(opsOf("insert", T)[0], "values");
    expect(values).toMatchObject({
      teamId: 7,
      fromUserId: "owner",
      toUserId: "target",
      status: "pending",
    });
    expect(values.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(values).not.toHaveProperty("token");

    expect(mocks.sendTeamTransferEmail).toHaveBeenCalledTimes(1);
    const [to, details] = mocks.sendTeamTransferEmail.mock
      .calls[0] as unknown as [
      string,
      { teamName: string; fromName: string; expiresAt: Date; token: string },
    ];
    expect(to).toBe("target@example.com");
    expect(details).toMatchObject({
      teamName: "Os Craques",
      fromName: "owner",
    });
    expect(details.expiresAt).toEqual(result.data.expiresAt);
    const token = details.token;
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(Buffer.from(token as string, "base64url")).toHaveLength(32);
    expect(sha256(token as string)).toBe(values.tokenHash);

    expect(eventTypes()).toEqual(["ownership_transfer_requested"]);
    const teamLock = opsOf("select", teams).find(op => lockOf(op));
    expect(teamLock && lockOf(teamLock)).toBe("no key update");
    expect(
      JSON.stringify(argOf(opsOf("insert", teamStaffEvents)[0], "values")),
    ).not.toContain(token as string);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/arena", "layout");
  });

  it("maps a unique violation race to TRANSFER_ALREADY_PENDING", async () => {
    accessFor({ owner: ownerAccess, target: athleteAccess });
    queue("select", teams, [{ name: "Os Craques" }]);
    queue("select", userTable, [{ email: "target@example.com" }]);
    mocks.transaction.mockRejectedValueOnce(
      Object.assign(new Error("duplicate key"), { code: "23505" }),
    );

    const result = await requestOwnershipTransfer(input);

    expect(result).toEqual({
      success: false,
      error: { code: "TRANSFER_ALREADY_PENDING" },
    });
    expect(mocks.sendTeamTransferEmail).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("normalizes the recipient email", async () => {
    accessFor({ owner: ownerAccess });
    queue("select", teams, [{ name: "Os Craques" }], [{ ownerId: "owner" }]);
    queue("insert", T, [{ id: 5 }]);

    const result = await requestOwnershipTransfer({
      teamId: 7,
      toEmail: "  Novo.Dono@Example.COM ",
      confirmTeamName: "Os Craques",
    });

    expect(result.success).toBe(true);
    expect(argOf(opsOf("insert", T)[0], "values")).toMatchObject({
      toUserId: null,
      toEmail: "novo.dono@example.com",
    });
    const [to] = mocks.sendTeamTransferEmail.mock.calls[0] as unknown as [
      string,
    ];
    expect(to).toBe("novo.dono@example.com");
  });
});

describe("requestOwnershipTransfer pre-launch gate", () => {
  const emailInput = {
    teamId: 7,
    toEmail: "novo@example.com",
    confirmTeamName: "Os Craques",
  };
  beforeEach(() => signIn("owner"));

  it("refuses an email recipient who is not a tester before launch", async () => {
    vi.stubEnv("APP_LAUNCHED", "false");
    mocks.isTesterEmail.mockResolvedValue(false);
    accessFor({ owner: ownerAccess });
    queue("select", teams, [{ name: "Os Craques" }]);

    const result = await requestOwnershipTransfer(emailInput);

    expect(result).toEqual({
      success: false,
      error: { code: "RECIPIENT_NOT_ELIGIBLE" },
    });
    expect(mocks.isTesterEmail).toHaveBeenCalledWith("novo@example.com");
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.sendTeamTransferEmail).not.toHaveBeenCalled();
  });

  it("skips the tester check once the app is launched", async () => {
    vi.stubEnv("APP_LAUNCHED", "true");
    mocks.isTesterEmail.mockResolvedValue(false);
    accessFor({ owner: ownerAccess });
    queue("select", teams, [{ name: "Os Craques" }], [{ ownerId: "owner" }]);
    queue("insert", T, [{ id: 5 }]);

    const result = await requestOwnershipTransfer(emailInput);

    expect(result.success).toBe(true);
    expect(mocks.isTesterEmail).not.toHaveBeenCalled();
  });
});

describe("requestOwnershipTransfer email failure", () => {
  const emailInput = {
    teamId: 7,
    toEmail: "novo@example.com",
    confirmTeamName: "Os Craques",
  };
  beforeEach(() => signIn("owner"));

  for (const [label, impl] of [
    ["returns success: false", async () => ({ success: false })],
    [
      "throws",
      async () => {
        throw new Error("smtp down");
      },
    ],
  ] as const) {
    it(`cancels the new request when the email ${label}`, async () => {
      accessFor({ owner: ownerAccess });
      queue("select", teams, [{ name: "Os Craques" }], [{ ownerId: "owner" }]);
      queue("insert", T, [{ id: 5 }]);
      queue("update", T, [{ id: 5 }]);
      mocks.sendTeamTransferEmail.mockImplementationOnce(impl);

      const result = await requestOwnershipTransfer(emailInput);

      expect(result).toEqual({
        success: false,
        error: { code: "EMAIL_SEND_FAILED" },
      });
      const cancel = opsOf("update", T)[0];
      expect(argOf(cancel, "set")).toMatchObject({ status: "cancelled" });
      expect(whereTerms(cancel)).toEqual(
        expect.arrayContaining([5, "pending"]),
      );
      expect(eventTypes()).toEqual([
        "ownership_transfer_requested",
        "ownership_transfer_cancelled",
      ]);
      const cancelEvent = argOf(opsOf("insert", teamStaffEvents)[1], "values");
      expect(cancelEvent.payload).toMatchObject({
        transferId: 5,
        reason: "email_failed",
      });
    });
  }
});

describe("cancelOwnershipTransfer", () => {
  beforeEach(() => signIn("owner"));

  it("forbids non-owners", async () => {
    accessFor({ owner: staffOnlyAccess });

    const result = await cancelOwnershipTransfer({ teamId: 7 });

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
  });

  it("marks the pending request cancelled", async () => {
    accessFor({ owner: ownerAccess });
    queue("select", teams, [{ ownerId: "owner" }]);
    queue("select", T, [transferRow()]);

    const result = await cancelOwnershipTransfer({ teamId: 7 });

    expect(result).toEqual({ success: true, data: { cancelled: true } });
    expect(lockOf(opsOf("select", teams)[0])).toBe("no key update");
    expect(argOf(opsOf("update", T)[0], "set")).toMatchObject({
      status: "cancelled",
    });
    expect(eventTypes()).toEqual(["ownership_transfer_cancelled"]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/arena", "layout");
  });

  it("returns TRANSFER_NOT_FOUND without a pending request", async () => {
    accessFor({ owner: ownerAccess });
    queue("select", teams, [{ ownerId: "owner" }]);

    const result = await cancelOwnershipTransfer({ teamId: 7 });

    expect(result).toEqual({
      success: false,
      error: { code: "TRANSFER_NOT_FOUND" },
    });
  });
});

describe("acceptOwnershipTransfer", () => {
  /** Queues the reads of a successful accept by "target". */
  function happyPath(
    overrides: Record<string, unknown> = {},
    roster: unknown[] = [{ id: 1 }],
  ) {
    const row = transferRow(overrides);
    queue("select", T, [row], [row]);
    queue("select", userTable, [verified("target")], [{ planTier: "pro" }]);
    queue("select", teams, [{ ownerId: "owner" }], [{ teamCount: 0 }]);
    // Member-targeted requests first re-check the recipient's roster row.
    if (row.toUserId) queue("select", teamMembers, [{ id: 2 }], roster);
    else queue("select", teamMembers, roster);
    queue("update", T, [{ id: row.id }]);
  }

  beforeEach(() => signIn("target"));

  it("rejects another user", async () => {
    signIn("intruder");
    queue("select", T, [transferRow()]);
    queue("select", userTable, [verified("intruder")]);

    const result = await acceptOwnershipTransfer({ token: TOKEN });

    expect(result).toEqual({
      success: false,
      error: { code: "TRANSFER_NOT_FOR_YOU" },
    });
    expect(opsOf("update", teams)).toHaveLength(0);
  });

  it("looks the transfer up by token hash", async () => {
    happyPath();

    await acceptOwnershipTransfer({ token: TOKEN });

    const terms = whereTerms(opsOf("select", T)[0]);
    expect(terms).toContain(sha256(TOKEN));
    expect(terms).not.toContain(TOKEN);
  });

  it("requires a verified email for an email recipient", async () => {
    queue("select", T, [
      transferRow({ toUserId: null, toEmail: "target@example.com" }),
    ]);
    queue("select", userTable, [verified("target", { emailVerified: false })]);

    const result = await acceptOwnershipTransfer({ token: TOKEN });

    expect(result).toEqual({
      success: false,
      error: { code: "EMAIL_NOT_VERIFIED" },
    });
  });

  it("marks an expired request expired", async () => {
    const row = transferRow({ expiresAt: PAST });
    queue("select", T, [row], [row]);
    queue("select", userTable, [verified("target")], [{ planTier: "pro" }]);
    queue("select", teams, [{ ownerId: "owner" }]);
    queue("update", T, [{ id: 5 }]);

    const result = await acceptOwnershipTransfer({ token: TOKEN });

    expect(result).toEqual({
      success: false,
      error: { code: "TRANSFER_EXPIRED" },
    });
    expect(argOf(opsOf("update", T)[0], "set")).toMatchObject({
      status: "expired",
    });
    expect(eventTypes()).toEqual(["ownership_transfer_expired"]);
    expect(opsOf("update", teams)).toHaveLength(0);
  });

  it("refuses at the plan limit and leaves the request pending", async () => {
    const row = transferRow();
    queue("select", T, [row], [row]);
    queue("select", userTable, [verified("target")], [{ planTier: "free" }]);
    queue("select", teams, [{ ownerId: "owner" }], [{ teamCount: 99 }]);
    queue("select", teamMembers, [{ id: 2 }]);

    const result = await acceptOwnershipTransfer({ token: TOKEN });

    expect(result).toEqual({
      success: false,
      error: { code: "TEAM_LIMIT_REACHED" },
    });
    expect(opsOf("update", T)).toHaveLength(0);
    expect(opsOf("update", teams)).toHaveLength(0);
    expect(eventTypes()).toEqual([]);
  });

  it("transfers ownership in one transaction", async () => {
    happyPath();

    const result = await acceptOwnershipTransfer({ token: TOKEN });

    expect(result).toEqual({ success: true, data: { teamId: 7 } });
    expect(mocks.transaction).toHaveBeenCalledTimes(1);
    const writes = mocks.ops.filter(op => op.kind !== "select");
    expect(writes.every(op => op.inTx)).toBe(true);

    expect(argOf(opsOf("update", teams)[0], "set")).toMatchObject({
      ownerId: "target",
    });
    const staffDeletes = opsOf("delete", teamStaff).map(whereTerms);
    expect(staffDeletes.some(w => w.includes("target"))).toBe(true);
    expect(staffDeletes.some(w => w.includes("owner"))).toBe(true);
    expect(opsOf("delete", teamMembers)).toHaveLength(0);
    expect(opsOf("update", teamMembers)).toHaveLength(0);

    const payments = argOf(opsOf("update", teamPaymentSettings)[0], "set");
    expect(payments).toMatchObject({
      stripeEnabled: false,
      mbwayEnabled: false,
      transferEnabled: false,
    });
    expect(payments.payoutReconfigureRequiredAt).toBeInstanceOf(Date);
    expect(payments).not.toHaveProperty("cashEnabled");
    expect(payments).not.toHaveProperty("mbwayPhone");
    expect(payments).not.toHaveProperty("transferIban");

    // Old owner is still on the roster: sessions keep the team.
    expect(opsOf("update", session)).toHaveLength(0);

    expect(argOf(opsOf("update", T)[0], "set")).toMatchObject({
      status: "accepted",
      toUserId: "target",
    });
    expect(eventTypes()).toEqual(["ownership_transfer_accepted"]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/arena", "layout");
  });

  it("locks team, then recipient, then transfer before changing owner", async () => {
    happyPath();

    await acceptOwnershipTransfer({ token: TOKEN });

    const teamLock = opsOf("select", teams)[0];
    const userLock = opsOf("select", userTable).find(op => lockOf(op));
    const transferLock = opsOf("select", T).find(op => lockOf(op));
    expect(teamLock.inTx).toBe(true);
    // NO KEY UPDATE: FK inserts (KEY SHARE) referencing the team/user are
    // not blocked, so owner cancel / staff mutations cannot form a cycle.
    expect(lockOf(teamLock)).toBe("no key update");
    expect(userLock && lockOf(userLock)).toBe("no key update");
    expect(transferLock && lockOf(transferLock)).toBe("update");
    const at = (op: Op | undefined) => mocks.ops.indexOf(op as Op);
    const teamUpdate = at(opsOf("update", teams)[0]);
    expect(at(teamLock)).toBeLessThan(at(userLock));
    expect(at(userLock)).toBeLessThan(at(transferLock));
    expect(at(transferLock)).toBeLessThan(teamUpdate);
  });

  it("refuses when the recipient left the roster and staff", async () => {
    const row = transferRow();
    queue("select", T, [row], [row]);
    queue("select", userTable, [verified("target")], [{ planTier: "pro" }]);
    queue("select", teams, [{ ownerId: "owner" }]);

    const result = await acceptOwnershipTransfer({ token: TOKEN });

    expect(result).toEqual({
      success: false,
      error: { code: "RECIPIENT_NOT_MEMBER" },
    });
    expect(opsOf("select", teamStaff)).toHaveLength(1);
    expect(opsOf("update", T)).toHaveLength(0);
    expect(opsOf("update", teams)).toHaveLength(0);
    expect(eventTypes()).toEqual([]);
  });

  it("accepts a recipient who is staff but not on the roster", async () => {
    happyPath();
    queue("select", teamMembers, [], [{ id: 1 }]);
    queue("select", teamStaff, [{ id: 3 }]);

    const result = await acceptOwnershipTransfer({ token: TOKEN });

    expect(result).toEqual({ success: true, data: { teamId: 7 } });
  });

  it("rolls back when the accepted update does not hit exactly one row", async () => {
    happyPath();
    queue("update", T, []);

    await expect(acceptOwnershipTransfer({ token: TOKEN })).rejects.toThrow();
    expect(eventTypes()).toEqual([]);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("clears the old owner's session team when they are not on the roster", async () => {
    happyPath({}, []);

    const result = await acceptOwnershipTransfer({ token: TOKEN });

    expect(result.success).toBe(true);
    const [update] = opsOf("update", session);
    expect(argOf(update, "set")).toEqual({ teamId: null });
    const where = whereTerms(update);
    expect(where).toContain("owner");
    expect(where).toContain(7);
    expect(where).toContain("team_id");
  });

  it("accepts an email recipient with a verified email", async () => {
    happyPath({ toUserId: null, toEmail: "target@example.com" });

    const result = await acceptOwnershipTransfer({ token: TOKEN });

    expect(result).toEqual({ success: true, data: { teamId: 7 } });
    expect(argOf(opsOf("update", T)[0], "set")).toMatchObject({
      toUserId: "target",
    });
  });

  it("is idempotent once accepted by the same recipient", async () => {
    const row = transferRow({ status: "accepted" });
    queue("select", T, [row], [row]);
    queue("select", userTable, [verified("target")], [{ planTier: "pro" }]);
    queue("select", teams, [{ ownerId: "target" }]);

    const result = await acceptOwnershipTransfer({ token: TOKEN });

    expect(result).toEqual({ success: true, data: { teamId: 7 } });
    expect(mocks.ops.filter(op => op.kind !== "select")).toHaveLength(0);
  });

  it("returns TRANSFER_NOT_FOUND for an unknown token", async () => {
    const result = await acceptOwnershipTransfer({ token: TOKEN });

    expect(result).toEqual({
      success: false,
      error: { code: "TRANSFER_NOT_FOUND" },
    });
  });
});

describe("accept pre-launch gate", () => {
  beforeEach(() => signIn("target"));

  it("refuses a non-tester recipient before launch (token and id)", async () => {
    vi.stubEnv("APP_LAUNCHED", "false");
    mocks.isTesterEmail.mockResolvedValue(false);

    const byToken = await acceptOwnershipTransfer({ token: TOKEN });
    const byId = await acceptOwnershipTransferById({ transferId: 5 });

    for (const result of [byToken, byId]) {
      expect(result).toEqual({
        success: false,
        error: { code: "RECIPIENT_NOT_ELIGIBLE" },
      });
    }
    expect(mocks.isTesterEmail).toHaveBeenCalledWith("target@example.com");
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});

describe("acceptOwnershipTransferById", () => {
  it("rejects a non-recipient", async () => {
    signIn("intruder");
    queue("select", T, [transferRow()]);
    queue("select", userTable, [verified("intruder")]);

    const result = await acceptOwnershipTransferById({ transferId: 5 });

    expect(result).toEqual({
      success: false,
      error: { code: "TRANSFER_NOT_FOR_YOU" },
    });
    expect(opsOf("update", teams)).toHaveLength(0);
  });

  it("rejects an email match without verification", async () => {
    signIn("target");
    queue("select", T, [
      transferRow({ toUserId: null, toEmail: "target@example.com" }),
    ]);
    queue("select", userTable, [verified("target", { emailVerified: false })]);

    const result = await acceptOwnershipTransferById({ transferId: 5 });

    expect(result).toEqual({
      success: false,
      error: { code: "EMAIL_NOT_VERIFIED" },
    });
  });
});

describe("declineOwnershipTransfer", () => {
  it("marks the request cancelled and records the decline", async () => {
    signIn("target");
    const row = transferRow();
    queue("select", T, [row], [row]);
    queue("select", userTable, [verified("target")]);
    queue("update", T, [{ id: 5 }]);

    const result = await declineOwnershipTransfer({ token: TOKEN });

    expect(result).toEqual({ success: true, data: { declined: true } });
    expect(argOf(opsOf("update", T)[0], "set")).toMatchObject({
      status: "cancelled",
    });
    const [event] = opsOf("insert", teamStaffEvents).map(op =>
      argOf(op, "values"),
    );
    expect(event).toMatchObject({
      type: "ownership_transfer_cancelled",
      actorUserId: "target",
      payload: { transferId: 5, reason: "declined" },
    });
    expect(opsOf("update", teams)).toHaveLength(0);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/arena", "layout");
  });

  it("rejects another user", async () => {
    signIn("intruder");
    queue("select", T, [transferRow()]);
    queue("select", userTable, [verified("intruder")]);

    const result = await declineOwnershipTransfer({ token: TOKEN });

    expect(result).toEqual({
      success: false,
      error: { code: "TRANSFER_NOT_FOR_YOU" },
    });
  });
});

describe("getTransferByToken", () => {
  beforeEach(() => signIn("target"));

  it("returns the public details", async () => {
    queue("select", T, [
      {
        transfer: transferRow(),
        teamName: "Os Craques",
        fromName: "Dono",
      },
    ]);

    const result = await getTransferByToken({ token: TOKEN });

    expect(result).toEqual({
      success: true,
      data: {
        teamName: "Os Craques",
        fromName: "Dono",
        expiresAt: FUTURE,
        status: "pending",
      },
    });
    expect(JSON.stringify(result)).not.toContain(sha256(TOKEN));
  });

  it("marks an expired pending row expired", async () => {
    const row = transferRow({ expiresAt: PAST });
    queue(
      "select",
      T,
      [{ transfer: row, teamName: "Os Craques", fromName: "Dono" }],
      [row],
    );
    queue("update", T, [{ id: 5 }]);

    const result = await getTransferByToken({ token: TOKEN });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("expired");
    expect(argOf(opsOf("update", T)[0], "set")).toMatchObject({
      status: "expired",
    });
    expect(eventTypes()).toEqual(["ownership_transfer_expired"]);
  });

  it("returns TRANSFER_NOT_FOUND for an unknown token", async () => {
    const result = await getTransferByToken({ token: TOKEN });

    expect(result).toEqual({
      success: false,
      error: { code: "TRANSFER_NOT_FOUND" },
    });
  });
});

describe("getPendingTransfer", () => {
  it("is owner-only", async () => {
    signIn("someone");
    accessFor({ someone: athleteAccess });

    const result = await getPendingTransfer({ teamId: 7 });

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
  });

  it("returns the pending request without the token hash", async () => {
    signIn("owner");
    accessFor({ owner: ownerAccess });
    queue("select", T, [{ transfer: transferRow(), toName: "Alvo" }]);

    const result = await getPendingTransfer({ teamId: 7 });

    expect(result).toEqual({
      success: true,
      data: {
        transferId: 5,
        toUserId: "target",
        toName: "Alvo",
        toEmail: null,
        expiresAt: FUTURE,
      },
    });
  });
});

describe("getMyIncomingTransfers", () => {
  it("locks stale rows in ascending id order", async () => {
    signIn("target");
    const a = transferRow({ id: 9, teamId: 8, expiresAt: PAST });
    const b = transferRow({ id: 6, teamId: 9, expiresAt: PAST });
    queue("select", userTable, [verified("target")]);
    queue(
      "select",
      T,
      [
        { transfer: a, teamName: "A", fromName: "X" },
        { transfer: b, teamName: "B", fromName: "Y" },
      ],
      [b],
      [a],
    );

    await getMyIncomingTransfers();

    const locked = opsOf("select", T)
      .filter(op => lockOf(op) === "update")
      .map(op => whereTerms(op).find(v => typeof v === "number"));
    expect(locked).toEqual([6, 9]);
  });

  it("lists pending transfers and expires stale ones", async () => {
    signIn("target");
    const fresh = transferRow();
    const stale = transferRow({ id: 6, teamId: 8, expiresAt: PAST });
    queue("select", userTable, [verified("target")]);
    queue(
      "select",
      T,
      [
        { transfer: fresh, teamName: "Os Craques", fromName: "Dono" },
        { transfer: stale, teamName: "Velhos", fromName: "Outro" },
      ],
      [stale],
    );
    queue("update", T, [{ id: 6 }]);

    const result = await getMyIncomingTransfers();

    expect(result).toEqual({
      success: true,
      data: [
        {
          transferId: 5,
          teamName: "Os Craques",
          fromName: "Dono",
          expiresAt: FUTURE,
        },
      ],
    });
    expect(eventTypes()).toEqual(["ownership_transfer_expired"]);
  });
});
