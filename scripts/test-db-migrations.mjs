import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { readMigrationFiles } from "drizzle-orm/migrator";
import postgres from "postgres";

const databaseUrl = process.env.JOGABOLA_TEST_DATABASE_URL;
if (!databaseUrl) throw new Error("JOGABOLA_TEST_DATABASE_URL is required.");
const adminUrl = new URL(databaseUrl);
const localHosts = new Set(["localhost", "127.0.0.1", "[::1]", "postgres"]);
if (
  !["postgres:", "postgresql:"].includes(adminUrl.protocol) ||
  !localHosts.has(adminUrl.hostname)
) {
  throw new Error(
    "JOGABOLA_TEST_DATABASE_URL must point to a disposable local PostgreSQL server.",
  );
}

const run = promisify(execFile);
const connectionOptions = { max: 1, connect_timeout: 10 };
const admin = postgres(adminUrl.toString(), connectionOptions);
const disposableDatabases = [];
const migrations = readMigrationFiles({
  migrationsFolder: fileURLToPath(
    new URL("../src/db/migrations/current", import.meta.url),
  ),
});

async function makeDatabase(purpose) {
  const name = `jogabola_${purpose}_${randomUUID().replaceAll("-", "")}`;
  await admin`CREATE DATABASE ${admin(name)}`;
  const url = new URL(adminUrl);
  url.pathname = `/${name}`;
  const sql = postgres(url.toString(), connectionOptions);
  const database = { name, url, sql };
  disposableDatabases.push(database);
  return database;
}

function command(database, commandName) {
  return run("pnpm", [commandName], {
    env: { ...process.env, DATABASE_URL: database.url.toString() },
  });
}

async function readCatalog(sql) {
  const columns = await sql`
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, column_name
  `;
  const keys = await sql`
    SELECT c.relname AS table_name, k.conname, pg_get_constraintdef(k.oid) AS definition
    FROM pg_constraint AS k JOIN pg_class AS c ON c.oid = k.conrelid
      JOIN pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    ORDER BY c.relname, k.conname
  `;
  const indexes = await sql`
    SELECT tablename AS table_name, indexname, indexdef
    FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname
  `;
  return {
    columns: Array.from(columns),
    keys: Array.from(keys),
    indexes: Array.from(indexes),
  };
}

async function loadLegacyArena(sql) {
  // Text-ID auth tables match the archived introspection, independently of the broken UUID/serial history.
  await sql`
    CREATE TABLE "user" (
      id text PRIMARY KEY, name text NOT NULL, email text NOT NULL,
      image text, email_verified boolean NOT NULL DEFAULT false,
      created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now(),
      CONSTRAINT user_email_unique UNIQUE (email)
    )
  `;
  const legacyFiles = [
    "0007_nebulous_ender_wiggin.sql",
    "0012_tiny_crystal.sql",
    "0013_arena_tables.sql",
    "0014_user_onboarding.sql",
    "0016_team_payment_settings.sql",
    "0017_user_plan_tier.sql",
    "0019_payment_manual_override.sql",
    "0021_event_messages.sql",
    "0023_player_ratings.sql",
  ];
  for (const file of legacyFiles) {
    const source = await readFile(
      new URL(`../src/db/migrations/${file}`, import.meta.url),
      "utf8",
    );
    await sql.unsafe(source).simple();
  }
  await sql`CREATE SCHEMA drizzle`;
  await sql`CREATE TABLE drizzle.__drizzle_migrations (id serial PRIMARY KEY, hash text NOT NULL, created_at bigint)`;
  await sql`INSERT INTO drizzle.__drizzle_migrations (hash, created_at) VALUES ('legacy-fixture', 1777879324025)`;
  await seedArenaData(sql);
  await sql`ALTER TABLE teams ADD COLUMN legacy_code text`;
  await sql`UPDATE teams SET legacy_code = 'legacy-team-code' WHERE id = 1`;
  await sql`INSERT INTO event_messages (match_session_id, author_id, text) VALUES (1, 'captain-test', 'Mensagem histórica')`;
  await sql`INSERT INTO wallet (user_id, address) VALUES ('captain-test', 'legacy-fixture-address')`;
}

