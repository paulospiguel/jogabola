import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as {
  postgresClient?: ReturnType<typeof postgres>;
};

function getDatabaseSsl(url: string): false | "require" {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const localHosts = new Set([
      "localhost",
      "127.0.0.1",
      "::1",
      "[::1]",
      "postgres",
    ]);
    return process.env.NODE_ENV !== "production" && localHosts.has(hostname)
      ? false
      : "require";
  } catch {
    return "require";
  }
}

const client =
  globalForDb.postgresClient ??
  postgres(databaseUrl, {
    ssl: getDatabaseSsl(databaseUrl),
    max: 1,
    idle_timeout: 20,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.postgresClient = client;
}

export const db = drizzle(client, { schema });
