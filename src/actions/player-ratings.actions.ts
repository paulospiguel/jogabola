"use server";

import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { playerRatings } from "@/db/schema";
import { getAuthUser } from "@/lib/action-helpers";
import {
  computeOverall,
  type SelfAssessment,
  selfAssessmentInputSchema,
} from "@/lib/self-assessment";

/** Auto-avaliação do utilizador autenticado, ou null se ainda não existir. */
export async function getMyRating(): Promise<SelfAssessment | null> {
  const authUser = await getAuthUser();
  if (!authUser) return null;

  const [row] = await db
    .select()
    .from(playerRatings)
    .where(eq(playerRatings.userId, authUser.id))
    .limit(1);

  if (!row) return null;

  return {
    primaryPosition: row.primaryPosition as SelfAssessment["primaryPosition"],
    secondaryPosition:
      (row.secondaryPosition as SelfAssessment["secondaryPosition"]) ?? null,
    finishing: row.finishing,
    defense: row.defense,
    passing: row.passing,
    pace: row.pace,
    physical: row.physical,
    technique: row.technique,
    goalkeeping: row.goalkeeping ?? null,
    overall: row.overall,
  };
}

export async function saveSelfAssessment(input: unknown) {
  const authUser = await getAuthUser();
  if (!authUser) return { success: false as const, error: "NOT_AUTHENTICATED" };

  const parsed = selfAssessmentInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "INVALID_INPUT" };
  }

  const data = parsed.data;
  const goalkeeping =
    data.primaryPosition === "GK" ? (data.goalkeeping ?? null) : null;
  const overall = computeOverall({ ...data, goalkeeping });
  const now = new Date();

  await db
    .insert(playerRatings)
    .values({
      userId: authUser.id,
      primaryPosition: data.primaryPosition,
      secondaryPosition: data.secondaryPosition ?? null,
      finishing: data.finishing,
      defense: data.defense,
      passing: data.passing,
      pace: data.pace,
      physical: data.physical,
      technique: data.technique,
      goalkeeping,
      overall,
      assessedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: playerRatings.userId,
      set: {
        primaryPosition: data.primaryPosition,
        secondaryPosition: data.secondaryPosition ?? null,
        finishing: data.finishing,
        defense: data.defense,
        passing: data.passing,
        pace: data.pace,
        physical: data.physical,
        technique: data.technique,
        goalkeeping,
        overall,
        updatedAt: now,
      },
    });

  return { success: true as const, overall };
}

/** Mapa userId -> overall, para o balanceador (apenas dos que se avaliaram). */
// eslint-disable-next-line server-auth-actions
// eslint-disable-next-line react-doctor/server-auth-actions
export async function getRatingsForUsers(
  userIds: string[],
): Promise<Map<string, number>> {
  if (userIds.length === 0) return new Map();

  const rows = await db
    .select({
      userId: playerRatings.userId,
      overall: playerRatings.overall,
    })
    .from(playerRatings)
    .where(inArray(playerRatings.userId, userIds));

  return new Map(rows.map(r => [r.userId, r.overall]));
}
