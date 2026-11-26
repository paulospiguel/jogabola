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
    INSERT INTO "user" (id, name, email) VALUES
      ('manager-test', 'Co-capitão Teste', 'manager@example.test'),
      ('athlete-test', 'Atleta Teste', 'athlete@example.test')
  `;
  await sql`
    INSERT INTO team_members (team_id, player_id, role) VALUES
      (1, 'manager-test', 'manager'),
      (1, 'athlete-test', 'player')
  `;
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

const LEGACY_MANAGER_PERMISSIONS = [
  "events.manage",
  "attendance.manage",
  "payments.manage",
  "communication.manage",
  "roster.manage",
];

// The staff migration demotes every team_members role to 'player'; nothing else changes.
function expectStaffMigration(rows) {
  return {
    ...rows,
    team_members: rows.team_members.map(({ row }) => ({
      row: { ...row, role: "player" },
    })),
  };
}

async function assertStaffMigrated(sql) {
  const staff = await sql`
    SELECT team_id, user_id, title, permissions, created_by FROM team_staff ORDER BY id
  `;
  assert.deepEqual(Array.from(staff), [
    {
      team_id: 1,
      user_id: "manager-test",
      title: "other",
      permissions: LEGACY_MANAGER_PERMISSIONS,
      created_by: "captain-test",
    },
  ]);
  const members =
    await sql`SELECT player_id, role FROM team_members WHERE team_id = 1 ORDER BY player_id`;
  assert.deepEqual(
    members.map(member => member.player_id),
    ["athlete-test", "captain-test", "manager-test"],
  );
  assert.ok(members.every(member => member.role === "player"));
  const [{ count }] =
    await sql`SELECT count(*)::int FROM team_staff WHERE user_id = 'captain-test'`;
  assert.equal(count, 0);
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
  for (const table of ["team_staff", "team_staff_events"]) {
    assert.ok(
      canonical.columns.some(column => column.table_name === table),
      table,
    );
  }
  await seedArenaData(fresh.sql);
  console.info("Fresh database, simultaneous application and journal: passed.");

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
  await assertPreserved(pushed.sql, expectStaffMigration(pushedRows));
  await assertStaffMigrated(pushed.sql);
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
  await assertPreserved(legacy.sql, expectStaffMigration(legacyRows));
  await assertStaffMigrated(legacy.sql);
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