async function seedArenaData(sql) {
  await sql`INSERT INTO "user" (id, name, email) VALUES ('captain-test', 'Capitão Teste', 'captain@example.test')`;
  await sql`INSERT INTO teams (name, slug, owner_id) VALUES ('Equipa de teste', 'equipa-teste', 'captain-test')`;
  await sql`INSERT INTO team_members (team_id, player_id, role) VALUES (1, 'captain-test', 'captain')`;
  await sql`
    INSERT INTO match_sessions (team_id, title, location, starts_at)
    VALUES (1, 'Jogo de teste', 'Lisboa', '2026-11-25 19:00:00')
  `;
  await sql`INSERT INTO match_reservations (match_session_id, player_id, status) VALUES (1, 'captain-test', 'reserved_paid')`;
  await sql`
    INSERT INTO payments (match_reservation_id, amount_cents, method, status, marked_by_user_id, manual_note)
    VALUES (1, 700, 'cash', 'paid', 'captain-test', 'Referência preservada')
  `;
}

async function assertPreserved(sql, before) {
  for (const [table, rows] of Object.entries(before)) {
    const after =
      await sql`SELECT to_jsonb(t) AS row FROM ${sql(table)} AS t ORDER BY id`;
    assert.equal(after.length, rows.length, table);
    for (const [index, { row }] of rows.entries()) {
      const preserved = Object.fromEntries(
        Object.keys(row).map(key => [key, after[index].row[key]]),
      );
      assert.deepEqual(preserved, row, table);
    }
  }
}

async function assertRowsKept(sql, before) {
  // Historical rows must survive the Stage 2 checks, which add rows of their own.
  for (const [table, rows] of Object.entries(before)) {
    const after = await sql`SELECT to_jsonb(t) AS row FROM ${sql(table)} AS t`;
    const byId = new Map(after.map(({ row }) => [row.id, row]));
    for (const { row } of rows) {
      const current = byId.get(row.id);
      assert.ok(current, `${table} ${row.id}`);
      const preserved = Object.fromEntries(
        Object.keys(row).map(key => [key, current[key]]),
      );
      assert.deepEqual(preserved, row, table);
    }
  }
}

async function readRows(sql, tables) {
  const rows = await Promise.all(
    tables.map(async table => [
      table,
      await sql`SELECT to_jsonb(t) AS row FROM ${sql(table)} AS t ORDER BY id`,
    ]),
  );
  return Object.fromEntries(rows);
}

async function assertAppliedMigrations(sql) {
  const [{ count }] =
    await sql`SELECT count(*)::int FROM jogabola_migrations.__drizzle_migrations`;
  assert.equal(count, migrations.length);
}

async function assertRejectedMigration(database, error) {
  const { sql } = database;
  const catalog = await readCatalog(sql);
  const rows = await readRows(sql, trackedTables);
  await assert.rejects(command(database, "db:migration"), error);
  assert.deepEqual(await readCatalog(sql), catalog);
  await assertPreserved(sql, rows);
  const [{ journal }] =
    await sql`SELECT to_regnamespace('jogabola_migrations') AS journal`;
  assert.equal(journal, null);
}

