"use server";

import { onboarding, profile } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { onboardingSchema, type OnboardingData } from "@/schemas/profile";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

// Salvar onboarding (sempre cria registro, com ou sem user_id)
export async function saveOnboarding(
  data: Partial<OnboardingData>,
  userId?: string,
) {
  try {
    if (!data.email || !data.name || !data.role) {
      return {
        success: false,
        error: "Email, nome e role são obrigatórios",
      };
    }

    // Se é uma atualização (tem userId), usar schema mais flexível que permite goals vazio
    let validatedData;
    if (userId) {
      // Schema flexível para atualização: goals pode ser vazio
      const updateSchema = onboardingSchema.omit({ goals: true }).merge(
        z.object({
          goals: z.array(z.string()).min(0).default([]),
        })
      );
      validatedData = updateSchema.parse({
        ...data,
        goals: data.goals || [],
      });
    } else {
      // Schema completo para novo onboarding
      validatedData = onboardingSchema.parse(data);
    }

    const onboardingData = {
      userId: userId || null,
      email: validatedData.email,
      name: validatedData.name,
      role: validatedData.role,
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

    // Buscar onboarding existente pendente (user_id NULL) pelo email
    const existingPending = await db
      .select()
      .from(onboarding)
      .where(and(eq(onboarding.email, validatedData.email), isNull(onboarding.userId)))
      .limit(1);

    if (existingPending.length > 0) {
      // Atualizar onboarding pendente existente
      const [updated] = await db
        .update(onboarding)
        .set({
          ...onboardingData,
          userId: userId || null, // Vincular ao user se fornecido
        })
        .where(eq(onboarding.id, existingPending[0].id))
        .returning();

      return { success: true, data: updated };
    }

    // Se tem userId, verificar se já existe onboarding vinculado
    if (userId) {
      const existingLinked = await db
        .select()
        .from(onboarding)
        .where(eq(onboarding.userId, userId))
        .limit(1);

      if (existingLinked.length > 0) {
        // Atualizar onboarding vinculado existente
        const [updated] = await db
          .update(onboarding)
          .set(onboardingData)
          .where(eq(onboarding.id, existingLinked[0].id))
          .returning();

        return { success: true, data: updated };
      }
    }

    // Criar novo onboarding
    const [created] = await db
      .insert(onboarding)
      .values(onboardingData)
      .returning();

    return { success: true, data: created };
  } catch (error) {
    console.error("Error saving onboarding:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Erro ao guardar dados do onboarding" };
  }
}

// Criar profile a partir de onboarding completo e vinculado
export async function createProfileFromOnboarding(userId: string) {
  try {
    // Buscar onboarding completo vinculado ao user
    const [onboardingData] = await db
      .select()
      .from(onboarding)
      .where(and(eq(onboarding.userId, userId), eq(onboarding.completed, true)))
      .limit(1);

    if (!onboardingData) {
      return {
        success: false,
        error: "Onboarding completo não encontrado para este usuário",
      };
    }

    // Verificar se profile já existe
    const existingProfile = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, userId))
      .limit(1);

    const profileData = {
      userId,
      role: onboardingData.role,
      name: onboardingData.name,
      location: onboardingData.location,
      experience: onboardingData.experience,
      availability: onboardingData.availability,
      goals: onboardingData.goals,
      waitlistApps: onboardingData.waitlistApps,
      customFields: onboardingData.customFields || {},
      notificationsEnabled: onboardingData.notificationsEnabled,
      newsletterEnabled: onboardingData.newsletterEnabled,
      earlyAccessEnabled: onboardingData.earlyAccessEnabled,
      completed: true,
      completedAt: onboardingData.completedAt || new Date(),
    };

    if (existingProfile.length > 0) {
      // Atualizar profile existente
      const [updated] = await db
        .update(profile)
        .set(profileData)
        .where(eq(profile.userId, userId))
        .returning();

      return { success: true, data: updated };
    } else {
      // Criar novo profile
      const [created] = await db
        .insert(profile)
        .values(profileData)
        .returning();

      return { success: true, data: created };
    }
  } catch (error) {
    console.error("Error creating profile from onboarding:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: "Erro ao criar perfil" };
  }
}

// Manter função saveProfileData para compatibilidade (deprecated)
export async function saveProfileData(
  userId: string,
  data: Partial<OnboardingData>,
) {
  // Primeiro salvar onboarding vinculado ao user
  const onboardingResult = await saveOnboarding(data, userId);
  
  if (!onboardingResult.success) {
    return onboardingResult;
  }

  // Depois criar/atualizar profile
  return await createProfileFromOnboarding(userId);
}

export async function getProfileData(userId: string) {
  try {
    const [data] = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, userId))
      .limit(1);

    const profileLevel = await calculateProfileLevel(userId);

    const profileData = {
      ...data,
      level: profileLevel,
    };

    return { success: true, data: profileData };
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return { success: false, error: "Erro ao buscar dados do perfil" };
  }
}

async function calculateProfileLevel(userId: string) {
  // TODO: calcular level baseado em estatísticas reais
  return null;
}

// Recuperar onboarding pendente por email (user_id NULL)
export async function getPendingOnboarding(email: string) {
  try {
    const [data] = await db
      .select()
      .from(onboarding)
      .where(and(eq(onboarding.email, email), isNull(onboarding.userId)))
      .limit(1);

    if (!data) {
      return { success: false, error: "Onboarding pendente não encontrado" };
    }

    // Converter para formato OnboardingData
    const onboardingData: Partial<OnboardingData> = {
      email: data.email,
      name: data.name,
      role: data.role as any,
      location: data.location || undefined,
      experience: data.experience as any,
      availability: data.availability as any,
      goals: data.goals || [],
      waitlistApps: data.waitlistApps || [],
      customFields: data.customFields || {},
      preferences: {
        notifications: data.notificationsEnabled ?? true,
        newsletter: data.newsletterEnabled ?? true,
        earlyAccess: data.earlyAccessEnabled ?? true,
      },
    };

    return { success: true, data: onboardingData };
  } catch (error) {
    console.error("Error fetching pending onboarding:", error);
    return {
      success: false,
      error: "Erro ao buscar dados do onboarding pendente",
    };
  }
}

// Vincular onboarding pendente a um usuário quando fizer login/registro
export async function linkOnboardingToUser(userId: string, email: string) {
  try {
    // Buscar onboarding pendente pelo email
    const [pendingOnboarding] = await db
      .select()
      .from(onboarding)
      .where(and(eq(onboarding.email, email), isNull(onboarding.userId)))
      .limit(1);

    if (!pendingOnboarding) {
      return {
        success: false,
        error: "Onboarding pendente não encontrado para este email",
      };
    }

    // Vincular ao user
    const [updated] = await db
      .update(onboarding)
      .set({
        userId,
        updatedAt: new Date(),
      })
      .where(eq(onboarding.id, pendingOnboarding.id))
      .returning();

    // Se onboarding está completo, criar profile
    if (updated.completed) {
      const profileResult = await createProfileFromOnboarding(userId);
      if (!profileResult.success) {
        return profileResult;
      }
    }

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error linking onboarding to user:", error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return {
      success: false,
      error: "Erro ao vincular onboarding ao usuário",
    };
  }
}

// Alias para compatibilidade (deprecated)
export async function savePendingOnboarding(data: Partial<OnboardingData>) {
  return saveOnboarding(data);
}

// Alias para compatibilidade (deprecated)
export async function migratePendingOnboardingToProfile(
  userId: string,
  email: string,
) {
  return linkOnboardingToUser(userId, email);
}
