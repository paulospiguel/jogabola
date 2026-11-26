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
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/team-access", () => ({
  canManageTeam: mocks.canManageTeam,
  getAccessibleTeamIds: vi.fn(),
  userCanAccessTeam: vi.fn(),
}));
vi.mock("@/lib/analytics-server", () => ({ trackServerEvent: vi.fn() }));

const { createMatchReservation, createMatchSession } = await import(
  "@/actions/match-sessions.actions"
);

const signedIn = {
  session: {},
  user: { id: "user-1", name: "User", email: "user@example.com" },
};

const sessionInput = {
  teamId: 2,
  title: "Jogo de sábado",
  location: "Lisboa",
  startsAt: "2026-12-05T10:00:00Z",
};

const reservationInput = { matchSessionId: 4, playerId: "user-2" };

function mockInsertReturning(row: Record<string, unknown>) {
  const returning = vi.fn().mockResolvedValue([row]);
  const values = vi.fn(() => ({ returning }));
  mocks.insert.mockReturnValue({ values });
  return values;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createMatchSession authorization", () => {
  it("rejects a request without a session", async () => {
    mocks.getSession.mockResolvedValue(null);

    const result = await createMatchSession(sessionInput);

    expect(result).toEqual({ success: false, error: { code: "UNAUTHORIZED" } });
    expect(mocks.canManageTeam).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("rejects a user who cannot manage the team", async () => {
    mocks.getSession.mockResolvedValue(signedIn);
    mocks.canManageTeam.mockResolvedValue(false);

    const result = await createMatchSession(sessionInput);

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
    expect(mocks.canManageTeam).toHaveBeenCalledWith("user-1", 2);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("creates the session for a team manager", async () => {
    mocks.getSession.mockResolvedValue(signedIn);
    mocks.canManageTeam.mockResolvedValue(true);
    const values = mockInsertReturning({ id: 9, teamId: 2 });

    const result = await createMatchSession(sessionInput);

    expect(result).toEqual({ success: true, data: { id: 9, teamId: 2 } });
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ teamId: 2, title: "Jogo de sábado" }),
    );
  });
});

describe("createMatchReservation authorization", () => {
  it("rejects a request without a session", async () => {
    mocks.getSession.mockResolvedValue(null);

    const result = await createMatchReservation(reservationInput);

    expect(result).toEqual({ success: false, error: { code: "UNAUTHORIZED" } });
    expect(mocks.matchSessionFindFirst).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("answers an unknown match session like a forbidden one", async () => {
    mocks.getSession.mockResolvedValue(signedIn);
    mocks.matchSessionFindFirst.mockResolvedValue(undefined);

    const result = await createMatchReservation(reservationInput);

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
    expect(mocks.canManageTeam).not.toHaveBeenCalled();
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("checks management rights on the persisted session's team", async () => {
    mocks.getSession.mockResolvedValue(signedIn);
    mocks.matchSessionFindFirst.mockResolvedValue({ teamId: 7 });
    mocks.canManageTeam.mockResolvedValue(false);

    const result = await createMatchReservation(reservationInput);

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
    expect(mocks.canManageTeam).toHaveBeenCalledWith("user-1", 7);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("creates the reservation for a manager of the session's team", async () => {
    mocks.getSession.mockResolvedValue(signedIn);
    mocks.matchSessionFindFirst.mockResolvedValue({ teamId: 7 });
    mocks.canManageTeam.mockResolvedValue(true);
    mockInsertReturning({ id: 11, matchSessionId: 4 });

    const result = await createMatchReservation(reservationInput);

    expect(result).toEqual({
      success: true,
      data: { id: 11, matchSessionId: 4 },
    });
  });
});
