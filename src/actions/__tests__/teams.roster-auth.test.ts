import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  canManageTeam: vi.fn(),
  getSession: vi.fn(),
  insert: vi.fn(),
  playersFindFirst: vi.fn(),
  teamFindFirst: vi.fn(),
  teamMembersFindFirst: vi.fn(),
  userCanAccessTeam: vi.fn(),
  userFindFirst: vi.fn(),
  userIsTeamOwner: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  db: {
    insert: mocks.insert,
    query: {
      players: { findFirst: mocks.playersFindFirst },
      teamMembers: { findFirst: mocks.teamMembersFindFirst },
      teams: { findFirst: mocks.teamFindFirst },
      user: { findFirst: mocks.userFindFirst },
    },
  },
}));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/team-access", () => ({
  canManageTeam: mocks.canManageTeam,
  userCanAccessTeam: mocks.userCanAccessTeam,
  userIsTeamOwner: mocks.userIsTeamOwner,
}));
vi.mock("@/lib/analytics-server", () => ({ trackServerEvent: vi.fn() }));
vi.mock("@/lib/email", () => ({ sendEmail: mocks.sendEmail }));

const { addPlayerToRoster, addTeamMember, sendRosterPlayerEmail } =
  await import("@/actions/teams.actions");

function signIn(id = "user-1") {
  mocks.getSession.mockResolvedValue({
    session: {},
    user: { id, name: "User", email: `${id}@example.test` },
  });
}

function mockInsertReturning(row: unknown) {
  const returning = vi.fn().mockResolvedValue([row]);
  const onConflictDoUpdate = vi.fn(() => ({ returning }));
  const values = vi.fn(() => ({ onConflictDoUpdate, returning }));
  mocks.insert.mockReturnValue({ values });
  return values;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("addTeamMember authorization", () => {
  const input = { teamId: 7, playerId: "player-9", role: "player" };

  it("rejects calls without a session", async () => {
    mocks.getSession.mockResolvedValue(null);

    await expect(addTeamMember(input)).resolves.toEqual({
      success: false,
      error: { code: "UNAUTHORIZED" },
    });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("rejects a non-owner, including a co-captain", async () => {
    signIn("manager-1");
    mocks.teamFindFirst.mockResolvedValue({ ownerId: "owner-1" });

    await expect(addTeamMember(input)).resolves.toEqual({
      success: false,
      error: { code: "FORBIDDEN" },
    });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("never grants the owner role through the roster", async () => {
    signIn("owner-1");
    mocks.teamFindFirst.mockResolvedValue({ ownerId: "owner-1" });

    await expect(addTeamMember({ ...input, role: "owner" })).resolves.toEqual({
      success: false,
      error: { code: "FORBIDDEN" },
    });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("never rewrites the owner's own roster row", async () => {
    signIn("owner-1");
    mocks.teamFindFirst.mockResolvedValue({ ownerId: "owner-1" });

    await expect(
      addTeamMember({ ...input, playerId: "owner-1" }),
    ).resolves.toEqual({
      success: false,
      error: { code: "CANNOT_MODIFY_OWNER" },
    });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("returns TEAM_NOT_FOUND for an unknown team", async () => {
    signIn("owner-1");
    mocks.teamFindFirst.mockResolvedValue(undefined);

    await expect(addTeamMember(input)).resolves.toEqual({
      success: false,
      error: { code: "TEAM_NOT_FOUND" },
    });
  });

  it("lets the registered owner add a roster link", async () => {
    signIn("owner-1");
    mocks.teamFindFirst.mockResolvedValue({ ownerId: "owner-1" });
    const values = mockInsertReturning({ id: 1 });

    const result = await addTeamMember(input);

    expect(result.success).toBe(true);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ teamId: 7, playerId: "player-9" }),
    );
  });
});

describe("addPlayerToRoster authorization", () => {
  const input = {
    name: "Pedro Silva",
    email: "pedro@example.test",
    teamId: 7,
  };

  it("rejects a roster athlete without management rights", async () => {
    signIn("athlete-1");
    mocks.userCanAccessTeam.mockResolvedValue(true);
    mocks.canManageTeam.mockResolvedValue(false);

    await expect(addPlayerToRoster(input)).resolves.toEqual({
      success: false,
      error: { code: "FORBIDDEN" },
    });
    expect(mocks.canManageTeam).toHaveBeenCalledWith("athlete-1", 7);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("rejects users outside the team", async () => {
    signIn("outsider-1");
    mocks.userCanAccessTeam.mockResolvedValue(false);

    await expect(addPlayerToRoster(input)).resolves.toEqual({
      success: false,
      error: { code: "TEAM_NOT_FOUND" },
    });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("keeps co-captain promotion owner-only", async () => {
    signIn("manager-1");
    mocks.userCanAccessTeam.mockResolvedValue(true);
    mocks.canManageTeam.mockResolvedValue(true);
    mocks.userIsTeamOwner.mockResolvedValue(false);

    await expect(addPlayerToRoster({ ...input, admin: true })).resolves.toEqual(
      { success: false, error: { code: "FORBIDDEN" } },
    );
    expect(mocks.userIsTeamOwner).toHaveBeenCalledWith("manager-1", 7);
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("lets a co-captain add a regular player", async () => {
    signIn("manager-1");
    mocks.userCanAccessTeam.mockResolvedValue(true);
    mocks.canManageTeam.mockResolvedValue(true);
    mocks.userFindFirst.mockResolvedValue({ id: "player-9", name: "Pedro" });
    mocks.teamMembersFindFirst.mockResolvedValue(undefined);
    const values = mockInsertReturning({ id: 3 });

    const result = await addPlayerToRoster(input);

    expect(result.success).toBe(true);
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ role: "player", playerId: "player-9" }),
    );
  });
});

describe("sendRosterPlayerEmail authorization", () => {
  const input = {
    teamId: 7,
    playerId: "player-9",
    subject: "Jogo de sábado",
    message: "Confirma a tua presença.",
  };

  it("rejects a roster player who cannot manage the team", async () => {
    signIn("player-1");
    mocks.userCanAccessTeam.mockResolvedValue(true);
    mocks.canManageTeam.mockResolvedValue(false);

    await expect(sendRosterPlayerEmail(input)).resolves.toEqual({
      success: false,
      error: { code: "FORBIDDEN" },
    });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("hides teams the user cannot access", async () => {
    signIn("stranger");
    mocks.userCanAccessTeam.mockResolvedValue(false);

    await expect(sendRosterPlayerEmail(input)).resolves.toEqual({
      success: false,
      error: { code: "TEAM_NOT_FOUND" },
    });
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });
});
