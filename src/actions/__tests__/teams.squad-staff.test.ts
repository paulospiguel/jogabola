import { beforeEach, describe, expect, it, vi } from "vitest";
import { playerRatings, players, teamMembers, teamStaff } from "@/db/schema";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  canViewTeam: vi.fn(),
  select: vi.fn(),
  rowsByTable: new Map<unknown, unknown[]>(),
  fromCalls: [] as unknown[],
}));

/** Thenable query chain that resolves to the rows of the `from` table. */
function chainFor(table: unknown) {
  const rows = mocks.rowsByTable.get(table) ?? [];
  const chain: Record<string, unknown> = {
    innerJoin: () => chain,
    where: () => chain,
    // biome-ignore lint/suspicious/noThenProperty: drizzle queries are thenable
    then: (resolve: (value: unknown[]) => unknown) => resolve(rows),
  };
  return chain;
}

vi.mock("@/db/client", () => ({
  db: {
    select: (...args: unknown[]) => {
      mocks.select(...args);
      return {
        from: (table: unknown) => {
          mocks.fromCalls.push(table);
          return chainFor(table);
        },
      };
    },
  },
}));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/team-authz", () => ({
  can: vi.fn(),
  getTeamAccess: vi.fn(),
  isTeamOwner: vi.fn(),
  canViewTeam: mocks.canViewTeam,
  getAccessibleTeamIds: vi.fn(),
}));
vi.mock("@/lib/email", () => ({ sendEmail: vi.fn() }));
vi.mock("@/lib/analytics-server", () => ({ trackServerEvent: vi.fn() }));

const { getTeamSquad } = await import("@/actions/teams.actions");

const member = (id: string) => ({
  id,
  name: id,
  email: `${id}@example.com`,
  image: null,
  position: null,
  role: "player",
  status: "new",
  isVerified: true,
  createdAt: null,
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.fromCalls.length = 0;
  mocks.rowsByTable.clear();
  mocks.getSession.mockResolvedValue({
    session: {},
    user: { id: "actor", name: "Actor", email: "actor@example.com" },
  });
  mocks.canViewTeam.mockResolvedValue(true);
});

describe("getTeamSquad staff titles", () => {
  it("adds staffTitle for registered staff with a single team_staff query", async () => {
    mocks.rowsByTable.set(teamMembers, [member("coach"), member("athlete")]);
    mocks.rowsByTable.set(players, [{ ...member("guest"), isVerified: false }]);
    mocks.rowsByTable.set(playerRatings, []);
    mocks.rowsByTable.set(teamStaff, [
      { userId: "coach", title: "coach" },
      { userId: "legacy", title: "bogus" },
    ]);

    const result = await getTeamSquad({ teamId: 7 });

    expect(result.success).toBe(true);
    if (!result.success) return;
    const byId = new Map(result.data.map(row => [row.id, row.staffTitle]));
    expect(byId.get("coach")).toBe("coach");
    expect(byId.get("athlete")).toBeNull();
    expect(byId.get("guest")).toBeNull();
    expect(mocks.fromCalls.filter(table => table === teamStaff)).toHaveLength(
      1,
    );
  });

  it("maps an unknown stored title to other", async () => {
    mocks.rowsByTable.set(teamMembers, [member("legacy")]);
    mocks.rowsByTable.set(players, []);
    mocks.rowsByTable.set(playerRatings, []);
    mocks.rowsByTable.set(teamStaff, [{ userId: "legacy", title: "bogus" }]);

    const result = await getTeamSquad({ teamId: 7 });

    expect(result.success && result.data[0].staffTitle).toBe("other");
  });
});
