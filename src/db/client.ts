import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const client = (globalThis as any).postgresClient ?? postgres(databaseUrl, {
  ssl: "require",
  max: 1,
  idle_timeout: 20,
});

if (process.env.NODE_ENV !== "production") {
  (globalThis as any).postgresClient = client;
}

export const db = drizzle(client, { schema });
