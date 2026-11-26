import { describe, expect, it } from "vitest";
import {
  ClubActionError,
  clubErrorCode,
  firstFieldError,
  unwrapClubResult,
} from "./club-action-error";
import {
  zonedDateKey,
  zonedInputValues,
  zonedWallTimeToUtc,
} from "./club-calendar-time";
import {
  competitionSuggestions,
  filterFixtures,
  groupFixturesByDay,
  partitionFixtures,
} from "./club-calendar-view";
import { decideClubEntry } from "./club-entry";

const TZ = "Europe/Lisbon";

describe("zonedWallTimeToUtc", () => {
  it("uses UTC+0 in Lisbon winter", () => {
    expect(zonedWallTimeToUtc("2026-12-06", "15:00", TZ)?.toISOString()).toBe(
      "2026-12-06T15:00:00.000Z",
    );
  });

  it("uses UTC+1 in Lisbon summer", () => {
    expect(zonedWallTimeToUtc("2026-07-10", "20:30", TZ)?.toISOString()).toBe(
      "2026-07-10T19:30:00.000Z",
    );
  });

  it("rejects a time skipped by the spring DST jump", () => {
    // 2026-03-29 01:00 → 02:00 in Lisbon.
    expect(zonedWallTimeToUtc("2026-03-29", "01:30", TZ)).toBeNull();
  });

  it("rejects malformed and impossible input", () => {
    expect(zonedWallTimeToUtc("2026-02-30", "10:00", TZ)).toBeNull();
    expect(zonedWallTimeToUtc("06/12/2026", "10:00", TZ)).toBeNull();
    expect(zonedWallTimeToUtc("2026-12-06", "25:00", TZ)).toBeNull();
    expect(zonedWallTimeToUtc("", "", TZ)).toBeNull();
  });

  it("round-trips with zonedInputValues in another zone", () => {
    const instant = zonedWallTimeToUtc(
      "2026-11-01",
      "09:15",
      "America/New_York",
    );
    expect(instant?.toISOString()).toBe("2026-11-01T14:15:00.000Z");
    expect(zonedInputValues(instant as Date, "America/New_York")).toEqual({
      date: "2026-11-01",
      time: "09:15",
    });
  });
});

describe("zonedDateKey", () => {
  it("assigns a late UTC instant to the next Lisbon day in summer", () => {
    expect(zonedDateKey("2026-07-10T23:30:00Z", TZ)).toBe("2026-07-11");
    expect(zonedDateKey("2026-12-10T23:30:00Z", TZ)).toBe("2026-12-10");
  });
});

const fixture = (id: number, startsAt: string, seasonId = 1, teamId = 1) => ({
  id,
  startsAt,
  season: { id: seasonId },
  team: { id: teamId, name: `T${teamId}` },
  competitionName: id % 2 ? "Distrital" : "Taça",
});

describe("calendar view", () => {
  const now = new Date("2026-12-01T12:00:00Z");
  const list = [
    fixture(3, "2026-12-13T15:00:00Z"),
    fixture(1, "2026-11-20T15:00:00Z"),
    fixture(2, "2026-12-06T15:00:00Z", 2),
    fixture(4, "2026-12-06T18:00:00Z", 1, 2),
  ];

  it("partitions upcoming ascending and past descending", () => {
    const { upcoming, past } = partitionFixtures(list, now);
    expect(upcoming.map(f => f.id)).toEqual([2, 4, 3]);
    expect(past.map(f => f.id)).toEqual([1]);
  });

  it("groups consecutive fixtures by Lisbon day", () => {
    const { upcoming } = partitionFixtures(list, now);
    const groups = groupFixturesByDay(upcoming, TZ);
    expect(groups.map(g => [g.dayKey, g.fixtures.map(f => f.id)])).toEqual([
      ["2026-12-06", [2, 4]],
      ["2026-12-13", [3]],
    ]);
  });

  it("filters by season and team", () => {
    expect(
      filterFixtures(list, { seasonId: 1, teamId: null }).map(f => f.id),
    ).toEqual([3, 1, 4]);
    expect(
      filterFixtures(list, { seasonId: 1, teamId: 2 }).map(f => f.id),
    ).toEqual([4]);
  });

  it("suggests competitions by frequency", () => {
    expect(competitionSuggestions(list)).toEqual(["Distrital", "Taça"]);
  });
});

describe("decideClubEntry", () => {
  const team = { id: 7, name: "Leões", ownerId: "u1" };

  it("opens the club that holds the active owned team", () => {
    expect(
      decideClubEntry({
        clubs: [
          { id: 1, ownedTeams: [] },
          { id: 2, ownedTeams: [{ id: 7 }] },
        ],
        activeTeam: team,
        userId: "u1",
      }),
    ).toEqual({ kind: "club", clubId: 2 });
  });

  it("offers to create a club for a free owned team", () => {
    expect(
      decideClubEntry({ clubs: [], activeTeam: team, userId: "u1" }),
    ).toEqual({ kind: "create", teamId: 7, teamName: "Leões" });
  });

  it("falls back to the first club for a member who does not own the team", () => {
    expect(
      decideClubEntry({
        clubs: [{ id: 5, ownedTeams: [] }],
        activeTeam: team,
        userId: "u2",
      }),
    ).toEqual({ kind: "club", clubId: 5 });
  });

  it("explains why there is nothing to show", () => {
    expect(
      decideClubEntry({ clubs: [], activeTeam: team, userId: "u2" }),
    ).toEqual({ kind: "none", reason: "notOwner" });
    expect(
      decideClubEntry({ clubs: [], activeTeam: null, userId: "u2" }),
    ).toEqual({ kind: "none", reason: "noTeam" });
  });
});

describe("club action errors", () => {
  it("unwraps success and throws typed errors", () => {
    expect(unwrapClubResult({ success: true, data: 1 })).toBe(1);
    let caught: unknown;
    try {
      unwrapClubResult({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          fieldErrors: { name: ["VALIDATION_CLUB_CALENDAR_NAME_TOO_SHORT"] },
        },
      });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ClubActionError);
    expect(clubErrorCode(caught)).toBe("VALIDATION_ERROR");
    expect(firstFieldError(caught, "name")).toBe(
      "VALIDATION_CLUB_CALENDAR_NAME_TOO_SHORT",
    );
  });

  it("maps unexpected errors to UNKNOWN_ERROR", () => {
    expect(clubErrorCode(new Error("network"))).toBe("UNKNOWN_ERROR");
    expect(clubErrorCode(null)).toBeNull();
  });
});
