import {
  and,
  asc,
  eq,
  exists,
  gte,
  inArray,
  isNull,
  lte,
  or,
  type SQL,
  sql,
} from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/db/schema";
import {
  type ClubMemberRole,
  clubMembers,
  clubs,
  fixtureMatchSessions,
  fixtures,
  opponents,
  seasons,
  teamMembers,
  teamStaff,
  teams,
} from "@/db/schema";
import {
  CLUB_CALENDAR_ERROR,
  ClubCalendarError,
  toClubCalendarErrorCode,
} from "@/lib/club-calendar-errors";
import { currentFootballSeason } from "@/lib/club-season";
import { classifyErrorSafely } from "@/lib/safe-error";
import type {
  AttachTeamToClubInput,
  ClubScopeInput,
  CreateClubWithTeamInput,
  CreateFixtureInput,
  CreateOpponentInput,
  CreateSeasonInput,
  DeleteOpponentInput,
  DeleteSeasonInput,
  FixtureScopeInput,
  LinkMatchSessionInput,
  ListClubFixturesInput,
  UpdateOpponentInput,
  UpdateSeasonInput,
} from "@/schemas/club-calendar.schema";
import type { ActionResult } from "@/types/common";

/**
 * Club calendar data access (ADR 0004/0005). Every function receives the
 * acting user's ID from the server session and derives club/team scope from
 * persisted rows. Reads filter authorization in the query that returns the
 * data; writes check it inside the same transaction, holding row locks on
 * the rows that grant it.
 */
export type ClubCalendarDb = PostgresJsDatabase<typeof schema>;
type Transaction = Parameters<Parameters<ClubCalendarDb["transaction"]>[0]>[0];
type Executor = ClubCalendarDb | Transaction;

export interface ClubSummary {
  id: number;
  name: string;
  role: ClubMemberRole;
  /** Teams in this club whose registered owner is the caller. */
  ownedTeams: { id: number; name: string }[];
}

export interface TeamSummary {
  id: number;
  name: string;
}

export interface SeasonDto {
  id: number;
  clubId: number;
  name: string;
  startsOn: string | null;
  endsOn: string | null;
}

export interface OpponentDto {
  id: number;
  clubId: number;
  name: string;
}

/**
 * Catalog rows as listed: `fixtureCount` is the number of fixtures using the
 * row, for club admins only (who manage and delete them); `null` for other
 * members, since club membership alone does not grant access to other
 * teams' fixtures (ADR 0005).
 */
export type SeasonListItem = SeasonDto & { fixtureCount: number | null };
export type OpponentListItem = OpponentDto & { fixtureCount: number | null };

/** Calendar-only view of a fixture. No match-session or roster data. */
export interface FixtureDto {
  id: number;
  clubId: number;
  team: TeamSummary;
  season: { id: number; name: string };
  opponent: { id: number; name: string };
  competitionName: string;
  /** ISO 8601 instant (UTC). */
  startsAt: string;
  linkedMatchSessionId: number | null;
  /** Presentation-only: the caller is the team's registered owner. */
  canManage: boolean;
}

const E = CLUB_CALENDAR_ERROR;

async function run<T>(
  operation: "write" | "delete",
  fn: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    return { success: true, data: await fn() };
  } catch (error) {
    const code = toClubCalendarErrorCode(error, operation);
    if (code === E.UNKNOWN_ERROR) {
      console.error("[club-calendar] unexpected error", {
        error: classifyErrorSafely(error),
      });
    }
    return { success: false, error: { code } };
  }
}

async function lockMembership(
  tx: Transaction,
  userId: string,
  clubId: number,
): Promise<{ role: ClubMemberRole } | null> {
  const [membership] = await tx
    .select({ role: clubMembers.role })
    .from(clubMembers)
    .where(and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)))
    .for("share");
  return membership ?? null;
}

async function requireClubAdmin(
  tx: Transaction,
  userId: string,
  clubId: number,
  missingCode: (typeof E)[keyof typeof E] = E.CLUB_NOT_FOUND,
): Promise<void> {
  const membership = await lockMembership(tx, userId, clubId);
  if (!membership) throw new ClubCalendarError(missingCode);
  if (membership.role !== "admin") throw new ClubCalendarError(E.FORBIDDEN);
}

