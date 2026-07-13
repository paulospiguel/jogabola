import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  canManageTeam: vi.fn(),
  getSession: vi.fn(),
  insert: vi.fn(),
  matchSessionFindFirst: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  db: {
    insert: mocks.insert,
    query: {
      matchSessions: { findFirst: mocks.matchSessionFindFirst },
    },
  },
}));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/team-access", () => ({
  canManageTeam: mocks.canManageTeam,
}));
vi.mock("@/lib/event-roster-access", () => ({
  userBelongsToTeamRoster: vi.fn(),
}));
vi.mock("@/lib/fines", () => ({ hasPendingFines: vi.fn() }));
vi.mock("@/lib/analytics-server", () => ({ trackServerEvent: vi.fn() }));

const { managerBlockParticipant, managerRemoveParticipant, upsertAttendance } =
  await import("@/actions/attendance.actions");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("attendance authorization", () => {
  it("rejects upsertAttendance without a session", async () => {
    mocks.getSession.mockResolvedValue(null);

    const result = await upsertAttendance({
      matchSessionId: 4,
      playerId: "user-1",
      status: "available",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "UNAUTHORIZED" },
    });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("allows a user to upsert their own attendance", async () => {
    mocks.getSession.mockResolvedValue({
      session: {},
      user: { id: "user-1", name: "User", email: "user@example.com" },
    });
    const returning = vi.fn().mockResolvedValue([{ id: 10 }]);
    const onConflictDoUpdate = vi.fn(() => ({ returning }));
    const values = vi.fn(() => ({ onConflictDoUpdate }));
    mocks.insert.mockReturnValue({ values });

    const result = await upsertAttendance({
      matchSessionId: 4,
      playerId: "user-1",
      status: "available",
    });

    expect(result.success).toBe(true);
  });

  it("rejects attendance changes for another player from a non-manager", async () => {
    mocks.getSession.mockResolvedValue({
      session: {},
      user: { id: "user-1", name: "User", email: "user@example.com" },
    });
    mocks.matchSessionFindFirst.mockResolvedValue({ teamId: 2 });
    mocks.canManageTeam.mockResolvedValue(false);

    const result = await upsertAttendance({
      matchSessionId: 4,
      playerId: "user-2",
      status: "available",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "FORBIDDEN" },
    });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("rejects managerRemoveParticipant for a non-manager", async () => {
    mocks.getSession.mockResolvedValue({
      session: {},
      user: { id: "user-1", name: "User", email: "user@example.com" },
    });
    mocks.matchSessionFindFirst.mockResolvedValue({ teamId: 2 });
    mocks.canManageTeam.mockResolvedValue(false);

    const result = await managerRemoveParticipant(4, "user-2");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Sem permissão");
  });

  it("rejects managerBlockParticipant for a non-manager", async () => {
    mocks.getSession.mockResolvedValue({
      session: {},
      user: { id: "user-1", name: "User", email: "user@example.com" },
    });
    mocks.matchSessionFindFirst.mockResolvedValue({
      teamId: 2,
      priceCents: 500,
    });
    mocks.canManageTeam.mockResolvedValue(false);

    const result = await managerBlockParticipant(4, "user-2");

    expect(result.success).toBe(false);
    expect(result.error).toContain("Sem permissão");
  });
});
