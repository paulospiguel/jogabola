import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  calendar: {
    attachTeamToClub: vi.fn(),
    createClubWithTeam: vi.fn(),
    createFixture: vi.fn(),
    createOpponent: vi.fn(),
    createSeason: vi.fn(),
    deleteOpponent: vi.fn(),
    deleteSeason: vi.fn(),
    getFixture: vi.fn(),
    linkMatchSession: vi.fn(),
    listAttachableTeams: vi.fn(),
    listClubFixtures: vi.fn(),
    listClubOpponents: vi.fn(),
    listClubSeasons: vi.fn(),
    listMyClubs: vi.fn(),
    unlinkMatchSession: vi.fn(),
    updateOpponent: vi.fn(),
    updateSeason: vi.fn(),
  },
}));

vi.mock("@/db/client", () => ({ db: { marker: "db" } }));
vi.mock("@/db/queries/club-calendar", () => mocks.calendar);
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

const clubs = await import("@/actions/clubs.actions");
const fixtures = await import("@/actions/fixtures.actions");

const ok = { success: true, data: {} };

beforeEach(() => {
  vi.clearAllMocks();
  for (const fn of Object.values(mocks.calendar)) fn.mockResolvedValue(ok);
});

function signIn(id = "session-user") {
  mocks.getSession.mockResolvedValue({
    session: {},
    user: { id, name: "User", email: `${id}@example.test` },
  });
}

const validCalls = [
  [clubs.createClubWithTeam, { name: "Clube", teamId: 1 }],
  [clubs.attachTeamToClub, { clubId: 1, teamId: 2 }],
  [clubs.listMyClubs, undefined],
  [clubs.listAttachableTeams, undefined],
  [clubs.listClubSeasons, { clubId: 1 }],
  [clubs.createSeason, { clubId: 1, name: "2026/27" }],
  [clubs.updateSeason, { seasonId: 1, name: "2026/27" }],
  [clubs.deleteSeason, { seasonId: 1 }],
  [clubs.listClubOpponents, { clubId: 1 }],
  [clubs.createOpponent, { clubId: 1, name: "Adversário" }],
  [clubs.updateOpponent, { opponentId: 1, name: "Adversário" }],
  [clubs.deleteOpponent, { opponentId: 1 }],
  [
    fixtures.createFixture,
    {
      teamId: 1,
      seasonId: 2,
      opponentId: 3,
      competitionName: "Distrital",
      startsAt: "2026-12-06T15:00:00Z",
    },
  ],
  [fixtures.linkMatchSession, { fixtureId: 1, matchSessionId: 2 }],
  [fixtures.unlinkMatchSession, { fixtureId: 1 }],
  [fixtures.listClubFixtures, { clubId: 1 }],
  [fixtures.getFixture, { fixtureId: 1 }],
] as const;

describe("club calendar Server Actions", () => {
  it.each(
    validCalls.map(([action, input]) => [action.name, action, input] as const),
  )("%s rejects calls without a session", async (_name, action, input) => {
    mocks.getSession.mockResolvedValue(null);

    await expect(
      (action as (value: unknown) => Promise<unknown>)(input),
    ).resolves.toEqual({ success: false, error: { code: "UNAUTHORIZED" } });
    for (const fn of Object.values(mocks.calendar)) {
      expect(fn).not.toHaveBeenCalled();
    }
  });

  it("uses the session identity and ignores client-supplied scope", async () => {
    signIn("session-user");

    await fixtures.createFixture({
      teamId: 1,
      seasonId: 2,
      opponentId: 3,
      competitionName: "Distrital",
      startsAt: "2026-12-06T15:00:00Z",
      userId: "forged-user",
      clubId: 99,
      createdBy: "forged-user",
    });

    expect(mocks.calendar.createFixture).toHaveBeenCalledWith(
      { marker: "db" },
      "session-user",
      {
        teamId: 1,
        seasonId: 2,
        opponentId: 3,
        competitionName: "Distrital",
        startsAt: "2026-12-06T15:00:00Z",
      },
    );
  });

  it("rejects a start time without an explicit offset", async () => {
    signIn();

    const result = await fixtures.createFixture({
      teamId: 1,
      seasonId: 2,
      opponentId: 3,
      competitionName: "Distrital",
      startsAt: "2026-12-06 15:00",
    });

    expect(result).toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors: { startsAt: ["VALIDATION_STARTS_AT_INVALID"] },
      },
    });
    expect(mocks.calendar.createFixture).not.toHaveBeenCalled();
  });

  it("rejects a season that ends before it starts", async () => {
    signIn();

    const result = await clubs.createSeason({
      clubId: 1,
      name: "2026/27",
      startsOn: "2027-06-30",
      endsOn: "2026-09-01",
    });

    expect(result).toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors: { endsOn: ["VALIDATION_SEASON_RANGE_INVALID"] },
      },
    });
  });

  it("passes the query result through unchanged", async () => {
    signIn();
    const notFound = { success: false, error: { code: "FIXTURE_NOT_FOUND" } };
    mocks.calendar.getFixture.mockResolvedValue(notFound);

    await expect(fixtures.getFixture({ fixtureId: 5 })).resolves.toBe(notFound);
  });
});