/**
 * Whether the caller has a server-validated link to the team: a roster row
 * (`team_members`) or a staff row (`team_staff`, ADR 0006). The registered
 * owner is checked by callers through `teams.owner_id`.
 */
async function hasTeamLink(
  executor: Executor,
  userId: string,
  teamId: number,
): Promise<boolean> {
  const [roster] = await executor
    .select({ id: teamMembers.id })
    .from(teamMembers)
    .where(
      and(eq(teamMembers.teamId, teamId), eq(teamMembers.playerId, userId)),
    )
    .limit(1);
  if (roster) return true;
  const [staff] = await executor
    .select({ id: teamStaff.id })
    .from(teamStaff)
    .where(and(eq(teamStaff.teamId, teamId), eq(teamStaff.userId, userId)))
    .limit(1);
  return Boolean(staff);
}

/**
 * Locks the team and requires `teams.owner_id` to be the caller. A roster
 * row (any role, including a legacy "owner") or a `team_staff` row never
 * substitutes it.
 */
async function lockOwnedTeam(
  tx: Transaction,
  userId: string,
  teamId: number,
  strength: "share" | "update",
): Promise<{ id: number; clubId: number | null }> {
  const [team] = await tx
    .select({ id: teams.id, ownerId: teams.ownerId, clubId: teams.clubId })
    .from(teams)
    .where(eq(teams.id, teamId))
    .for(strength);
  if (!team) throw new ClubCalendarError(E.TEAM_NOT_FOUND);
  if (team.ownerId !== userId) {
    const linked = await hasTeamLink(tx, userId, teamId);
    throw new ClubCalendarError(linked ? E.FORBIDDEN : E.TEAM_NOT_FOUND);
  }
  return { id: team.id, clubId: team.clubId };
}

// ─── Clubs ───────────────────────────────────────────────────────────────

/**
 * Creates the club, makes the caller its admin, attaches the team and opens
 * the current football season (July–June), all in one transaction, so the
 * captain can mark the first fixture without visiting the settings.
 */
export function createClubWithTeam(
  db: ClubCalendarDb,
  userId: string,
  input: CreateClubWithTeamInput,
  options: { now?: Date } = {},
): Promise<
  ActionResult<{
    club: { id: number; name: string };
    teamId: number;
    season: SeasonDto;
  }>
> {
  return run("write", () =>
    db.transaction(async tx => {
      const team = await lockOwnedTeam(tx, userId, input.teamId, "update");
      if (team.clubId !== null) {
        throw new ClubCalendarError(E.TEAM_ALREADY_IN_CLUB);
      }
      const [club] = await tx
        .insert(clubs)
        .values({ name: input.name, createdBy: userId })
        .returning({ id: clubs.id, name: clubs.name });
      await tx
        .insert(clubMembers)
        .values({ clubId: club.id, userId, role: "admin" });
      await tx
        .update(teams)
        .set({ clubId: club.id, updatedAt: new Date() })
        .where(eq(teams.id, team.id));
      const current = currentFootballSeason(options.now);
      const [season] = await tx
        .insert(seasons)
        .values({ clubId: club.id, ...current })
        .returning(seasonColumns);
      return { club, teamId: team.id, season };
    }),
  );
}

export function attachTeamToClub(
  db: ClubCalendarDb,
  userId: string,
  input: AttachTeamToClubInput,
): Promise<ActionResult<{ clubId: number; teamId: number }>> {
  return run("write", () =>
    db.transaction(async tx => {
      await requireClubAdmin(tx, userId, input.clubId);
      const team = await lockOwnedTeam(tx, userId, input.teamId, "update");
      if (team.clubId !== null) {
        throw new ClubCalendarError(E.TEAM_ALREADY_IN_CLUB);
      }
      // The row lock above serializes concurrent attachments; the IS NULL
      // guard keeps the write itself conditional on the team being free.
      const [updated] = await tx
        .update(teams)
        .set({ clubId: input.clubId, updatedAt: new Date() })
        .where(and(eq(teams.id, team.id), isNull(teams.clubId)))
        .returning({ id: teams.id });
      if (!updated) throw new ClubCalendarError(E.TEAM_ALREADY_IN_CLUB);
      return { clubId: input.clubId, teamId: team.id };
    }),
  );
}