async function assertClubCalendarConstraints(sql) {
  // Stage 2 (ADR 0004 "Verificação"), exercised directly in PostgreSQL.
  const [{ count: attachedTeams }] =
    await sql`SELECT count(*)::int FROM teams WHERE club_id IS NOT NULL`;
  assert.equal(attachedTeams, 0, "existing teams must keep club_id NULL");

  await sql`
    INSERT INTO "user" (id, name, email) VALUES
      ('club-a-captain', 'Capitão A', 'club-a-captain@example.test'),
      ('club-a-second', 'Capitão A2', 'club-a-second@example.test'),
      ('club-b-captain', 'Capitão B', 'club-b-captain@example.test')
  `;
  const [clubA] =
    await sql`INSERT INTO clubs (name, created_by) VALUES ('Clube A', 'club-a-captain') RETURNING id`;
  const [clubB] =
    await sql`INSERT INTO clubs (name, created_by) VALUES ('Clube B', 'club-b-captain') RETURNING id`;
  await sql`
    INSERT INTO club_members (club_id, user_id, role) VALUES
      (${clubA.id}, 'club-a-captain', 'admin'),
      (${clubA.id}, 'club-a-second', 'member'),
      (${clubB.id}, 'club-b-captain', 'admin')
  `;
  await assert.rejects(
    sql`INSERT INTO club_members (club_id, user_id, role) VALUES (${clubA.id}, 'club-a-captain', 'member')`,
    { code: "23505" },
  );
  await assert.rejects(
    sql`INSERT INTO club_members (club_id, user_id, role) VALUES (${clubB.id}, 'club-a-captain', 'owner')`,
    { code: "23514" },
  );

  const insertTeam = (slug, ownerId, clubId) => sql`
    INSERT INTO teams (name, slug, owner_id, club_id)
    VALUES (${slug}, ${slug}, ${ownerId}, ${clubId}) RETURNING id
  `;
  const [teamA] = await insertTeam("club-a-team", "club-a-captain", clubA.id);
  const [teamA2] = await insertTeam("club-a-team-2", "club-a-second", clubA.id);
  const [teamB] = await insertTeam("club-b-team", "club-b-captain", clubB.id);
  const [freeTeam] = await insertTeam("free-team", "club-a-captain", null);
  const insertSession = teamId => sql`
    INSERT INTO match_sessions (team_id, title, location, starts_at)
    VALUES (${teamId}, 'Convocatória', 'Lisboa', '2026-12-05 10:00:00') RETURNING id
  `;
  const [sessionA] = await insertSession(teamA.id);
  const [sessionA2] = await insertSession(teamA.id);
  const [sessionB] = await insertSession(teamB.id);

  const [seasonA] =
    await sql`INSERT INTO seasons (club_id, name) VALUES (${clubA.id}, '2026/27') RETURNING id`;
  const [seasonB] =
    await sql`INSERT INTO seasons (club_id, name) VALUES (${clubB.id}, '2026/27') RETURNING id`;
  const [opponentA] =
    await sql`INSERT INTO opponents (club_id, name) VALUES (${clubA.id}, 'Adversário A') RETURNING id`;
  const [opponentB] =
    await sql`INSERT INTO opponents (club_id, name) VALUES (${clubB.id}, 'Adversário B') RETURNING id`;

  // Season and opponent names are unique per club regardless of case, and
  // the same name stays free in another club.
  await assert.rejects(
    sql`INSERT INTO seasons (club_id, name) VALUES (${clubA.id}, '2026/27')`,
    { code: "23505", constraint_name: "seasons_club_name_ci_unique" },
  );
  await sql`INSERT INTO seasons (club_id, name) VALUES (${clubA.id}, 'Torneio Verão')`;
  await assert.rejects(
    sql`INSERT INTO seasons (club_id, name) VALUES (${clubA.id}, 'TORNEIO verão')`,
    { code: "23505", constraint_name: "seasons_club_name_ci_unique" },
  );
  await sql`DELETE FROM seasons WHERE club_id = ${clubA.id} AND name = 'Torneio Verão'`;
  await assert.rejects(
    sql`INSERT INTO opponents (club_id, name) VALUES (${clubA.id}, 'ADVERSÁRIO a')`,
    { code: "23505", constraint_name: "opponents_club_name_ci_unique" },
  );
  const [spareOpponent] =
    await sql`INSERT INTO opponents (club_id, name) VALUES (${clubA.id}, 'adversário b') RETURNING id`;
  await assert.rejects(
    sql`UPDATE opponents SET name = 'Adversário A' WHERE id = ${spareOpponent.id}`,
    { code: "23505", constraint_name: "opponents_club_name_ci_unique" },
  );
  await sql`DELETE FROM opponents WHERE id = ${spareOpponent.id}`;

  const insertFixture = (
    tx,
    { clubId, teamId, seasonId = seasonA.id, opponentId = opponentA.id },
  ) => tx`
    INSERT INTO fixtures (club_id, team_id, season_id, opponent_id, competition_name, starts_at, created_by)
    VALUES (${clubId}, ${teamId}, ${seasonId}, ${opponentId}, 'Distrital', '2026-12-06T15:00:00+00:00', 'club-a-captain')
    RETURNING id, team_id
  `;
  const link = (tx, fixture, matchSessionId) => tx`
    INSERT INTO fixture_match_sessions (fixture_id, team_id, match_session_id)
    VALUES (${fixture.id}, ${fixture.team_id}, ${matchSessionId})
  `;

  // Cross-club season, opponent and team, and a team outside any club.
  for (const values of [
    { clubId: clubA.id, teamId: teamA.id, seasonId: seasonB.id },
    { clubId: clubA.id, teamId: teamA.id, opponentId: opponentB.id },
    { clubId: clubA.id, teamId: teamB.id },
    { clubId: clubA.id, teamId: freeTeam.id },
  ]) {
    await assert.rejects(insertFixture(sql, values), { code: "23503" });
  }

  const [standalone] = await insertFixture(sql, {
    clubId: clubA.id,
    teamId: teamA.id,
  });
  const [linked] = await insertFixture(sql, {
    clubId: clubA.id,
    teamId: teamA.id,
  });
  await link(sql, linked, sessionA.id);
  const [otherTeamFixture] = await insertFixture(sql, {
    clubId: clubA.id,
    teamId: teamA2.id,
  });
  // Another team's match session, a second link to the same match session
  // and a second link for the same fixture are all rejected.
  await assert.rejects(link(sql, standalone, sessionB.id), { code: "23503" });
  await assert.rejects(
    sql`INSERT INTO fixture_match_sessions (fixture_id, team_id, match_session_id)
      VALUES (${standalone.id}, ${teamB.id}, ${sessionB.id})`,
    { code: "23503" },
  );
  await assert.rejects(link(sql, standalone, sessionA.id), { code: "23505" });
  await assert.rejects(link(sql, linked, sessionA2.id), { code: "23505" });

  // A refused link during atomic creation leaves no residual fixture.
  const [{ count: fixturesBefore }] =
    await sql`SELECT count(*)::int FROM fixtures`;
  await assert.rejects(
    sql.begin(async tx => {
      const [created] = await insertFixture(tx, {
        clubId: clubA.id,
        teamId: teamA.id,
      });
      await link(tx, created, sessionB.id);
    }),
    { code: "23503" },
  );
  const [{ count: fixturesAfter }] =
    await sql`SELECT count(*)::int FROM fixtures`;
  assert.equal(fixturesAfter, fixturesBefore);

  // A team with fixtures stays bound to its club; a free team can move.
  await assert.rejects(
    sql`UPDATE teams SET club_id = NULL WHERE id = ${teamA.id}`,
    { code: "23503", constraint_name: "fixtures_team_club_fk" },
  );
  await assert.rejects(
    sql`UPDATE teams SET club_id = ${clubB.id} WHERE id = ${teamA.id}`,
    { code: "23503", constraint_name: "fixtures_team_club_fk" },
  );
  await sql`UPDATE teams SET club_id = ${clubA.id} WHERE id = ${freeTeam.id}`;
  await sql`UPDATE teams SET club_id = NULL WHERE id = ${freeTeam.id}`;

  // Seasons and opponents in use cannot be deleted.
  // PostgreSQL reports RESTRICT violations with SQLSTATE 23503.
  await assert.rejects(sql`DELETE FROM seasons WHERE id = ${seasonA.id}`, {
    code: "23503",
    constraint_name: "fixtures_season_club_fk",
  });
  await assert.rejects(sql`DELETE FROM opponents WHERE id = ${opponentA.id}`, {
    code: "23503",
    constraint_name: "fixtures_opponent_club_fk",
  });
  await sql`DELETE FROM seasons WHERE id = ${seasonB.id}`;

  // Deleting the match session removes the link and keeps the fixture.
  await sql`DELETE FROM match_sessions WHERE id = ${sessionA.id}`;
  const [{ count: remainingLinks }] =
    await sql`SELECT count(*)::int FROM fixture_match_sessions WHERE fixture_id = ${linked.id}`;
  assert.equal(remainingLinks, 0);
  const [{ count: keptFixture }] =
    await sql`SELECT count(*)::int FROM fixtures WHERE id = ${linked.id}`;
  assert.equal(keptFixture, 1);
  await link(sql, linked, sessionA2.id);

  // Deleting the captain's account removes their teams and fixtures and
  // keeps the club, its seasons, opponents and other teams' fixtures.
  await sql`DELETE FROM "user" WHERE id = 'club-a-captain'`;
  const [{ count: captainTeams }] =
    await sql`SELECT count(*)::int FROM teams WHERE id IN (${teamA.id}, ${freeTeam.id})`;
  assert.equal(captainTeams, 0);
  const [{ count: captainFixtures }] =
    await sql`SELECT count(*)::int FROM fixtures WHERE team_id = ${teamA.id}`;
  assert.equal(captainFixtures, 0);
  const [{ count: captainLinks }] =
    await sql`SELECT count(*)::int FROM fixture_match_sessions WHERE team_id = ${teamA.id}`;
  assert.equal(captainLinks, 0);
  const [kept] = await sql`
    SELECT
      (SELECT count(*)::int FROM clubs WHERE id = ${clubA.id}) AS clubs,
      (SELECT count(*)::int FROM seasons WHERE id = ${seasonA.id}) AS seasons,
      (SELECT count(*)::int FROM opponents WHERE id = ${opponentA.id}) AS opponents,
      (SELECT count(*)::int FROM fixtures WHERE id = ${otherTeamFixture.id}) AS fixtures,
      (SELECT count(*)::int FROM club_members WHERE club_id = ${clubA.id}) AS members,
      (SELECT created_by FROM clubs WHERE id = ${clubA.id}) AS club_created_by,
      (SELECT created_by FROM fixtures WHERE id = ${otherTeamFixture.id}) AS fixture_created_by
  `;
  assert.deepEqual(
    { ...kept },
    {
      clubs: 1,
      seasons: 1,
      opponents: 1,
      fixtures: 1,
      members: 1,
      club_created_by: null,
      fixture_created_by: null,
    },
  );
}

