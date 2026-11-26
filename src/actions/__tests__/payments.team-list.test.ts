import { PgDialect } from "drizzle-orm/pg-core";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  canManageTeam: vi.fn(),
  getSession: vi.fn(),
  userCanAccessTeam: vi.fn(),
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
vi.mock("@/lib/team-access", () => ({
  canManageTeam: mocks.canManageTeam,
  userCanAccessTeam: mocks.userCanAccessTeam,
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
    mocks.userCanAccessTeam.mockResolvedValue(false);

    await expect(getTeamPayments({ teamId: 7 })).resolves.toEqual({
      success: false,
      error: { code: "TEAM_NOT_FOUND" },
    });
    expect(mocks.whereArgs).toHaveLength(0);
  });

  it("lets a manager list the whole team's payments", async () => {
    mocks.userCanAccessTeam.mockResolvedValue(true);
    mocks.canManageTeam.mockResolvedValue(true);

    const result = await getTeamPayments({ teamId: 7 });

    expect(result.success).toBe(true);
    expect(paramsOfLastWhere()).toEqual([7]);
  });

  it("limits a plain roster member to their own payments", async () => {
    mocks.userCanAccessTeam.mockResolvedValue(true);
    mocks.canManageTeam.mockResolvedValue(false);

    const result = await getTeamPayments({ teamId: 7 });

    expect(result.success).toBe(true);
    expect(paramsOfLastWhere()).toEqual([7, "user-1"]);
  });
});
