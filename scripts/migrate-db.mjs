import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { readMigrationFiles } from "drizzle-orm/migrator";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl)
  throw new Error("DATABASE_URL is required to apply migrations.");

const migrations = readMigrationFiles({
  migrationsFolder: fileURLToPath(
    new URL("../src/db/migrations/current", import.meta.url),
  ),
});
const baseline = JSON.parse(
  readFileSync(
    new URL(
      "../src/db/migrations/current/meta/0000_snapshot.json",
      import.meta.url,
    ),
    "utf8",
  ),
);
const connectOptions = { max: 1, connect_timeout: 10 };
if (process.env.DATABASE_SSL?.toLowerCase() === "require")
  connectOptions.ssl = "require";
const sql = postgres(databaseUrl, connectOptions);

async function validateBaseline(transaction) {
  const columns = await transaction`
    SELECT c.relname AS table_name, a.attname AS column_name,
      format_type(a.atttypid, a.atttypmod) AS type, a.attnotnull AS not_null,
      pg_get_expr(d.adbin, d.adrelid) AS column_default,
      (
        SELECT k.conname FROM pg_constraint AS k
        WHERE k.conrelid = c.oid AND k.contype = 'p' AND k.conkey = ARRAY[a.attnum]
      ) AS primary_key,
      pg_get_expr(d.adbin, d.adrelid) = format('nextval(%L::regclass)',
        pg_get_serial_sequence(format('public.%I', c.relname), a.attname)::regclass
      ) AS has_serial_default
    FROM pg_class AS c
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
    JOIN pg_attribute AS a ON a.attrelid = c.oid
    LEFT JOIN pg_attrdef AS d ON d.adrelid = c.oid AND d.adnum = a.attnum
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND a.attnum > 0 AND NOT a.attisdropped
  `;
  const actualColumns = new Map(
    columns.map(column => [
      `${column.table_name}.${column.column_name}`,
      column,
    ]),
  );
  for (const table of Object.values(baseline.tables)) {
    for (const expected of Object.values(table.columns)) {
      const key = `${table.name}.${expected.name}`;
      const actual = actualColumns.get(key);
      const isSerial = expected.type === "serial";
      const type = isSerial
        ? "integer"
        : expected.type === "timestamp"
          ? "timestamp without time zone"
          : expected.type;
      const columnDefault =
        expected.default === undefined ? null : String(expected.default);
      const defaultMatches = isSerial
        ? actual?.has_serial_default
        : actual?.column_default ===
          (type === "text" && columnDefault !== null
            ? `${columnDefault}::text`
            : columnDefault);
      if (
        actual?.type !== type ||
        actual.not_null !== expected.notNull ||
        actual.primary_key !==
          (expected.primaryKey ? `${table.name}_pkey` : null) ||
        !defaultMatches
      ) {
        throw new Error(`Unexpected column definition for ${key}.`);
      }
    }
  }
}

try {
  const appliedCount = await sql.begin(
    "isolation level read committed",
    async transaction => {
      // Lock before reading the journal so concurrent deploys cannot apply the same migration.
      await transaction`SELECT pg_advisory_xact_lock(61742, 912)`;
      await transaction`SET LOCAL search_path TO public`;
      await transaction`SET LOCAL client_min_messages TO warning`;
      await transaction`CREATE SCHEMA IF NOT EXISTS jogabola_migrations`;
      await transaction`
      CREATE TABLE IF NOT EXISTS jogabola_migrations.__drizzle_migrations (
        id serial PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `;
      const history = await transaction`
      SELECT hash, created_at FROM jogabola_migrations.__drizzle_migrations ORDER BY id
    `;
      const validHistory = history.every((entry, index) => {
        const migration = migrations[index];
        return (
          migration?.hash === entry.hash &&
          migration.folderMillis === Number(entry.created_at)
        );
      });
      if (!validHistory)
        throw new Error(
          "The database migration history does not match this checkout.",
        );

      const pending = migrations.slice(history.length);
      for (const migration of pending) {
        for (const statement of migration.sql) {
          if (statement.trim()) await transaction.unsafe(statement);
        }
        if (migration === migrations[0]) await validateBaseline(transaction);
        await transaction`
        INSERT INTO jogabola_migrations.__drizzle_migrations (hash, created_at)
        VALUES (${migration.hash}, ${migration.folderMillis})
      `;
      }
      return pending.length;
    },
  );
  console.info(`Applied ${appliedCount} migration(s).`);
} finally {
  await sql.end({ timeout: 5 });
}
