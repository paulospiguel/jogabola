"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { user as userTable } from "@/db/schema";
import { getAuthUser } from "@/lib/action-helpers";

export type UserRole = "captain" | "athlete";

export async function completeOnboarding(role: UserRole) {
  const authUser = await getAuthUser();
  if (!authUser) return { success: false, error: "Não autenticado" };

  await db
    .update(userTable)
    .set({ role, onboardingCompleted: true, updatedAt: new Date() })
    .where(eq(userTable.id, authUser.id));

  return { success: true };
}
