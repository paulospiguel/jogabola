import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db/client";
import { matchSessions } from "@/db/schema";

export async function queryEvents(options?: {
  limit?: number;
  upcomingOnly?: boolean;
}) {
  const { limit = 10, upcomingOnly = true } = options ?? {};
  const conditions = [];
  if (upcomingOnly) conditions.push(gte(matchSessions.startsAt, new Date()));

  return db
    .select()
    .from(matchSessions)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(matchSessions.startsAt)
    .limit(limit);
}

export async function queryEventById(id: number) {
  const [event] = await db
    .select()
    .from(matchSessions)
    .where(eq(matchSessions.id, id))
    .limit(1);
  return event ?? null;
}
