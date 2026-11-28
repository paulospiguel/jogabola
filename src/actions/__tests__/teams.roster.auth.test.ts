import { beforeEach, describe, expect, it, vi } from "vitest";
import { teamMembers, teamStaff } from "@/db/schema";

const mocks = vi.hoisted(() => ({
  can: vi.fn(),
  getTeamAccess: vi.fn(),
  isTeamOwner: vi.fn(),
  getSession: vi.fn(),
  insert: vi.fn(),
  deleteFn: vi.fn(),
  deleteWhere: vi.fn(),
  memberFindFirst: vi.fn(),
  playerFindFirst: vi.fn(),
  userFindFirst: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  db: {
    insert: mocks.insert,
    delete: mocks.deleteFn,
    query: {
      teamMembers: { findFirst: mocks.memberFindFirst },
      players: { findFirst: mocks.playerFindFirst },
      user: { findFirst: mocks.userFindFirst },
    },
  },
}));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/team-authz", () => ({
  can: mocks.can,
  getTeamAccess: mocks.getTeamAccess,
  isTeamOwner: mocks.isTeamOwner,
  canViewTeam: vi.fn(),
  getAccessibleTeamIds: vi.fn(),
}));
vi.mock("@/lib/email", () => ({ sendEmail: mocks.sendEmail }));
vi.mock("@/lib/analytics-server", () => ({ trackServerEvent: vi.fn() }));

const mod = await import("@/actions/teams.actions");
const { addPlayerToRoster, removePlayerFromRoster, sendRosterPlayerEmail } =
  mod;

const athleteAccess = {
  teamExists: true,
  isOwner: false,
  isAthlete: true,
  staff: null,
};
const ownerAccess = { ...athleteAccess, isOwner: true };
const staffAccess = {
  ...athleteAccess,
  staff: { title: "coach", permissions: ["events.manage"] },
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({
    session: {},
    user: { id: "actor", name: "Actor", email: "actor@example.com" },
  });
  mocks.deleteWhere.mockResolvedValue(undefined);
  mocks.deleteFn.mockReturnValue({ where: mocks.deleteWhere });
  mocks.memberFindFirst.mockResolvedValue({ id: 1 });
});

describe("addPlayerToRoster authorization", () => {
  it("rejects an athlete without roster.manage", async () => {
    mocks.can.mockResolvedValue(false);

    const result = await addPlayerToRoster({
      name: "Novo Atleta",
      email: "novo@example.com",
      teamId: 7,
    });

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
    expect(mocks.can).toHaveBeenCalledWith("actor", 7, "roster.manage");
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});

describe("removePlayerFromRoster authorization", () => {
  it("lets staff with roster.manage remove a plain athlete", async () => {
    mocks.can.mockResolvedValue(true);
    mocks.isTeamOwner.mockResolvedValue(false);
    mocks.getTeamAccess.mockResolvedValue(athleteAccess);

    const result = await removePlayerFromRoster({
      teamId: 7,
      playerId: "target",
    });

    expect(result).toEqual({ success: true, data: { removed: true } });
    expect(mocks.can).toHaveBeenCalledWith("actor", 7, "roster.manage");
    expect(mocks.deleteFn).toHaveBeenCalledWith(teamMembers);
  });

  it("rejects removing the owner, even by the owner", async () => {
    mocks.can.mockResolvedValue(true);
    mocks.isTeamOwner.mockResolvedValue(true);
    mocks.getTeamAccess.mockResolvedValue(ownerAccess);

    const result = await removePlayerFromRoster({
      teamId: 7,
      playerId: "owner",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "CANNOT_MODIFY_OWNER" },
    });
    expect(mocks.deleteFn).not.toHaveBeenCalled();
  });

  it("forbids a non-owner with roster.manage from removing staff", async () => {
    mocks.can.mockResolvedValue(true);
    mocks.isTeamOwner.mockResolvedValue(false);
    mocks.getTeamAccess.mockResolvedValue(staffAccess);

    const result = await removePlayerFromRoster({
      teamId: 7,
      playerId: "staff",
    });

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
    expect(mocks.deleteFn).not.toHaveBeenCalled();
  });

  it("lets the owner remove a staff member from the roster without demoting", async () => {
    mocks.can.mockResolvedValue(true);
    mocks.isTeamOwner.mockResolvedValue(true);
    mocks.getTeamAccess.mockResolvedValue(staffAccess);

    const result = await removePlayerFromRoster({
      teamId: 7,
      playerId: "staff",
    });

    expect(result).toEqual({ success: true, data: { removed: true } });
    expect(mocks.deleteFn).toHaveBeenCalledWith(teamMembers);
    expect(mocks.deleteFn).not.toHaveBeenCalledWith(teamStaff);
  });

  it("rejects callers without roster.manage", async () => {
    mocks.can.mockResolvedValue(false);

    const result = await removePlayerFromRoster({
      teamId: 7,
      playerId: "target",
    });

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
    expect(mocks.deleteFn).not.toHaveBeenCalled();
  });
});

describe("sendRosterPlayerEmail authorization", () => {
  it("rejects callers without roster.manage", async () => {
    mocks.can.mockResolvedValue(false);

    const result = await sendRosterPlayerEmail({
      teamId: 7,
      playerId: "target",
      subject: "Olá equipa",
      message: "Mensagem de teste",
    });

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
    expect(mocks.can).toHaveBeenCalledWith("actor", 7, "roster.manage");
    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });
});

describe("teams.actions exports", () => {
  it("no longer exposes addTeamMember as a Server Action", () => {
    expect("addTeamMember" in mod).toBe(false);
  });
});
