import { randomUUID } from "node:crypto";
import path from "node:path";
import { sql as drizzleSql } from "drizzle-orm";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as schema from "@/db/schema";
import * as calendar from "../club-calendar";

/**
 * ADR 0004/0005 "Verificação" against a real PostgreSQL. Runs only when
 * JOGABOLA_TEST_DATABASE_URL points to the admin database of a disposable
 * local server; a throwaway database is created and dropped.
 */
const adminUrl = process.env.JOGABOLA_TEST_DATABASE_URL;
const localHosts = new Set(["localhost", "127.0.0.1", "[::1]", "postgres"]);
const enabled = Boolean(adminUrl && localHosts.has(new URL(adminUrl).hostname));

const U = {
  capA: "it-cap-a",
  athleteA: "it-athlete-a",
  athleteNoClub: "it-athlete-no-club",
  memberNoTeam: "it-member-no-team",
  coCaptainA: "it-co-captain-a",
  rosterOwnerA: "it-roster-owner-a",
  adminA2: "it-admin-a2",
  capB: "it-cap-b",
  memberB: "it-member-b",
  outsider: "it-outsider",
} as const;

describe.skipIf(!enabled)("club calendar authorization (PostgreSQL)", () => {
  const dbName = `jogabola_it_${randomUUID().replaceAll("-", "")}`;
  let admin: ReturnType<typeof postgres>;
  let client: ReturnType<typeof postgres>;
  let db: calendar.ClubCalendarDb;
  const ids = {} as Record<
    | "teamA"
    | "teamA2"
    | "teamFree"
    | "teamB"
    | "clubA"
    | "clubB"
    | "sessionA"
    | "sessionA2"
    | "sessionB"
    | "seasonA"
    | "seasonB"
    | "opponentA"
    | "opponentB"
    | "fixtureA",
    number
  >;

  async function insertTeam(slug: string, ownerId: string) {
    const [team] = await client<{ id: number }[]>`
      INSERT INTO teams (name, slug, owner_id) VALUES (${slug}, ${slug}, ${ownerId}) RETURNING id
    `;
    return team.id;
  }

  async function insertSession(teamId: number) {
    const [session] = await client<{ id: number }[]>`
      INSERT INTO match_sessions (team_id, title, location, starts_at)
      VALUES (${teamId}, 'Convocatória', 'Lisboa', '2026-12-05 10:00:00') RETURNING id
    `;
    return session.id;
  }

  async function addMember(clubId: number, userId: string, role: string) {
    await client`INSERT INTO club_members (club_id, user_id, role) VALUES (${clubId}, ${userId}, ${role})`;
  }

  function unwrap<T>(result: { success: true; data: T } | { success: false }) {
    if (!result.success) throw new Error(JSON.stringify(result));
    return result.data;
  }

  const fixtureInput = () => ({
    teamId: ids.teamA,
    seasonId: ids.seasonA,
    opponentId: ids.opponentA,
    competitionName: "Distrital",
    startsAt: "2026-12-06T15:00:00Z",
  });

  beforeAll(async () => {
    admin = postgres(adminUrl as string, { max: 1 });
    await admin.unsafe(`CREATE DATABASE "${dbName}"`);
    const url = new URL(adminUrl as string);
    url.pathname = `/${dbName}`;
    client = postgres(url.toString(), { max: 4, onnotice: () => {} });
    const migrations = readMigrationFiles({
      migrationsFolder: path.resolve(__dirname, "../../migrations/current"),
    });
    await client.begin(async tx => {
      for (const migration of migrations) {
        for (const statement of migration.sql) {
          if (statement.trim()) await tx.unsafe(statement);
        }
      }
    });
    db = drizzle(client, { schema });

    for (const id of Object.values(U)) {
      await client`INSERT INTO "user" (id, name, email) VALUES (${id}, ${id}, ${`${id}@example.test`})`;
    }
    ids.teamA = await insertTeam("it-team-a", U.capA);
    ids.teamA2 = await insertTeam("it-team-a2", U.capA);
    ids.teamFree = await insertTeam("it-team-free", U.capA);
    ids.teamB = await insertTeam("it-team-b", U.capB);
    for (const [userId, role] of [
      [U.capA, "owner"],
      [U.athleteA, "player"],
      [U.athleteNoClub, "player"],
      [U.coCaptainA, "manager"],
      [U.rosterOwnerA, "owner"],
    ]) {
      await client`INSERT INTO team_members (team_id, player_id, role) VALUES (${ids.teamA}, ${userId}, ${role})`;
    }
    ids.sessionA = await insertSession(ids.teamA);
    ids.sessionA2 = await insertSession(ids.teamA);
    ids.sessionB = await insertSession(ids.teamB);
  }, 60_000);

  afterAll(async () => {
    await client?.end({ timeout: 5 });
    if (admin) {
      await admin.unsafe(`DROP DATABASE IF EXISTS "${dbName}"`);
      await admin.end({ timeout: 5 });
    }
  });

  it("creates a club atomically with a team owned by the caller", async () => {
    await expect(
      calendar.createClubWithTeam(db, U.athleteA, {
        name: "Clube A",
        teamId: ids.teamA,
      }),
    ).resolves.toEqual({ success: false, error: { code: "FORBIDDEN" } });
    await expect(
      calendar.createClubWithTeam(db, U.outsider, {
        name: "Clube A",
        teamId: ids.teamA,
      }),
    ).resolves.toEqual({ success: false, error: { code: "TEAM_NOT_FOUND" } });

    const created = unwrap(
      await calendar.createClubWithTeam(db, U.capA, {
        name: "Clube A",
        teamId: ids.teamA,
      }),
    );
    ids.clubA = created.club.id;
    const createdB = unwrap(
      await calendar.createClubWithTeam(db, U.capB, {
        name: "Clube B",
        teamId: ids.teamB,
      }),
    );
    ids.clubB = createdB.club.id;

    await expect(
      calendar.createClubWithTeam(db, U.capA, {
        name: "Outro",
        teamId: ids.teamA,
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: "TEAM_ALREADY_IN_CLUB" },
    });
    const [{ count }] = await client<
      { count: number }[]
    >`SELECT count(*)::int FROM clubs`;
    expect(count).toBe(2);

    const clubs = unwrap(await calendar.listMyClubs(db, U.capA));
    expect(clubs).toEqual([
      {
        id: ids.clubA,
        name: "Clube A",
        role: "admin",
        ownedTeams: [{ id: ids.teamA, name: "it-team-a" }],
      },
    ]);

    await addMember(ids.clubA, U.athleteA, "member");
    await addMember(ids.clubA, U.athleteNoClub, "member");
    await addMember(ids.clubA, U.memberNoTeam, "member");
    await addMember(ids.clubA, U.coCaptainA, "member");
    await addMember(ids.clubA, U.rosterOwnerA, "member");
    await addMember(ids.clubA, U.adminA2, "admin");
    await addMember(ids.clubB, U.memberB, "member");
  });

  it("attaches a free team only for a club admin who owns the team", async () => {
    await expect(
      calendar.attachTeamToClub(db, U.capB, {
        clubId: ids.clubA,
        teamId: ids.teamB,
      }),
    ).resolves.toEqual({ success: false, error: { code: "CLUB_NOT_FOUND" } });
    await expect(
      calendar.attachTeamToClub(db, U.athleteA, {
        clubId: ids.clubA,
        teamId: ids.teamA2,
      }),
    ).resolves.toEqual({ success: false, error: { code: "FORBIDDEN" } });
    await expect(
      calendar.attachTeamToClub(db, U.adminA2, {
        clubId: ids.clubA,
        teamId: ids.teamA2,
      }),
    ).resolves.toEqual({ success: false, error: { code: "TEAM_NOT_FOUND" } });

    unwrap(
      await calendar.attachTeamToClub(db, U.capA, {
        clubId: ids.clubA,
        teamId: ids.teamA2,
      }),
    );
    expect(unwrap(await calendar.listAttachableTeams(db, U.capA))).toEqual([
      { id: ids.teamFree, name: "it-team-free" },
    ]);
  });

  it("serializes concurrent attachments of the same free team", async () => {
    const [{ id: clubC }] = await client<
      { id: number }[]
    >`INSERT INTO clubs (name) VALUES ('Clube C') RETURNING id`;
    await addMember(clubC, U.capA, "admin");

    const results = await Promise.all([
      calendar.attachTeamToClub(db, U.capA, {
        clubId: ids.clubA,
        teamId: ids.teamFree,
      }),
      calendar.attachTeamToClub(db, U.capA, {
        clubId: clubC,
        teamId: ids.teamFree,
      }),
    ]);
    expect(results.filter(result => result.success)).toHaveLength(1);
    expect(results.find(result => !result.success)).toEqual({
      success: false,
      error: { code: "TEAM_ALREADY_IN_CLUB" },
    });
  });

  it("lets only club admins manage seasons and opponents", async () => {
    ids.seasonA = unwrap(
      await calendar.createSeason(db, U.capA, {
        clubId: ids.clubA,
        name: "2026/27",
        startsOn: "2026-09-01",
        endsOn: "2027-06-30",
      }),
    ).id;
    ids.seasonB = unwrap(
      await calendar.createSeason(db, U.capB, {
        clubId: ids.clubB,
        name: "2026/27",
      }),
    ).id;
    ids.opponentA = unwrap(
      await calendar.createOpponent(db, U.adminA2, {
        clubId: ids.clubA,
        name: "Adversário A",
      }),
    ).id;
    ids.opponentB = unwrap(
      await calendar.createOpponent(db, U.capB, {
        clubId: ids.clubB,
        name: "Adversário B",
      }),
    ).id;

    await expect(
      calendar.createSeason(db, U.athleteA, { clubId: ids.clubA, name: "X1" }),
    ).resolves.toEqual({ success: false, error: { code: "FORBIDDEN" } });
    await expect(
      calendar.createSeason(db, U.memberB, { clubId: ids.clubA, name: "X1" }),
    ).resolves.toEqual({ success: false, error: { code: "CLUB_NOT_FOUND" } });
    await expect(
      calendar.createSeason(db, U.capA, { clubId: ids.clubA, name: "2026/27" }),
    ).resolves.toEqual({
      success: false,
      error: { code: "SEASON_NAME_TAKEN" },
    });
    await expect(
      calendar.createOpponent(db, U.capA, {
        clubId: ids.clubA,
        name: "Adversário A",
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: "OPPONENT_NAME_TAKEN" },
    });
    // Another club's admin cannot see or change club A's rows.
    await expect(
      calendar.updateSeason(db, U.capB, { seasonId: ids.seasonA, name: "Z" }),
    ).resolves.toEqual({
      success: false,
      error: { code: "SEASON_NOT_FOUND" },
    });
    await expect(
      calendar.deleteOpponent(db, U.capB, { opponentId: ids.opponentA }),
    ).resolves.toEqual({
      success: false,
      error: { code: "OPPONENT_NOT_FOUND" },
    });
    await expect(
      calendar.listClubSeasons(db, U.memberB, { clubId: ids.clubA }),
    ).resolves.toEqual({ success: false, error: { code: "CLUB_NOT_FOUND" } });
    expect(
      unwrap(
        await calendar.listClubSeasons(db, U.athleteA, { clubId: ids.clubA }),
      ),
    ).toEqual([
      {
        id: ids.seasonA,
        clubId: ids.clubA,
        name: "2026/27",
        startsOn: "2026-09-01",
        endsOn: "2027-06-30",
      },
    ]);
  });

  it("creates fixtures only for a club member who owns the team", async () => {
    for (const userId of [
      U.athleteA,
      U.coCaptainA,
      U.rosterOwnerA, // a roster "owner" role does not replace teams.owner_id
    ]) {
      await expect(
        calendar.createFixture(db, userId, fixtureInput()),
      ).resolves.toEqual({ success: false, error: { code: "FORBIDDEN" } });
    }
    await expect(
      calendar.createFixture(db, U.adminA2, fixtureInput()),
    ).resolves.toEqual({ success: false, error: { code: "TEAM_NOT_FOUND" } });
    await expect(
      calendar.createFixture(db, U.capA, {
        ...fixtureInput(),
        seasonId: ids.seasonB,
      }),
    ).resolves.toEqual({ success: false, error: { code: "SEASON_NOT_FOUND" } });
    await expect(
      calendar.createFixture(db, U.capA, {
        ...fixtureInput(),
        opponentId: ids.opponentB,
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: "OPPONENT_NOT_FOUND" },
    });

    const standalone = unwrap(
      await calendar.createFixture(db, U.capA, fixtureInput()),
    );
    expect(standalone.linkedMatchSessionId).toBeNull();
    ids.fixtureA = standalone.id;

    const linked = unwrap(
      await calendar.createFixture(db, U.capA, {
        ...fixtureInput(),
        matchSessionId: ids.sessionA,
      }),
    );
    expect(linked.linkedMatchSessionId).toBe(ids.sessionA);
  });

  it("rolls back fixture creation when the link is refused", async () => {
    const [{ count: before }] = await client<
      { count: number }[]
    >`SELECT count(*)::int FROM fixtures`;
    await expect(
      calendar.createFixture(db, U.capA, {
        ...fixtureInput(),
        matchSessionId: ids.sessionB,
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: "MATCH_SESSION_NOT_FOUND" },
    });
    await expect(
      calendar.createFixture(db, U.capA, {
        ...fixtureInput(),
        matchSessionId: ids.sessionA,
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: "MATCH_SESSION_ALREADY_LINKED" },
    });
    const [{ count: after }] = await client<
      { count: number }[]
    >`SELECT count(*)::int FROM fixtures`;
    expect(after).toBe(before);
  });

  it("returns the same response for out-of-scope and unknown fixtures", async () => {
    const outOfScope = await calendar.getFixture(db, U.memberB, {
      fixtureId: ids.fixtureA,
    });
    const unknown = await calendar.getFixture(db, U.memberB, {
      fixtureId: 2_000_000_000,
    });
    expect(outOfScope).toEqual(unknown);
    expect(outOfScope).toEqual({
      success: false,
      error: { code: "FIXTURE_NOT_FOUND" },
    });
  });

  it("reads fixtures with club membership and a team link only", async () => {
    for (const userId of [U.capA, U.athleteA, U.coCaptainA]) {
      const fixture = unwrap(
        await calendar.getFixture(db, userId, { fixtureId: ids.fixtureA }),
      );
      expect(Object.keys(fixture).sort()).toEqual(
        [
          "canManage",
          "clubId",
          "competitionName",
          "id",
          "linkedMatchSessionId",
          "opponent",
          "season",
          "startsAt",
          "team",
        ].sort(),
      );
      expect(fixture.startsAt).toBe("2026-12-06T15:00:00.000Z");
      expect(fixture.canManage).toBe(userId === U.capA);
    }

    // Same club, no access to the team.
    await expect(
      calendar.getFixture(db, U.memberNoTeam, { fixtureId: ids.fixtureA }),
    ).resolves.toEqual({
      success: false,
      error: { code: "FIXTURE_NOT_FOUND" },
    });
    expect(
      unwrap(
        await calendar.listClubFixtures(db, U.memberNoTeam, {
          clubId: ids.clubA,
        }),
      ),
    ).toEqual([]);

    // Team member whose club membership was removed.
    await client`DELETE FROM club_members WHERE club_id = ${ids.clubA} AND user_id = ${U.athleteNoClub}`;
    await expect(
      calendar.getFixture(db, U.athleteNoClub, { fixtureId: ids.fixtureA }),
    ).resolves.toEqual({
      success: false,
      error: { code: "FIXTURE_NOT_FOUND" },
    });
    await expect(
      calendar.listClubFixtures(db, U.athleteNoClub, { clubId: ids.clubA }),
    ).resolves.toEqual({ success: false, error: { code: "CLUB_NOT_FOUND" } });

    // Club B cannot list club A's calendar.
    await expect(
      calendar.listClubFixtures(db, U.memberB, { clubId: ids.clubA }),
    ).resolves.toEqual({ success: false, error: { code: "CLUB_NOT_FOUND" } });

    const list = unwrap(
      await calendar.listClubFixtures(db, U.athleteA, {
        clubId: ids.clubA,
        seasonId: ids.seasonA,
        from: "2026-12-01T00:00:00Z",
        to: "2026-12-31T23:59:59Z",
      }),
    );
    expect(list).toHaveLength(2);
    expect(list.every(fixture => fixture.team.id === ids.teamA)).toBe(true);
  });

  it("links match sessions only for the team owner, one per side", async () => {
    await expect(
      calendar.linkMatchSession(db, U.coCaptainA, {
        fixtureId: ids.fixtureA,
        matchSessionId: ids.sessionA2,
      }),
    ).resolves.toEqual({ success: false, error: { code: "FORBIDDEN" } });
    await expect(
      calendar.linkMatchSession(db, U.memberB, {
        fixtureId: ids.fixtureA,
        matchSessionId: ids.sessionA2,
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: "FIXTURE_NOT_FOUND" },
    });
    await expect(
      calendar.linkMatchSession(db, U.capA, {
        fixtureId: ids.fixtureA,
        matchSessionId: ids.sessionB,
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: "MATCH_SESSION_NOT_FOUND" },
    });

    const linked = unwrap(
      await calendar.linkMatchSession(db, U.capA, {
        fixtureId: ids.fixtureA,
        matchSessionId: ids.sessionA2,
      }),
    );
    expect(linked.linkedMatchSessionId).toBe(ids.sessionA2);
    await expect(
      calendar.linkMatchSession(db, U.capA, {
        fixtureId: ids.fixtureA,
        matchSessionId: ids.sessionA,
      }),
    ).resolves.toEqual({
      success: false,
      error: { code: "FIXTURE_ALREADY_LINKED" },
    });

    const unlinked = unwrap(
      await calendar.unlinkMatchSession(db, U.capA, {
        fixtureId: ids.fixtureA,
      }),
    );
    expect(unlinked.linkedMatchSessionId).toBeNull();
    unwrap(
      await calendar.linkMatchSession(db, U.capA, {
        fixtureId: ids.fixtureA,
        matchSessionId: ids.sessionA2,
      }),
    );
  });

  it("refuses to delete seasons and opponents in use", async () => {
    await expect(
      calendar.deleteSeason(db, U.capA, { seasonId: ids.seasonA }),
    ).resolves.toEqual({ success: false, error: { code: "SEASON_IN_USE" } });
    await expect(
      calendar.deleteOpponent(db, U.capA, { opponentId: ids.opponentA }),
    ).resolves.toEqual({ success: false, error: { code: "OPPONENT_IN_USE" } });
    const spare = unwrap(
      await calendar.createSeason(db, U.capA, {
        clubId: ids.clubA,
        name: "Pré-época",
      }),
    );
    unwrap(await calendar.deleteSeason(db, U.capA, { seasonId: spare.id }));
  });

  it("keeps the fixture when its match session is deleted", async () => {
    await client`DELETE FROM match_sessions WHERE id = ${ids.sessionA2}`;
    const fixture = unwrap(
      await calendar.getFixture(db, U.capA, { fixtureId: ids.fixtureA }),
    );
    expect(fixture.linkedMatchSessionId).toBeNull();
  });

  it("keeps a team with fixtures bound to its club", async () => {
    await expect(
      db.execute(
        drizzleSql`UPDATE teams SET club_id = NULL WHERE id = ${ids.teamA}`,
      ),
    ).rejects.toMatchObject({
      cause: { code: "23503", constraint_name: "fixtures_team_club_fk" },
    });
  });
});
