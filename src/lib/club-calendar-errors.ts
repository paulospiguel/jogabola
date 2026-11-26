/**
 * Error codes returned by the club calendar Server Actions (ADR 0004/0005).
 * The UI maps each code to `arenaClubCalendar.errors.<CODE>`.
 */
export const CLUB_CALENDAR_ERROR = {
  CLUB_NOT_FOUND: "CLUB_NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  TEAM_NOT_FOUND: "TEAM_NOT_FOUND",
  TEAM_NOT_IN_CLUB: "TEAM_NOT_IN_CLUB",
  TEAM_ALREADY_IN_CLUB: "TEAM_ALREADY_IN_CLUB",
  SEASON_NOT_FOUND: "SEASON_NOT_FOUND",
  SEASON_NAME_TAKEN: "SEASON_NAME_TAKEN",
  SEASON_IN_USE: "SEASON_IN_USE",
  OPPONENT_NOT_FOUND: "OPPONENT_NOT_FOUND",
  OPPONENT_NAME_TAKEN: "OPPONENT_NAME_TAKEN",
  OPPONENT_IN_USE: "OPPONENT_IN_USE",
  FIXTURE_NOT_FOUND: "FIXTURE_NOT_FOUND",
  MATCH_SESSION_NOT_FOUND: "MATCH_SESSION_NOT_FOUND",
  FIXTURE_ALREADY_LINKED: "FIXTURE_ALREADY_LINKED",
  MATCH_SESSION_ALREADY_LINKED: "MATCH_SESSION_ALREADY_LINKED",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ClubCalendarErrorCode =
  (typeof CLUB_CALENDAR_ERROR)[keyof typeof CLUB_CALENDAR_ERROR];

/** Thrown inside a transaction to roll it back with a domain error code. */
export class ClubCalendarError extends Error {
  constructor(readonly code: ClubCalendarErrorCode) {
    super(code);
    this.name = "ClubCalendarError";
  }
}

interface PgErrorFields {
  code: string;
  constraint?: string;
}

/** Finds the PostgreSQL error behind Drizzle's DrizzleQueryError wrapper. */
export function findPgError(error: unknown): PgErrorFields | null {
  let current: unknown = error;
  for (let depth = 0; depth < 4 && current; depth++) {
    if (typeof current === "object") {
      const code = Reflect.get(current, "code");
      if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) {
        const constraint = Reflect.get(current, "constraint_name");
        return {
          code,
          constraint: typeof constraint === "string" ? constraint : undefined,
        };
      }
      current = Reflect.get(current, "cause");
    } else {
      return null;
    }
  }
  return null;
}

// Constraint violations that carry a domain meaning. Cross-club or unknown
// IDs map to the same "not found" code, so scope is never disclosed.
const CONSTRAINT_ERRORS: Record<string, ClubCalendarErrorCode> = {
  fixtures_season_club_fk: CLUB_CALENDAR_ERROR.SEASON_NOT_FOUND,
  fixtures_opponent_club_fk: CLUB_CALENDAR_ERROR.OPPONENT_NOT_FOUND,
  fixtures_team_club_fk: CLUB_CALENDAR_ERROR.TEAM_NOT_IN_CLUB,
  fixture_match_sessions_match_session_team_fk:
    CLUB_CALENDAR_ERROR.MATCH_SESSION_NOT_FOUND,
  fixture_match_sessions_fixture_team_fk: CLUB_CALENDAR_ERROR.FIXTURE_NOT_FOUND,
  fixture_match_sessions_fixture_unique:
    CLUB_CALENDAR_ERROR.FIXTURE_ALREADY_LINKED,
  fixture_match_sessions_match_session_unique:
    CLUB_CALENDAR_ERROR.MATCH_SESSION_ALREADY_LINKED,
  seasons_club_name_unique: CLUB_CALENDAR_ERROR.SEASON_NAME_TAKEN,
  opponents_club_name_unique: CLUB_CALENDAR_ERROR.OPPONENT_NAME_TAKEN,
};

// The same FK names mean "in use" when the referenced row is being deleted.
const IN_USE_ON_DELETE: Record<string, ClubCalendarErrorCode> = {
  fixtures_season_club_fk: CLUB_CALENDAR_ERROR.SEASON_IN_USE,
  fixtures_opponent_club_fk: CLUB_CALENDAR_ERROR.OPPONENT_IN_USE,
};

export function toClubCalendarErrorCode(
  error: unknown,
  operation: "write" | "delete" = "write",
): ClubCalendarErrorCode {
  if (error instanceof ClubCalendarError) return error.code;
  const pgError = findPgError(error);
  if (!pgError?.constraint) return CLUB_CALENDAR_ERROR.UNKNOWN_ERROR;
  if (operation === "delete" && pgError.code === "23503") {
    return (
      IN_USE_ON_DELETE[pgError.constraint] ?? CLUB_CALENDAR_ERROR.UNKNOWN_ERROR
    );
  }
  if (pgError.code !== "23503" && pgError.code !== "23505") {
    return CLUB_CALENDAR_ERROR.UNKNOWN_ERROR;
  }
  return (
    CONSTRAINT_ERRORS[pgError.constraint] ?? CLUB_CALENDAR_ERROR.UNKNOWN_ERROR
  );
}
