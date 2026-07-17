"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { profile, user as userTable } from "@/db/schema";
import { getAuthUser } from "@/lib/action-helpers";

export type UserRole = "captain" | "athlete";

export type OnboardingSurveyData = {
  intentions: string[];
  context: string;
};

export async function completeOnboarding(role: UserRole) {
  const authUser = await getAuthUser();
  if (!authUser) return { success: false, error: "UNAUTHORIZED" };

  await db
    .update(userTable)
    .set({ role, onboardingCompleted: true, updatedAt: new Date() })
    .where(eq(userTable.id, authUser.id));

  return { success: true };
}

export async function saveSurvey(data: OnboardingSurveyData) {
  const authUser = await getAuthUser();
  if (!authUser) return { success: false, error: "UNAUTHORIZED" };

  const surveyData = {
    survey_v1: {
      role: "captain" satisfies UserRole,
      intentions: data.intentions.slice(0, 3),
      context: data.context,
      completedAt: new Date().toISOString(),
    },
  };

  await db
    .insert(profile)
    .values({
      userId: authUser.id,
      role: "captain",
      name: authUser.name,
      completed: false,
      customFields: surveyData,
    })
    .onConflictDoUpdate({
      target: profile.userId,
      set: {
        customFields: sql`coalesce(${profile.customFields}, '{}'::jsonb) || ${JSON.stringify(surveyData)}::jsonb`,
      },
    });

  return { success: true };
}
