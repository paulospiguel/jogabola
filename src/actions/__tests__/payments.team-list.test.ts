import { PgDialect } from "drizzle-orm/pg-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  can: vi.fn(),
  canViewTeam: vi.fn(),
  getSession: vi.fn(),
  whereArgs: [] as unknown[],
}));

vi.mock("@/db/client", () => {
  const chain = {
    from: vi.fn(() => chain),
    innerJoin: vi.fn(() => chain),
    leftJoin: vi.fn(() => chain),
    orderBy: vi.fn(async () => []),
    where: vi.fn((condition: unknown) => {
      mocks.whereArgs.push(condition);
      return chain;
    }),
  };
  return { db: { select: vi.fn(() => chain) } };
});
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/team-authz", () => ({
  can: mocks.can,
  canViewTeam: mocks.canViewTeam,
}));

const { getTeamPayments } = await import(
  "@/actions/payments/payment-queries.actions"
);

const dialect = new PgDialect();

function paramsOfLastWhere() {
  const condition = mocks.whereArgs.at(-1) as Parameters<
    typeof dialect.sqlToQuery
  >[0];
  return dialect.sqlToQuery(condition).params;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.whereArgs.length = 0;
  mocks.getSession.mockResolvedValue({
    session: {},
    user: { id: "user-1", name: "User", email: "user-1@example.test" },
  });
});

describe("getTeamPayments data minimisation", () => {
  it("hides teams the user cannot access", async () => {
    mocks.canViewTeam.mockResolvedValue(false);

    await expect(getTeamPayments({ teamId: 7 })).resolves.toEqual({
      success: false,
      error: { code: "TEAM_NOT_FOUND" },
    });
    expect(mocks.whereArgs).toHaveLength(0);
  });

  it("lets the owner or staff with payments.manage list the whole team's payments", async () => {
    mocks.canViewTeam.mockResolvedValue(true);
    mocks.can.mockResolvedValue(true);

    const result = await getTeamPayments({ teamId: 7 });

    expect(result.success).toBe(true);
    expect(mocks.can).toHaveBeenCalledWith("user-1", 7, "payments.manage");
    expect(paramsOfLastWhere()).toEqual([7]);
  });

  it("limits a plain athlete or other staff to their own payments", async () => {
    mocks.canViewTeam.mockResolvedValue(true);
    mocks.can.mockResolvedValue(false);

    const result = await getTeamPayments({ teamId: 7 });

    expect(result.success).toBe(true);
    expect(paramsOfLastWhere()).toEqual([7, "user-1"]);
  });
});
