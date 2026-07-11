import { and, eq, gte } from "drizzle-orm";
import { db } from "@/db/client";
import { matchSessions } from "@/db/schema";

export async function queryEvents(options?: {
  limit?: number;
  upcomingOnly?: boolean;
  teamId?: number | string;
}) {
  const { limit = 10, upcomingOnly = true, teamId } = options ?? {};
  const conditions = [];
  if (teamId) conditions.push(eq(matchSessions.teamId, Number(teamId)));
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

export async function queryEventByIdOrSlug(idOrSlug: number | string) {
  const [event] = await db
    .select()
    .from(matchSessions)
    .where(
      typeof idOrSlug === "number" || !isNaN(Number(idOrSlug))
        ? eq(matchSessions.id, Number(idOrSlug))
        : eq(matchSessions.slug, String(idOrSlug)),
    )
    .limit(1);
  return event ?? null;
}

export async function old_queryEventById(id: number) {
  const [event] = await db
    .select()
    .from(matchSessions)
    .where(eq(matchSessions.id, id))
    .limit(1);
  return event ?? null;
}