const trackedTables = [
  "user",
  "teams",
  "team_members",
  "match_sessions",
  "match_reservations",
  "payments",
];

try {
  const fresh = await makeDatabase("fresh");
  const outcomes = await Promise.allSettled([
    command(fresh, "db:migration"),
    command(fresh, "db:migration"),
  ]);
  const applied = outcomes.map(result => {
    if (result.status === "rejected") throw result.reason;
    return Number(result.value.stdout.match(/Applied (\d+) migration/)?.[1]);
  });
  assert.deepEqual(
    applied.sort((a, b) => a - b),
    [0, migrations.length],
  );
  await assertAppliedMigrations(fresh.sql);
  const canonical = await readCatalog(fresh.sql);
  assert.ok(
    canonical.columns.some(
      column => column.column_name === "recurrence_group_id",
    ),
  );
  await seedArenaData(fresh.sql);
  console.info("Fresh database, simultaneous application and journal: passed.");
  await assertClubCalendarConstraints(fresh.sql);
  console.info("Club calendar constraints on a fresh database: passed.");

  const pushed = await makeDatabase("pushed");
  // Model an unjournaled Stage 0 push, without adopting subsequent schema additions.
  await pushed.sql.begin(async transaction => {
    await transaction`SET LOCAL client_min_messages TO warning`;
    for (const statement of migrations[0].sql) {
      if (statement.trim()) await transaction.unsafe(statement);
    }
    await transaction`DROP INDEX event_messages_session_idx`;
  });
  await seedArenaData(pushed.sql);
  const pushedRows = await readRows(pushed.sql, trackedTables);
  await command(pushed, "db:migration");
  await assertAppliedMigrations(pushed.sql);
  assert.deepEqual(await readCatalog(pushed.sql), canonical);
  await assertPreserved(pushed.sql, pushedRows);
  console.info("Existing Stage 0 schema without a migration journal: passed.");

  const legacy = await makeDatabase("legacy");
  await loadLegacyArena(legacy.sql);
  const legacyRows = await readRows(legacy.sql, [
    ...trackedTables,
    "event_messages",
    "wallet",
  ]);
  const legacyHistory =
    await legacy.sql`SELECT * FROM drizzle.__drizzle_migrations`;
  await command(legacy, "db:migration");
  assert.match(
    (await command(legacy, "db:migration")).stdout,
    /Applied 0 migration\(s\)/,
  );
  await assertAppliedMigrations(legacy.sql);
  const canonicalTables = new Set(
    canonical.columns.map(column => column.table_name),
  );
  const canonicalColumns = new Set(
    canonical.columns.map(
      column => `${column.table_name}.${column.column_name}`,
    ),
  );
  const migratedCatalog = await readCatalog(legacy.sql);
  assert.deepEqual(
    migratedCatalog.columns.filter(row =>
      canonicalColumns.has(`${row.table_name}.${row.column_name}`),
    ),
    canonical.columns,
  );
  assert.deepEqual(
    migratedCatalog.keys.filter(row => canonicalTables.has(row.table_name)),
    canonical.keys,
  );
  assert.deepEqual(
    migratedCatalog.indexes.filter(row => canonicalTables.has(row.table_name)),
    canonical.indexes,
  );
  await assertPreserved(legacy.sql, legacyRows);
  assert.deepEqual(
    await legacy.sql`SELECT * FROM drizzle.__drizzle_migrations`,
    legacyHistory,
  );
  await assert.rejects(
    legacy.sql`
    INSERT INTO match_reservations (match_session_id, player_id) VALUES (1, 'captain-test')
  `,
    { code: "23505" },
  );
  await assert.rejects(
    legacy.sql`
    INSERT INTO payments (match_reservation_id, amount_cents, method) VALUES (999, 700, 'cash')
  `,
    { code: "23503" },
  );
  console.info(
    "Historical Arena upgrade, repeat, data, constraints and legacy journal: passed.",
  );
  await assertClubCalendarConstraints(legacy.sql);
  await assertRowsKept(legacy.sql, legacyRows);
  console.info("Club calendar constraints after the Arena upgrade: passed.");

  const conflict = await makeDatabase("conflict");
  await loadLegacyArena(conflict.sql);
  await conflict.sql`ALTER TABLE payments ALTER COLUMN amount_cents TYPE text`;
  await assertRejectedMigration(
    conflict,
    /Unexpected column definition for payments.amount_cents/,
  );
  await conflict.sql`ALTER TABLE payments ALTER COLUMN amount_cents TYPE integer USING amount_cents::integer`;
  await conflict.sql`
    INSERT INTO match_reservations (match_session_id, player_id) VALUES (1, 'captain-test')
  `;
  await assertRejectedMigration(
    conflict,
    /could not create unique index "match_reservations_session_player_idx"/,
  );
  console.info(
    "Incompatible column, duplicate reservations and transactional rollback: passed.",
  );
} finally {
  try {
    for (const { name, sql } of disposableDatabases) {
      await sql.end({ timeout: 5 });
      await admin`DROP DATABASE ${admin(name)}`;
    }
  } finally {
    await admin.end({ timeout: 5 });
  }
}
