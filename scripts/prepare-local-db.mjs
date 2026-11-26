import { spawnSync } from "node:child_process";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile();
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for local database setup.");
}

const hostname = new URL(databaseUrl).hostname.toLowerCase();
const localHosts = new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "[::1]",
  "postgres",
]);
if (!localHosts.has(hostname)) {
  throw new Error(
    `Refusing local schema setup for non-local database host: ${hostname}`,
  );
}

const sql = postgres(databaseUrl, {
  ssl:
    process.env.DATABASE_SSL?.toLowerCase() === "require" ? "require" : false,
  max: 1,
  connect_timeout: 10,
});

const requiredColumns = [
  "account_transfer_requests.user_id",
  "event_messages.deleted_at",
  "event_messages.censored_at",
  "guest_event_otp.attempts",
  "guest_event_otp.locked_until",
  "match_reservations.guest_access_token",
  "match_sessions.recurrence_group_id",
  "passkey.aaguid",
  "player_ratings.overall",
  "team_payment_settings.team_id",
  "user.plan_tier",
];

async function findMissingColumns() {
  const columns = await sql`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
  `;
  const actual = new Set(
    columns.map(
      ({ table_name, column_name }) => `${table_name}.${column_name}`,
    ),
  );
  return requiredColumns.filter(column => !actual.has(column));
}

let locked = false;
try {
  // Serialize first-run bootstraps so concurrent app starts cannot both see an empty schema.
  await sql`SELECT pg_advisory_lock(61742, 911)`;
  locked = true;

  const tables = await sql`
    SELECT tablename
    FROM pg_catalog.pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;

  if (tables.length === 0) {
    console.info(
      "Empty local database found; applying the Drizzle migrations.",
    );
    const result = spawnSync("pnpm", ["db:migration"], { stdio: "inherit" });

    if (result.error) throw result.error;
    if (result.status !== 0) {
      throw new Error(
        `Drizzle schema bootstrap exited with status ${result.status ?? "unknown"}.`,
      );
    }
  }

  const missingColumns = await findMissingColumns();
  if (missingColumns.length > 0) {
    throw new Error(
      [
        "The local database is not compatible with the current application schema.",
        `Missing required columns: ${missingColumns.join(", ")}.`,
        "No changes were applied to an existing database. Review and run pnpm db:migration explicitly.",
      ].join(" "),
    );
  }

  if (tables.length === 0) {
    console.info("Current Drizzle schema is ready.");
  } else {
    console.info(
      `Existing local schema is compatible; checked ${tables.length} public table(s).`,
    );
  }
} finally {
  try {
    if (locked) await sql`SELECT pg_advisory_unlock(61742, 911)`;
  } finally {
    await sql.end({ timeout: 5 });
  }
}