export async function listMyClubs(
  db: ClubCalendarDb,
  userId: string,
): Promise<ActionResult<ClubSummary[]>> {
  const memberships = await db
    .select({ id: clubs.id, name: clubs.name, role: clubMembers.role })
    .from(clubMembers)
    .innerJoin(clubs, eq(clubs.id, clubMembers.clubId))
    .where(eq(clubMembers.userId, userId))
    .orderBy(asc(clubs.name), asc(clubs.id));
  const clubIds = memberships.map(club => club.id);
  const owned = clubIds.length
    ? await db
        .select({ id: teams.id, name: teams.name, clubId: teams.clubId })
        .from(teams)
        .where(and(eq(teams.ownerId, userId), inArray(teams.clubId, clubIds)))
        .orderBy(asc(teams.name))
    : [];
  return {
    success: true,
    data: memberships.map(club => ({
      ...club,
      ownedTeams: owned
        .filter(team => team.clubId === club.id)
        .map(({ id, name }) => ({ id, name })),
    })),
  };
}

/** Teams the caller owns that are not yet attached to any club. */
export async function listAttachableTeams(
  db: ClubCalendarDb,
  userId: string,
): Promise<ActionResult<TeamSummary[]>> {
  const rows = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(and(eq(teams.ownerId, userId), isNull(teams.clubId)))
    .orderBy(asc(teams.name));
  return { success: true, data: rows };
}

async function isClubMember(
  db: Executor,
  userId: string,
  clubId: number,
): Promise<boolean> {
  return (await clubRole(db, userId, clubId)) !== null;
}

async function clubRole(
  db: Executor,
  userId: string,
  clubId: number,
): Promise<ClubMemberRole | null> {
  const [membership] = await db
    .select({ role: clubMembers.role })
    .from(clubMembers)
    .where(and(eq(clubMembers.clubId, clubId), eq(clubMembers.userId, userId)))
    .limit(1);
  return membership?.role ?? null;
}

// ─── Seasons ─────────────────────────────────────────────────────────────

const seasonColumns = {
  id: seasons.id,
  clubId: seasons.clubId,
  name: seasons.name,
  startsOn: seasons.startsOn,
  endsOn: seasons.endsOn,
};

export async function listClubSeasons(
  db: ClubCalendarDb,
  userId: string,
  input: ClubScopeInput,
): Promise<ActionResult<SeasonListItem[]>> {
  const role = await clubRole(db, userId, input.clubId);
  if (!role) return { success: false, error: { code: E.CLUB_NOT_FOUND } };
  const rows = await db
    .select({
      ...seasonColumns,
      // Qualified by hand: Drizzle renders bare column names here, which the
      // correlated subquery would resolve against "fixtures".
      fixtureCount: sql<number>`(SELECT count(*)::int FROM "fixtures" AS "usage" WHERE "usage"."season_id" = "seasons"."id")`,
    })
    .from(seasons)
    .where(eq(seasons.clubId, input.clubId))
    .orderBy(sql`${seasons.startsOn} DESC NULLS LAST`, asc(seasons.name));
  return {
    success: true,
    data: rows.map(row => ({
      ...row,
      fixtureCount: role === "admin" ? row.fixtureCount : null,
    })),
  };
}

export function createSeason(
  db: ClubCalendarDb,
  userId: string,
  input: CreateSeasonInput,
): Promise<ActionResult<SeasonDto>> {
  return run("write", () =>
    db.transaction(async tx => {
      await requireClubAdmin(tx, userId, input.clubId);
      const [season] = await tx
        .insert(seasons)
        .values({
          clubId: input.clubId,
          name: input.name,
          startsOn: input.startsOn ?? null,
          endsOn: input.endsOn ?? null,
        })
        .returning(seasonColumns);
      return season;
    }),
  );
}

async function lockSeasonForAdmin(
  tx: Transaction,
  userId: string,
  seasonId: number,
): Promise<void> {
  const [season] = await tx
    .select({ clubId: seasons.clubId })
    .from(seasons)
    .where(eq(seasons.id, seasonId))
    .for("update");
  if (!season) throw new ClubCalendarError(E.SEASON_NOT_FOUND);
  await requireClubAdmin(tx, userId, season.clubId, E.SEASON_NOT_FOUND);
}

