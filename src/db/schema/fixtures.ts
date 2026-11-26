import {
  foreignKey,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { clubs, opponents, seasons } from "./clubs";
import { matchSessions } from "./match-sessions";
import { teams } from "./teams";
import { user } from "./users";

/**
 * Competitive fixture (ADR 0004). Composite foreign keys keep the team,
 * season and opponent inside the fixture's club. The team FK also uses
 * ON UPDATE RESTRICT, so a team with fixtures cannot be detached from or
 * moved to another club (teams.club_id is part of the referenced key).
 */
export const fixtures = pgTable(
  "fixtures",
  {
    id: serial("id").primaryKey(),
    clubId: integer("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "restrict" }),
    teamId: integer("team_id").notNull(),
    seasonId: integer("season_id").notNull(),
    opponentId: integer("opponent_id").notNull(),
    competitionName: text("competition_name").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    // Target of the composite FK from the fixture/match-session link.
    unique("fixtures_id_team_unique").on(table.id, table.teamId),
    foreignKey({
      name: "fixtures_team_club_fk",
      columns: [table.teamId, table.clubId],
      foreignColumns: [teams.id, teams.clubId],
    })
      .onDelete("cascade")
      .onUpdate("restrict"),
    foreignKey({
      name: "fixtures_season_club_fk",
      columns: [table.seasonId, table.clubId],
      foreignColumns: [seasons.id, seasons.clubId],
    })
      .onDelete("restrict")
      .onUpdate("restrict"),
    foreignKey({
      name: "fixtures_opponent_club_fk",
      columns: [table.opponentId, table.clubId],
      foreignColumns: [opponents.id, opponents.clubId],
    })
      .onDelete("restrict")
      .onUpdate("restrict"),
    index("fixtures_club_starts_at_idx").on(table.clubId, table.startsAt),
    index("fixtures_team_idx").on(table.teamId),
    index("fixtures_season_idx").on(table.seasonId),
    index("fixtures_opponent_idx").on(table.opponentId),
  ],
);

/**
 * Optional, deliberate link between a fixture and a match session of the
 * same team: at most one per fixture and one per match session. Deleting
 * the match session removes the link and keeps the fixture.
 */
export const fixtureMatchSessions = pgTable(
  "fixture_match_sessions",
  {
    fixtureId: integer("fixture_id").notNull(),
    teamId: integer("team_id").notNull(),
    matchSessionId: integer("match_session_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    unique("fixture_match_sessions_fixture_unique").on(table.fixtureId),
    unique("fixture_match_sessions_match_session_unique").on(
      table.matchSessionId,
    ),
    foreignKey({
      name: "fixture_match_sessions_fixture_team_fk",
      columns: [table.fixtureId, table.teamId],
      foreignColumns: [fixtures.id, fixtures.teamId],
    })
      .onDelete("cascade")
      .onUpdate("restrict"),
    foreignKey({
      name: "fixture_match_sessions_match_session_team_fk",
      columns: [table.matchSessionId, table.teamId],
      foreignColumns: [matchSessions.id, matchSessions.teamId],
    })
      .onDelete("cascade")
      .onUpdate("restrict"),
  ],
);
