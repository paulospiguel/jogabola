// Dev-only: prints the pending sign-in code for an email from the local
// database, for QA without Mailpit. Refuses non-local hosts and production.
// Production auth is unchanged: this only reads what Better Auth stored.
//
//   node scripts/local-otp.mjs capitao.a@jogabola.test            # read a code requested in the UI
//   node scripts/local-otp.mjs capitao.a@jogabola.test --request  # ask the local app to send one first
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile();
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

const [email, flag] = process.argv.slice(2);
if (!email) {
  console.error("Usage: node scripts/local-otp.mjs <email> [--request]");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]", "postgres"]);
const hostname = databaseUrl ? new URL(databaseUrl).hostname.toLowerCase() : "";
if (!localHosts.has(hostname) || process.env.NODE_ENV === "production") {
  throw new Error(`Refusing to read sign-in codes from host: ${hostname || "<unset>"}`);
}

const normalized = email.trim().toLowerCase();

if (flag === "--request") {
  const app = process.env.LOCAL_APP_URL || "http://localhost:3000";
  if (!localHosts.has(new URL(app).hostname)) {
    throw new Error(`Refusing to request a code from a non-local app: ${app}`);
  }
  const response = await fetch(`${app}/api/auth/email-otp/send-verification-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: app },
    body: JSON.stringify({ email: normalized, type: "sign-in" }),
  });
  if (!response.ok) {
    console.error(
      `The app answered ${response.status}. With SMTP_HOST set and no Mailpit running, start the app with "SMTP_HOST= pnpm dev".`,
    );
  }
}

const sql = postgres(databaseUrl, { max: 1, onnotice: () => {} });
try {
  const [row] = await sql`
    SELECT value, expires_at FROM verification
    WHERE identifier = ${`sign-in-otp-${normalized}`}
    ORDER BY created_at DESC NULLS LAST
    LIMIT 1
  `;
  if (!row) {
    console.error(`No pending sign-in code for ${normalized}. Request one on /auth first.`);
    process.exitCode = 2;
  } else {
    // Stored as "<otp>:<attempts>" with the default plain storage.
    const otp = row.value.slice(0, row.value.lastIndexOf(":"));
    if (!/^\d{6}$/.test(otp)) {
      console.error("The stored code is not in plain form; read it from the dev server log instead.");
      process.exitCode = 3;
    } else {
      console.log(otp);
    }
  }
} finally {
  await sql.end({ timeout: 5 });
}