export function updateSeason(
  db: ClubCalendarDb,
  userId: string,
  input: UpdateSeasonInput,
): Promise<ActionResult<SeasonDto>> {
  return run("write", () =>
    db.transaction(async tx => {
      await lockSeasonForAdmin(tx, userId, input.seasonId);
      const [season] = await tx
        .update(seasons)
        .set({
          name: input.name,
          startsOn: input.startsOn ?? null,
          endsOn: input.endsOn ?? null,
          updatedAt: new Date(),
        })
        .where(eq(seasons.id, input.seasonId))
        .returning(seasonColumns);
      return season;
    }),
  );
}

export function deleteSeason(
  db: ClubCalendarDb,
  userId: string,
  input: DeleteSeasonInput,
): Promise<ActionResult<{ id: number }>> {
  return run("delete", () =>
    db.transaction(async tx => {
      await lockSeasonForAdmin(tx, userId, input.seasonId);
      await tx.delete(seasons).where(eq(seasons.id, input.seasonId));
      return { id: input.seasonId };
    }),
  );
}

// ─── Opponents ───────────────────────────────────────────────────────────

const opponentColumns = {
  id: opponents.id,
  clubId: opponents.clubId,
  name: opponents.name,
};

export async function listClubOpponents(
  db: ClubCalendarDb,
  userId: string,
  input: ClubScopeInput,
): Promise<ActionResult<OpponentListItem[]>> {
  const role = await clubRole(db, userId, input.clubId);
  if (!role) return { success: false, error: { code: E.CLUB_NOT_FOUND } };
  const rows = await db
    .select({
      ...opponentColumns,
      fixtureCount: sql<number>`(SELECT count(*)::int FROM "fixtures" AS "usage" WHERE "usage"."opponent_id" = "opponents"."id")`,
    })
    .from(opponents)
    .where(eq(opponents.clubId, input.clubId))
    .orderBy(asc(opponents.name));
  return {
    success: true,
    data: rows.map(row => ({
      ...row,
      fixtureCount: role === "admin" ? row.fixtureCount : null,
    })),
  };
}

export function createOpponent(
  db: ClubCalendarDb,
  userId: string,
  input: CreateOpponentInput,
): Promise<ActionResult<OpponentDto>> {
  return run("write", () =>
    db.transaction(async tx => {
      await requireClubAdmin(tx, userId, input.clubId);
      const [opponent] = await tx
        .insert(opponents)
        .values({ clubId: input.clubId, name: input.name })
        .returning(opponentColumns);
      return opponent;
    }),
  );
}

async function lockOpponentForAdmin(
  tx: Transaction,
  userId: string,
  opponentId: number,
): Promise<void> {
  const [opponent] = await tx
    .select({ clubId: opponents.clubId })
    .from(opponents)
    .where(eq(opponents.id, opponentId))
    .for("update");
  if (!opponent) throw new ClubCalendarError(E.OPPONENT_NOT_FOUND);
  await requireClubAdmin(tx, userId, opponent.clubId, E.OPPONENT_NOT_FOUND);
}

export function updateOpponent(
  db: ClubCalendarDb,
  userId: string,
  input: UpdateOpponentInput,
): Promise<ActionResult<OpponentDto>> {
  return run("write", () =>
    db.transaction(async tx => {
      await lockOpponentForAdmin(tx, userId, input.opponentId);
      const [opponent] = await tx
        .update(opponents)
        .set({ name: input.name, updatedAt: new Date() })
        .where(eq(opponents.id, input.opponentId))
        .returning(opponentColumns);
      return opponent;
    }),
  );
}

export function deleteOpponent(
  db: ClubCalendarDb,
  userId: string,
  input: DeleteOpponentInput,
): Promise<ActionResult<{ id: number }>> {
  return run("delete", () =>
    db.transaction(async tx => {
      await lockOpponentForAdmin(tx, userId, input.opponentId);
      await tx.delete(opponents).where(eq(opponents.id, input.opponentId));
      return { id: input.opponentId };
    }),
  );
}

// ─── Fixtures ────────────────────────────────────────────────────────────

