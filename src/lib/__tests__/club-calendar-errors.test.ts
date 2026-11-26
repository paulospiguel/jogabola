import { describe, expect, it } from "vitest";
import {
  ClubCalendarError,
  findPgError,
  toClubCalendarErrorCode,
} from "@/lib/club-calendar-errors";

function drizzleError(code: string, constraint?: string) {
  // Mirrors DrizzleQueryError wrapping a postgres.js PostgresError.
  const cause = Object.assign(new Error("db"), {
    code,
    constraint_name: constraint,
  });
  return Object.assign(new Error("Failed query"), {
    name: "DrizzleQueryError",
    cause,
  });
}

describe("findPgError", () => {
  it("unwraps the PostgreSQL error behind Drizzle", () => {
    expect(
      findPgError(drizzleError("23503", "fixtures_season_club_fk")),
    ).toEqual({ code: "23503", constraint: "fixtures_season_club_fk" });
  });

  it("ignores non-database errors", () => {
    expect(findPgError(new Error("boom"))).toBeNull();
    expect(findPgError("boom")).toBeNull();
  });
});

describe("toClubCalendarErrorCode", () => {
  it("passes domain errors through", () => {
    expect(toClubCalendarErrorCode(new ClubCalendarError("FORBIDDEN"))).toBe(
      "FORBIDDEN",
    );
  });

  it.each([
    ["23503", "fixtures_season_club_fk", "SEASON_NOT_FOUND"],
    ["23503", "fixtures_opponent_club_fk", "OPPONENT_NOT_FOUND"],
    [
      "23503",
      "fixture_match_sessions_match_session_team_fk",
      "MATCH_SESSION_NOT_FOUND",
    ],
    [
      "23505",
      "fixture_match_sessions_match_session_unique",
      "MATCH_SESSION_ALREADY_LINKED",
    ],
    [
      "23505",
      "fixture_match_sessions_fixture_unique",
      "FIXTURE_ALREADY_LINKED",
    ],
    ["23505", "seasons_club_name_unique", "SEASON_NAME_TAKEN"],
    ["23505", "opponents_club_name_unique", "OPPONENT_NAME_TAKEN"],
  ])("maps %s on %s to %s", (code, constraint, expected) => {
    expect(toClubCalendarErrorCode(drizzleError(code, constraint))).toBe(
      expected,
    );
  });

  it("reports referenced seasons and opponents as in use on delete", () => {
    expect(
      toClubCalendarErrorCode(
        drizzleError("23503", "fixtures_season_club_fk"),
        "delete",
      ),
    ).toBe("SEASON_IN_USE");
    expect(
      toClubCalendarErrorCode(
        drizzleError("23503", "fixtures_opponent_club_fk"),
        "delete",
      ),
    ).toBe("OPPONENT_IN_USE");
  });

  it("never leaks unexpected database errors", () => {
    expect(toClubCalendarErrorCode(drizzleError("40P01"))).toBe(
      "UNKNOWN_ERROR",
    );
    expect(
      toClubCalendarErrorCode(drizzleError("23505", "teams_slug_idx")),
    ).toBe("UNKNOWN_ERROR");
    expect(toClubCalendarErrorCode(new Error("boom"))).toBe("UNKNOWN_ERROR");
  });
});
