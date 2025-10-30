"use server";

import { profile } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { onboardingSchema, type OnboardingData } from "@/schemas/profile";
import { eq } from "drizzle-orm";

export async function saveProfileData(
  userId: string,
  data: Partial<OnboardingData>,
) {
  try {
    // Validate data
    const validatedData = onboardingSchema.parse(data);

    // Check if profile already exists
    const existing = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, userId))
      .limit(1);

    const profileData = {
      userId,
      role: validatedData.role,
      name: validatedData.name,
      location: validatedData.location || null,
      experience: validatedData.experience || null,
      availability: validatedData.availability || null,
      goals: validatedData.goals,
      waitlistApps: validatedData.waitlistApps,
      customFields: validatedData.customFields || {},
      notificationsEnabled: validatedData.preferences.notifications,
      newsletterEnabled: validatedData.preferences.newsletter,
      earlyAccessEnabled: validatedData.preferences.earlyAccess,
      completed: true,
      completedAt: new Date(),
      updatedAt: new Date(),
    };

    if (existing.length > 0) {
      // Update existing
      const [updated] = await db
        .update(profile)
        .set(profileData)
        .where(eq(profile.userId, userId))
        .returning();

      return { success: true, data: updated };
    } else {
      // Insert new
      const [created] = await db
        .insert(profile)
        .values(profileData)
        .returning();

      return { success: true, data: created };
    }
  } catch (error) {
    console.error("Error saving profile data:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Erro ao guardar dados do perfil" };
  }
}

export async function getProfileData(userId: string) {
  try {
    const [data] = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, userId))
      .limit(1);

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return { success: false, error: "Erro ao buscar dados do perfil" };
  }
}
