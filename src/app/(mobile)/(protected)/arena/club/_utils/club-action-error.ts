import type { ActionResult } from "@/types/common";

/** Error thrown by query/mutation functions that wrap club Server Actions. */
export class ClubActionError extends Error {
  readonly code: string;
  readonly fieldErrors: Record<string, string[]>;

  constructor(code: string, fieldErrors: Record<string, string[]> = {}) {
    super(code);
    this.name = "ClubActionError";
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function unwrapClubResult<T>(result: ActionResult<T>): T {
  if (result.success) return result.data;
  throw new ClubActionError(
    result.error.code || "UNKNOWN_ERROR",
    result.error.fieldErrors ?? {},
  );
}

export function clubErrorCode(error: unknown): string | null {
  if (!error) return null;
  return error instanceof ClubActionError ? error.code : "UNKNOWN_ERROR";
}

/** First validation code reported for `field`, if any. */
export function firstFieldError(
  error: unknown,
  field: string,
): string | undefined {
  if (!(error instanceof ClubActionError)) return undefined;
  return error.fieldErrors[field]?.[0];
}

/** Domain errors that belong to one form field instead of the whole form. */
export const FIELD_FOR_DOMAIN_ERROR: Record<string, string> = {
  TEAM_NOT_FOUND: "teamId",
  TEAM_NOT_IN_CLUB: "teamId",
  SEASON_NOT_FOUND: "seasonId",
  OPPONENT_NOT_FOUND: "opponentId",
  MATCH_SESSION_NOT_FOUND: "matchSessionId",
  MATCH_SESSION_ALREADY_LINKED: "matchSessionId",
  SEASON_NAME_TAKEN: "name",
  OPPONENT_NAME_TAKEN: "name",
};

/** Error codes the screens render as "not found" (same answer as forbidden reads). */
export function isNotFoundCode(code: string | null) {
  return (
    code === "CLUB_NOT_FOUND" ||
    code === "FIXTURE_NOT_FOUND" ||
    code === "SEASON_NOT_FOUND" ||
    code === "OPPONENT_NOT_FOUND"
  );
}
