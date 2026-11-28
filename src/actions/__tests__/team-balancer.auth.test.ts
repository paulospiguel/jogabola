import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  can: vi.fn(),
  getAuthUser: vi.fn(),
  matchSessionFindFirst: vi.fn(),
  getEventAttendanceWithUsers: vi.fn(),
  getRatingsForUsers: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  db: {
    query: {
      matchSessions: { findFirst: mocks.matchSessionFindFirst },
    },
  },
}));
vi.mock("@/lib/action-helpers", () => ({ getAuthUser: mocks.getAuthUser }));
vi.mock("@/lib/team-authz", () => ({ can: mocks.can }));
vi.mock("@/actions/attendance.actions", () => ({
  getEventAttendanceWithUsers: mocks.getEventAttendanceWithUsers,
}));
vi.mock("@/actions/player-ratings.actions", () => ({
  getRatingsForUsers: mocks.getRatingsForUsers,
}));

const { balanceTeamsWithAI } = await import("@/actions/team-balancer.actions");

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAuthUser.mockResolvedValue({
    id: "user-1",
    name: "User",
    email: "user@example.com",
    teamId: null,
  });
  mocks.matchSessionFindFirst.mockResolvedValue({ teamId: 3 });
});

describe("team balancer authorization", () => {
  it("rejects balanceTeamsWithAI without a session", async () => {
    mocks.getAuthUser.mockResolvedValue(null);

    const result = await balanceTeamsWithAI(9, []);

    expect(result).toEqual({
      success: false,
      error: { code: "UNAUTHORIZED" },
    });
    expect(mocks.getEventAttendanceWithUsers).not.toHaveBeenCalled();
  });

  it("rejects balanceTeamsWithAI without match.manage", async () => {
    mocks.can.mockResolvedValue(false);

    const result = await balanceTeamsWithAI(9, []);

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
    expect(mocks.can).toHaveBeenCalledWith("user-1", 3, "match.manage");
    expect(mocks.getEventAttendanceWithUsers).not.toHaveBeenCalled();
  });

  it("balances teams with match.manage", async () => {
    mocks.can.mockResolvedValue(true);
    mocks.getEventAttendanceWithUsers.mockResolvedValue({
      success: true,
      data: {
        confirmed: [
          { id: "p1", name: "A", image: null },
          { id: "p2", name: "B", image: null },
        ],
      },
    });
    mocks.getRatingsForUsers.mockResolvedValue(new Map([["p1", 8]]));

    const result = await balanceTeamsWithAI(9, []);

    expect(result.success).toBe(true);
    expect(mocks.getEventAttendanceWithUsers).toHaveBeenCalledWith(9);
  });
});
