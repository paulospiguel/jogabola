import { beforeEach, describe, expect, it, vi } from "vitest";
import { teamMembers, teamStaff, teamStaffEvents } from "@/db/schema";

type Call = { method: string; args: unknown[] };
type Op = { kind: string; table: unknown; calls: Call[] };

const mocks = vi.hoisted(() => {
  const ops: Op[] = [];
  const results = {
    insert: new Map<unknown, unknown[][]>(),
    delete: new Map<unknown, unknown[][]>(),
    update: new Map<unknown, unknown[][]>(),
    select: [] as unknown[][],
  };

  function chain(kind: string, table: unknown, result: unknown) {
    const op: Op = { kind, table, calls: [] };
    ops.push(op);
    const proxy: unknown = new Proxy(
      {},
      {
        get(_target, prop) {
          if (prop === "then") {
            return (
              resolve: (v: unknown) => unknown,
              reject: (e: unknown) => unknown,
            ) => Promise.resolve(result).then(resolve, reject);
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

  function next(map: Map<unknown, unknown[][]>, table: unknown) {
    const queue = map.get(table);
    return queue?.length ? queue.shift() : [];
  }

  const exec = {
    insert: vi.fn((table: unknown) =>
      chain("insert", table, next(results.insert, table)),
    ),
    delete: vi.fn((table: unknown) =>
      chain("delete", table, next(results.delete, table)),
    ),
    update: vi.fn((table: unknown) =>
      chain("update", table, next(results.update, table)),
    ),
    select: vi.fn(() => chain("select", null, results.select.shift() ?? [])),
  };

  return {
    ops,
    results,
    exec,
    transaction: vi.fn(async (fn: (tx: typeof exec) => unknown) => fn(exec)),
    teamsFindFirst: vi.fn(),
    getTeamAccess: vi.fn(),
    getSession: vi.fn(),
    revalidatePath: vi.fn(),
  };
});

vi.mock("@/db/client", () => ({
  db: {
    ...mocks.exec,
    transaction: mocks.transaction,
    query: {
      teams: { findFirst: mocks.teamsFindFirst },
    },
  },
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
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/analytics-server", () => ({ trackServerEvent: vi.fn() }));

const {
  demoteStaff,
  getTeamStaff,
  promoteToStaff,
  setMyAthleteStatus,
  updateStaffMember,
} = await import("@/actions/team-staff.actions");
const { createTeam } = await import("@/actions/teams.actions");

const base = {
  teamExists: true,
  isOwner: false,
  isAthlete: false,
  staff: null,
};
const ownerAccess = { ...base, isOwner: true };
const athleteAccess = { ...base, isAthlete: true };
const staffAccess = {
  ...base,
  isAthlete: true,
  staff: { title: "coach", permissions: ["events.manage"] },
};
const staffOnlyAccess = { ...staffAccess, isAthlete: false };

/** Access by user id; "actor" is the session user. */
function accessFor(map: Record<string, unknown>) {
  mocks.getTeamAccess.mockImplementation(async (userId: string) => {
    return map[userId] ?? base;
  });
}

function opsOf(kind: string, table: unknown) {
  return mocks.ops.filter(op => op.kind === kind && op.table === table);
}

function valuesOf(op: Op) {
  return op.calls.find(c => c.method === "values")?.args[0] as Record<
    string,
    unknown
  >;
}

function eventTypes() {
  return opsOf("insert", teamStaffEvents).map(op => valuesOf(op).type);
}

function queue(
  map: Map<unknown, unknown[][]>,
  table: unknown,
  ...rows: unknown[][]
) {
  map.set(table, rows);
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.ops.length = 0;
  mocks.results.insert.clear();
  mocks.results.delete.clear();
  mocks.results.update.clear();
  mocks.results.select.length = 0;
  mocks.getSession.mockResolvedValue({
    session: {},
    user: { id: "actor", name: "Actor", email: "actor@example.com" },
  });
});

describe("createTeam", () => {
  it("does not insert the owner into the roster", async () => {
    mocks.results.select.push([{ planTier: "free" }], [{ teamCount: 0 }]);
    mocks.teamsFindFirst.mockResolvedValue(undefined);
    queue(mocks.results.insert, (await import("@/db/schema")).teams, [
      { id: 42, name: "Os Craques" },
    ]);

    const result = await createTeam({ name: "Os Craques", slug: "os-craques" });

    expect(result.success).toBe(true);
    expect(opsOf("insert", teamMembers)).toHaveLength(0);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/arena", "layout");
  });
});

describe("promoteToStaff", () => {
  const input = {
    teamId: 7,
    userId: "target",
    title: "coach",
    permissions: ["events.manage", "events.manage", "match.manage"],
  };

  it("forbids non-owners", async () => {
    accessFor({ actor: staffAccess, target: athleteAccess });

    const result = await promoteToStaff(input);

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("returns TEAM_NOT_FOUND for a missing team", async () => {
    mocks.getTeamAccess.mockResolvedValue({ ...base, teamExists: false });

    const result = await promoteToStaff(input);

    expect(result).toEqual({
      success: false,
      error: { code: "TEAM_NOT_FOUND" },
    });
  });

  it("rejects a target outside the roster", async () => {
    accessFor({ actor: ownerAccess, target: base });

    const result = await promoteToStaff(input);

    expect(result).toEqual({
      success: false,
      error: { code: "NOT_AN_ATHLETE" },
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("rejects promoting the owner", async () => {
    accessFor({
      actor: ownerAccess,
      target: { ...ownerAccess, isAthlete: true },
    });

    const result = await promoteToStaff({ ...input, userId: "actor" });

    expect(result).toEqual({
      success: false,
      error: { code: "CANNOT_MODIFY_OWNER" },
    });
  });

  it("inserts a staff row and records a promoted event", async () => {
    accessFor({ actor: ownerAccess, target: athleteAccess });
    queue(mocks.results.insert, teamStaff, [{ id: 1 }]);

    const result = await promoteToStaff(input);

    expect(result).toEqual({ success: true, data: { userId: "target" } });
    const [insert] = opsOf("insert", teamStaff);
    expect(valuesOf(insert)).toMatchObject({
      teamId: 7,
      userId: "target",
      title: "coach",
      permissions: ["events.manage", "match.manage"],
      createdBy: "actor",
    });
    expect(insert.calls.some(c => c.method === "onConflictDoNothing")).toBe(
      true,
    );
    expect(eventTypes()).toEqual(["promoted"]);
    expect(valuesOf(opsOf("insert", teamStaffEvents)[0])).toMatchObject({
      teamId: 7,
      actorUserId: "actor",
      subjectUserId: "target",
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/arena", "layout");
  });

  it("is idempotent when called twice", async () => {
    accessFor({ actor: ownerAccess, target: athleteAccess });
    queue(mocks.results.insert, teamStaff, [{ id: 1 }], []);

    const first = await promoteToStaff(input);
    const second = await promoteToStaff(input);

    expect(first.success).toBe(true);
    expect(second).toEqual({ success: true, data: { userId: "target" } });
    expect(
      opsOf("insert", teamStaff).every(op =>
        op.calls.some(c => c.method === "onConflictDoNothing"),
      ),
    ).toBe(true);
    expect(eventTypes()).toEqual(["promoted"]);
  });
});

describe("demoteStaff", () => {
  it("deletes only the staff row and records demoted", async () => {
    accessFor({ actor: ownerAccess, target: staffAccess });
    queue(mocks.results.delete, teamStaff, [
      { title: "coach", permissions: ["events.manage"] },
    ]);

    const result = await demoteStaff({ teamId: 7, userId: "target" });

    expect(result).toEqual({ success: true, data: { userId: "target" } });
    expect(opsOf("delete", teamStaff)).toHaveLength(1);
    expect(opsOf("delete", teamMembers)).toHaveLength(0);
    expect(eventTypes()).toEqual(["demoted"]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/arena", "layout");
  });

  it("returns NOT_STAFF when the target is not staff", async () => {
    accessFor({ actor: ownerAccess, target: athleteAccess });
    queue(mocks.results.delete, teamStaff, []);

    const result = await demoteStaff({ teamId: 7, userId: "target" });

    expect(result).toEqual({ success: false, error: { code: "NOT_STAFF" } });
    expect(eventTypes()).toEqual([]);
  });

  it("forbids non-owners", async () => {
    accessFor({ actor: staffAccess, target: staffAccess });

    const result = await demoteStaff({ teamId: 7, userId: "target" });

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});

describe("updateStaffMember", () => {
  it("rejects permissions outside the catalog", async () => {
    accessFor({ actor: ownerAccess, target: staffAccess });

    const result = await updateStaffMember({
      teamId: 7,
      userId: "target",
      permissions: ["billing.manage"],
    });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.code).toBe("VALIDATION_ERROR");
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("records title_changed and permissions_changed with before/after", async () => {
    accessFor({ actor: ownerAccess, target: staffAccess });
    mocks.results.select.push([
      { title: "coach", permissions: ["events.manage"] },
    ]);

    const result = await updateStaffMember({
      teamId: 7,
      userId: "target",
      title: "finance",
      permissions: ["payments.manage"],
    });

    expect(result).toEqual({ success: true, data: { userId: "target" } });
    expect(opsOf("update", teamStaff)).toHaveLength(1);
    const events = opsOf("insert", teamStaffEvents).map(valuesOf);
    expect(events.map(e => e.type).sort()).toEqual([
      "permissions_changed",
      "title_changed",
    ]);
    expect(events.find(e => e.type === "title_changed")?.payload).toEqual({
      before: "coach",
      after: "finance",
    });
    expect(events.find(e => e.type === "permissions_changed")?.payload).toEqual(
      { before: ["events.manage"], after: ["payments.manage"] },
    );
  });

  it("returns NOT_STAFF when the target has no staff row", async () => {
    accessFor({ actor: ownerAccess, target: athleteAccess });
    mocks.results.select.push([]);

    const result = await updateStaffMember({
      teamId: 7,
      userId: "target",
      title: "coach",
    });

    expect(result).toEqual({ success: false, error: { code: "NOT_STAFF" } });
  });
});

describe("setMyAthleteStatus", () => {
  it("opting in twice keeps one roster row", async () => {
    accessFor({ actor: ownerAccess });
    queue(mocks.results.insert, teamMembers, [{ id: 1 }], []);

    const first = await setMyAthleteStatus({ teamId: 7, isAthlete: true });
    const second = await setMyAthleteStatus({ teamId: 7, isAthlete: true });

    expect(first).toEqual({ success: true, data: { isAthlete: true } });
    expect(second).toEqual({ success: true, data: { isAthlete: true } });
    const inserts = opsOf("insert", teamMembers);
    expect(inserts).toHaveLength(2);
    expect(
      inserts.every(op =>
        op.calls.some(c => c.method === "onConflictDoNothing"),
      ),
    ).toBe(true);
    expect(valuesOf(inserts[0])).toMatchObject({
      teamId: 7,
      playerId: "actor",
      role: "player",
    });
    expect(eventTypes()).toEqual(["athlete_opt_in"]);
  });

  it("opting out deletes only the caller's roster row", async () => {
    accessFor({ actor: staffAccess });
    queue(mocks.results.delete, teamMembers, [{ id: 1 }]);

    const result = await setMyAthleteStatus({ teamId: 7, isAthlete: false });

    expect(result).toEqual({ success: true, data: { isAthlete: false } });
    expect(opsOf("delete", teamMembers)).toHaveLength(1);
    expect(opsOf("delete", teamStaff)).toHaveLength(0);
    expect(eventTypes()).toEqual(["athlete_opt_out"]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/arena", "layout");
  });

  it("forbids a plain athlete", async () => {
    accessFor({ actor: athleteAccess });

    const result = await setMyAthleteStatus({ teamId: 7, isAthlete: false });

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
    expect(mocks.transaction).not.toHaveBeenCalled();
  });
});

describe("getTeamStaff", () => {
  it("forbids a plain athlete", async () => {
    accessFor({ actor: athleteAccess });

    const result = await getTeamStaff({ teamId: 7 });

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
  });

  it("lists the owner first with all permissions, then staff", async () => {
    accessFor({ actor: staffOnlyAccess });
    mocks.results.select.push(
      [{ userId: "owner", name: "Dono", image: null }],
      [
        {
          userId: "actor",
          name: "Actor",
          image: "a.png",
          title: "coach",
          permissions: ["events.manage"],
        },
      ],
      [{ playerId: "owner" }],
    );

    const result = await getTeamStaff({ teamId: 7 });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data[0]).toMatchObject({
      userId: "owner",
      title: "owner",
      isAthlete: true,
    });
    expect(result.data[0].permissions).toHaveLength(6);
    expect(result.data[1]).toEqual({
      userId: "actor",
      name: "Actor",
      image: "a.png",
      title: "coach",
      permissions: ["events.manage"],
      isAthlete: false,
    });
  });
});