/**
 * ADR 0005 read rule: the caller is a member of the fixture's club AND has
 * a server-validated link to the fixture's team (registered owner, roster
 * row or `team_staff` row). Club membership alone never grants access to a
 * team's fixtures. Staff read only; writes stay with the registered owner.
 */
function readableFixture(executor: Executor, userId: string): SQL {
  const clubMembership = exists(
    executor
      .select({ one: sql`1` })
      .from(clubMembers)
      .where(
        and(
          eq(clubMembers.clubId, fixtures.clubId),
          eq(clubMembers.userId, userId),
        ),
      ),
  );
  const rosterLink = exists(
    executor
      .select({ one: sql`1` })
      .from(teamMembers)
      .where(
        and(
          eq(teamMembers.teamId, fixtures.teamId),
          eq(teamMembers.playerId, userId),
        ),
      ),
  );
  const staffLink = exists(
    executor
      .select({ one: sql`1` })
      .from(teamStaff)
      .where(
        and(
          eq(teamStaff.teamId, fixtures.teamId),
          eq(teamStaff.userId, userId),
        ),
      ),
  );
  return and(
    clubMembership,
    or(eq(teams.ownerId, userId), rosterLink, staffLink),
  ) as SQL;
}

async function selectReadableFixtures(
  executor: Executor,
  userId: string,
  filters: SQL[],
): Promise<FixtureDto[]> {
  const rows = await executor
    .select({
      id: fixtures.id,
      clubId: fixtures.clubId,
      teamId: teams.id,
      teamName: teams.name,
      teamOwnerId: teams.ownerId,
      seasonId: seasons.id,
      seasonName: seasons.name,
      opponentId: opponents.id,
      opponentName: opponents.name,
      competitionName: fixtures.competitionName,
      startsAt: fixtures.startsAt,
      linkedMatchSessionId: fixtureMatchSessions.matchSessionId,
    })
    .from(fixtures)
    .innerJoin(teams, eq(teams.id, fixtures.teamId))
    .innerJoin(seasons, eq(seasons.id, fixtures.seasonId))
    .innerJoin(opponents, eq(opponents.id, fixtures.opponentId))
    .leftJoin(
      fixtureMatchSessions,
      eq(fixtureMatchSessions.fixtureId, fixtures.id),
    )
    .where(and(readableFixture(executor, userId), ...filters))
    .orderBy(asc(fixtures.startsAt), asc(fixtures.id));

  return rows.map(row => ({
    id: row.id,
    clubId: row.clubId,
    team: { id: row.teamId, name: row.teamName },
    season: { id: row.seasonId, name: row.seasonName },
    opponent: { id: row.opponentId, name: row.opponentName },
    competitionName: row.competitionName,
    startsAt: row.startsAt.toISOString(),
    linkedMatchSessionId: row.linkedMatchSessionId ?? null,
    canManage: row.teamOwnerId === userId,
  }));
}

export async function listClubFixtures(
  db: ClubCalendarDb,
  userId: string,
  input: ListClubFixturesInput,
): Promise<ActionResult<FixtureDto[]>> {
  if (!(await isClubMember(db, userId, input.clubId))) {
    return { success: false, error: { code: E.CLUB_NOT_FOUND } };
  }
  const filters: SQL[] = [eq(fixtures.clubId, input.clubId)];
  if (input.seasonId) filters.push(eq(fixtures.seasonId, input.seasonId));
  if (input.teamId) filters.push(eq(fixtures.teamId, input.teamId));
  if (input.from) filters.push(gte(fixtures.startsAt, new Date(input.from)));
  if (input.to) filters.push(lte(fixtures.startsAt, new Date(input.to)));
  return {
    success: true,
    data: await selectReadableFixtures(db, userId, filters),
  };
}

/**
 * Same FIXTURE_NOT_FOUND response for an unknown ID and for a fixture outside
 * the caller's scope.
 */
export async function getFixture(
  db: ClubCalendarDb,
  userId: string,
  input: FixtureScopeInput,
): Promise<ActionResult<FixtureDto>> {
  const [fixture] = await selectReadableFixtures(db, userId, [
    eq(fixtures.id, input.fixtureId),
  ]);
  if (!fixture) return { success: false, error: { code: E.FIXTURE_NOT_FOUND } };
  return { success: true, data: fixture };
}

