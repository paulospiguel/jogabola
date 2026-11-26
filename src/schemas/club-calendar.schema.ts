import { z } from "zod";

// Field error messages are keys in the `validation` namespace.
const id = (message: string) => z.number().int().positive({ message });

const clubId = id("VALIDATION_CLUB_REQUIRED");
const teamId = id("VALIDATION_TEAM_REQUIRED");
const seasonId = id("VALIDATION_SEASON_REQUIRED");
const opponentId = id("VALIDATION_OPPONENT_REQUIRED");
const fixtureId = id("VALIDATION_FIXTURE_REQUIRED");
const matchSessionId = id("VALIDATION_MATCH_SESSION_REQUIRED");

const name = z
  .string()
  .trim()
  .min(2, { message: "VALIDATION_CLUB_CALENDAR_NAME_TOO_SHORT" })
  .max(80, { message: "VALIDATION_CLUB_CALENDAR_NAME_TOO_LONG" });

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "VALIDATION_DATE_INVALID" })
  .refine(value => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), {
    message: "VALIDATION_DATE_INVALID",
  });

export const createClubWithTeamSchema = z.object({ name, teamId });

export const attachTeamToClubSchema = z.object({ clubId, teamId });

export const clubScopeSchema = z.object({ clubId });

const seasonFields = z.object({
  name,
  startsOn: isoDate.nullable().optional(),
  endsOn: isoDate.nullable().optional(),
});

function endsAfterStart(value: {
  startsOn?: string | null;
  endsOn?: string | null;
}) {
  return !value.startsOn || !value.endsOn || value.endsOn >= value.startsOn;
}

const seasonRangeIssue = {
  message: "VALIDATION_SEASON_RANGE_INVALID",
  path: ["endsOn"],
};

export const createSeasonSchema = seasonFields
  .extend({ clubId })
  .refine(endsAfterStart, seasonRangeIssue);

export const updateSeasonSchema = seasonFields
  .extend({ seasonId })
  .refine(endsAfterStart, seasonRangeIssue);

export const deleteSeasonSchema = z.object({ seasonId });

export const createOpponentSchema = z.object({ clubId, name });

export const updateOpponentSchema = z.object({ opponentId, name });

export const deleteOpponentSchema = z.object({ opponentId });

export const createFixtureSchema = z.object({
  teamId,
  seasonId,
  opponentId,
  competitionName: name,
  // An instant: ISO 8601 with an explicit offset, e.g. 2026-12-06T15:00:00Z.
  startsAt: z
    .string()
    .datetime({ offset: true, message: "VALIDATION_STARTS_AT_INVALID" }),
  matchSessionId: matchSessionId.optional(),
});

export const linkMatchSessionSchema = z.object({ fixtureId, matchSessionId });

export const fixtureScopeSchema = z.object({ fixtureId });

export const listClubFixturesSchema = z
  .object({
    clubId,
    seasonId: seasonId.optional(),
    teamId: teamId.optional(),
    from: z
      .string()
      .datetime({ offset: true, message: "VALIDATION_DATE_INVALID" })
      .optional(),
    to: z
      .string()
      .datetime({ offset: true, message: "VALIDATION_DATE_INVALID" })
      .optional(),
  })
  .refine(
    value =>
      !value.from ||
      !value.to ||
      Date.parse(value.from) <= Date.parse(value.to),
    {
      message: "VALIDATION_DATE_RANGE_INVALID",
      path: ["to"],
    },
  );

export type CreateClubWithTeamInput = z.infer<typeof createClubWithTeamSchema>;
export type AttachTeamToClubInput = z.infer<typeof attachTeamToClubSchema>;
export type ClubScopeInput = z.infer<typeof clubScopeSchema>;
export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;
export type UpdateSeasonInput = z.infer<typeof updateSeasonSchema>;
export type DeleteSeasonInput = z.infer<typeof deleteSeasonSchema>;
export type CreateOpponentInput = z.infer<typeof createOpponentSchema>;
export type UpdateOpponentInput = z.infer<typeof updateOpponentSchema>;
export type DeleteOpponentInput = z.infer<typeof deleteOpponentSchema>;
export type CreateFixtureInput = z.infer<typeof createFixtureSchema>;
export type LinkMatchSessionInput = z.infer<typeof linkMatchSessionSchema>;
export type FixtureScopeInput = z.infer<typeof fixtureScopeSchema>;
export type ListClubFixturesInput = z.infer<typeof listClubFixturesSchema>;