async function readCreatedFixture(
  tx: Transaction,
  userId: string,
  fixtureId: number,
): Promise<FixtureDto> {
  const [fixture] = await selectReadableFixtures(tx, userId, [
    eq(fixtures.id, fixtureId),
  ]);
  if (!fixture) throw new ClubCalendarError(E.UNKNOWN_ERROR);
  return fixture;
}

/**
 * ADR 0005 write rule: club member AND registered team owner. Club scope is
 * taken from the persisted team row, never from the client. An optional
 * match-session link is created in the same transaction, so a refused link
 * leaves no fixture behind.
 */
export function createFixture(
  db: ClubCalendarDb,
  userId: string,
  input: CreateFixtureInput,
): Promise<ActionResult<FixtureDto>> {
  return run("write", () =>
    db.transaction(async tx => {
      const team = await lockOwnedTeam(tx, userId, input.teamId, "share");
      if (team.clubId === null) {
        throw new ClubCalendarError(E.TEAM_NOT_IN_CLUB);
      }
      if (!(await lockMembership(tx, userId, team.clubId))) {
        throw new ClubCalendarError(E.FORBIDDEN);
      }
      const [fixture] = await tx
        .insert(fixtures)
        .values({
          clubId: team.clubId,
          teamId: team.id,
          seasonId: input.seasonId,
          opponentId: input.opponentId,
          competitionName: input.competitionName,
          startsAt: new Date(input.startsAt),
          createdBy: userId,
        })
        .returning({ id: fixtures.id });
      if (input.matchSessionId) {
        await tx.insert(fixtureMatchSessions).values({
          fixtureId: fixture.id,
          teamId: team.id,
          matchSessionId: input.matchSessionId,
        });
      }
      return readCreatedFixture(tx, userId, fixture.id);
    }),
  );
}

async function lockFixtureForOwner(
  tx: Transaction,
  userId: string,
  fixtureId: number,
): Promise<{ id: number; teamId: number }> {
  const [fixture] = await tx
    .select({
      id: fixtures.id,
      teamId: fixtures.teamId,
      clubId: fixtures.clubId,
      ownerId: teams.ownerId,
    })
    .from(fixtures)
    .innerJoin(teams, eq(teams.id, fixtures.teamId))
    .where(eq(fixtures.id, fixtureId))
    .for("share");
  if (!fixture) throw new ClubCalendarError(E.FIXTURE_NOT_FOUND);
  // Out-of-scope fixtures are indistinguishable from unknown ones.
  if (!(await lockMembership(tx, userId, fixture.clubId))) {
    throw new ClubCalendarError(E.FIXTURE_NOT_FOUND);
  }
  if (fixture.ownerId !== userId) {
    const linked = await hasTeamLink(tx, userId, fixture.teamId);
    throw new ClubCalendarError(linked ? E.FORBIDDEN : E.FIXTURE_NOT_FOUND);
  }
  return { id: fixture.id, teamId: fixture.teamId };
}

export function linkMatchSession(
  db: ClubCalendarDb,
  userId: string,
  input: LinkMatchSessionInput,
): Promise<ActionResult<FixtureDto>> {
  return run("write", () =>
    db.transaction(async tx => {
      const fixture = await lockFixtureForOwner(tx, userId, input.fixtureId);
      // The composite FK rejects a match session of another team.
      await tx.insert(fixtureMatchSessions).values({
        fixtureId: fixture.id,
        teamId: fixture.teamId,
        matchSessionId: input.matchSessionId,
      });
      return readCreatedFixture(tx, userId, fixture.id);
    }),
  );
}

export function unlinkMatchSession(
  db: ClubCalendarDb,
  userId: string,
  input: FixtureScopeInput,
): Promise<ActionResult<FixtureDto>> {
  return run("write", () =>
    db.transaction(async tx => {
      const fixture = await lockFixtureForOwner(tx, userId, input.fixtureId);
      await tx
        .delete(fixtureMatchSessions)
        .where(eq(fixtureMatchSessions.fixtureId, fixture.id));
      return readCreatedFixture(tx, userId, fixture.id);
    }),
  );
}
