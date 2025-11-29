"use server";

import { getPositionLabel } from "@/constants/positions";
import { onboarding, profile } from "@/drizzle/schema";
import { db } from "@/lib/db";
import {
  createSlugFromNickname,
  onboardingSchema,
  type OnboardingData,
} from "@/schemas/profile";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { z } from "zod";

// Salvar onboarding (sempre cria registro, com ou sem user_id)
export async function saveOnboarding(
  data: Partial<OnboardingData>,
  userId?: string,
) {
  try {
    console.log("=== saveOnboarding ===");
    console.log("User ID:", userId || "null (pendente)");
    console.log("Email:", data.email);
    console.log("Nome:", data.name);
    console.log("Role:", data.role);

    if (!data.email || !data.name || !data.role) {
      console.error("Dados obrigatórios faltando:", {
        email: data.email,
        name: data.name,
        role: data.role,
      });
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
        }),
      );
      validatedData = updateSchema.parse({
        ...data,
        goals: data.goals || [],
      });
    } else {
      // Schema completo para novo onboarding
      validatedData = onboardingSchema.parse(data);
    }

    // Processar nickname: criar slug se fornecido
    let nicknameSlug: string | null = null;
    if (validatedData.nickname && validatedData.nickname.trim()) {
      nicknameSlug = createSlugFromNickname(validatedData.nickname);

      // Verificar disponibilidade do nickname
      const nicknameCheck = await checkNicknameAvailability(
        validatedData.nickname,
        userId,
      );
      if (!nicknameCheck.success || !nicknameCheck.available) {
        return {
          success: false,
          error: "Este nickname já está em uso. Por favor, escolhe outro.",
        };
      }
    }

    const onboardingData = {
      userId: userId || null,
      email: validatedData.email,
      name: validatedData.name,
      nickname: nicknameSlug,
      dateOfBirth: validatedData.dateOfBirth || null,
      nationality: validatedData.nationality || null,
      country: validatedData.country || null,
      city: validatedData.city || null,
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

    console.log(
      "Buscando onboarding pendente existente para:",
      validatedData.email,
    );
    // Buscar onboarding existente pendente (user_id NULL) pelo email
    const existingPending = await db
      .select()
      .from(onboarding)
      .where(
        and(
          eq(onboarding.email, validatedData.email),
          isNull(onboarding.userId),
        ),
      )
      .limit(1);

    if (existingPending.length > 0) {
      console.log(
        "Atualizando onboarding pendente existente, ID:",
        existingPending[0].id,
      );
      // Atualizar onboarding pendente existente
      const [updated] = await db
        .update(onboarding)
        .set({
          ...onboardingData,
          userId: userId || null, // Vincular ao user se fornecido
        })
        .where(eq(onboarding.id, existingPending[0].id))
        .returning();

      console.log("Onboarding atualizado com sucesso!");
      return { success: true, data: updated };
    }

    // Se tem userId, verificar se já existe onboarding vinculado
    if (userId) {
      console.log(
        "Verificando onboarding vinculado existente para userId:",
        userId,
      );
      const existingLinked = await db
        .select()
        .from(onboarding)
        .where(eq(onboarding.userId, userId))
        .limit(1);

      if (existingLinked.length > 0) {
        console.log(
          "Atualizando onboarding vinculado existente, ID:",
          existingLinked[0].id,
        );
        // Atualizar onboarding vinculado existente
        const [updated] = await db
          .update(onboarding)
          .set(onboardingData)
          .where(eq(onboarding.id, existingLinked[0].id))
          .returning();

        console.log("Onboarding vinculado atualizado com sucesso!");
        return { success: true, data: updated };
      }
    }

    console.log("Criando novo onboarding...");
    // Criar novo onboarding
    const [created] = await db
      .insert(onboarding)
      .values(onboardingData)
      .returning();

    console.log("Novo onboarding criado com sucesso! ID:", created.id);
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
      nickname: onboardingData.nickname,
      dateOfBirth: onboardingData.dateOfBirth,
      nationality: onboardingData.nationality,
      country: onboardingData.country,
      city: onboardingData.city,
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

// Tipo para estatísticas de uma competição
interface CompetitionStats {
  started: number;
  goals: number;
  yellowCards: number;
  ended: number;
  aboutToStart: number;
  halftimeScore: number;
  redCards: number;
  minutesPlayed: number;
  averageRating: number;
}

// Buscar dados de performance do jogador
export async function getPlayerPerformance(
  userId: string,
  competitionId?: string,
) {
  try {
    const [profileData] = await db
      .select()
      .from(profile)
      .where(eq(profile.userId, userId))
      .limit(1);

    if (!profileData) {
      return {
        success: false,
        error: "Perfil não encontrado",
      };
    }

    // Buscar estatísticas de performance dos customFields
    // Estrutura: { competitions: { [competitionId]: { stats... } } }
    const performanceData =
      (profileData.customFields?.performance as {
        competitions?: Record<string, CompetitionStats>;
      }) || {};

    const competitions = performanceData.competitions || {};
    const competitionIds = Object.keys(competitions);

    // Função para normalizar valores para o radar (0-10)
    const normalizeStats = (
      stats: Partial<CompetitionStats>,
    ): CompetitionStats => {
      const maxValue = 10;
      return {
        started: Math.min((stats.started || 0) / 10, maxValue),
        goals: Math.min((stats.goals || 0) / 2, maxValue),
        yellowCards: Math.min((stats.yellowCards || 0) / 2, maxValue),
        ended: Math.min((stats.ended || 0) / 10, maxValue),
        aboutToStart: Math.min((stats.aboutToStart || 0) / 10, maxValue),
        halftimeScore: Math.min((stats.halftimeScore || 0) / 10, maxValue),
        redCards: Math.min((stats.redCards || 0) / 2, maxValue),
        minutesPlayed: stats.minutesPlayed || 0,
        averageRating: stats.averageRating || 0,
      };
    };

    // Calcular estatísticas baseadas na seleção
    let selectedStats: CompetitionStats;
    let selectedLeague: string;
    let selectedCompetitionId: string | null = null;

    if (competitionId === "general" || competitionId === undefined) {
      // Calcular média geral de todas as competições
      if (competitionIds.length === 0) {
        // Sem dados: valores iniciais = 1
        selectedStats = {
          started: 1,
          goals: 1,
          yellowCards: 1,
          ended: 1,
          aboutToStart: 1,
          halftimeScore: 1,
          redCards: 1,
          minutesPlayed: 0,
          averageRating: 1,
        };
        selectedLeague = "Geral";
      } else {
        // Normalizar cada competição primeiro, depois calcular média
        const normalizedStats = competitionIds.map(id =>
          normalizeStats(competitions[id]),
        );
        selectedStats = {
          started:
            normalizedStats.reduce((sum, s) => sum + s.started, 0) /
            normalizedStats.length,
          goals:
            normalizedStats.reduce((sum, s) => sum + s.goals, 0) /
            normalizedStats.length,
          yellowCards:
            normalizedStats.reduce((sum, s) => sum + s.yellowCards, 0) /
            normalizedStats.length,
          ended:
            normalizedStats.reduce((sum, s) => sum + s.ended, 0) /
            normalizedStats.length,
          aboutToStart:
            normalizedStats.reduce((sum, s) => sum + s.aboutToStart, 0) /
            normalizedStats.length,
          halftimeScore:
            normalizedStats.reduce((sum, s) => sum + s.halftimeScore, 0) /
            normalizedStats.length,
          redCards:
            normalizedStats.reduce((sum, s) => sum + s.redCards, 0) /
            normalizedStats.length,
          minutesPlayed: normalizedStats.reduce(
            (sum, s) => sum + s.minutesPlayed,
            0,
          ),
          averageRating:
            normalizedStats.reduce((sum, s) => sum + s.averageRating, 0) /
            normalizedStats.length,
        };
        selectedLeague = "Geral (Média)";
      }
    } else {
      // Competição específica
      const competition = competitions[competitionId];
      if (!competition) {
        // Competição não encontrada: valores iniciais = 1
        selectedStats = {
          started: 1,
          goals: 1,
          yellowCards: 1,
          ended: 1,
          aboutToStart: 1,
          halftimeScore: 1,
          redCards: 1,
          minutesPlayed: 0,
          averageRating: 1,
        };
        selectedLeague = competitionId;
      } else {
        selectedStats = normalizeStats(competition);
        selectedLeague = competitionId;
        selectedCompetitionId = competitionId;
      }
    }

    const positionValue = (profileData.customFields?.position as string) || "";
    const positionLabel = getPositionLabel(positionValue);

    return {
      success: true,
      data: {
        playerName: profileData.name,
        league: selectedLeague,
        position: positionLabel,
        minutesPlayed: selectedStats.minutesPlayed,
        averageRating: selectedStats.averageRating || 1,
        stats: {
          started: selectedStats.started,
          goals: selectedStats.goals,
          yellowCards: selectedStats.yellowCards,
          ended: selectedStats.ended,
          aboutToStart: selectedStats.aboutToStart,
          halftimeScore: selectedStats.halftimeScore,
          redCards: selectedStats.redCards,
        },
        competitions: competitionIds.map(id => ({
          id,
          name: id,
        })),
        selectedCompetitionId,
      },
    };
  } catch (error) {
    console.error("Error fetching player performance:", error);
    return {
      success: false,
      error: "Erro ao buscar dados de performance",
    };
  }
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
      nickname: data.nickname || undefined,
      dateOfBirth: data.dateOfBirth || undefined,
      nationality: data.nationality || undefined,
      country: data.country || undefined,
      city: data.city || undefined,
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
    console.log("=== linkOnboardingToUser ===");
    console.log("Buscando onboarding pendente para:", email);
    console.log("User ID:", userId);

    // Buscar onboarding pendente pelo email
    const [pendingOnboarding] = await db
      .select()
      .from(onboarding)
      .where(and(eq(onboarding.email, email), isNull(onboarding.userId)))
      .limit(1);

    console.log(
      "Resultado da busca:",
      pendingOnboarding ? "Encontrado" : "Não encontrado",
    );

    if (pendingOnboarding) {
      console.log("Onboarding pendente:", {
        id: pendingOnboarding.id,
        email: pendingOnboarding.email,
        name: pendingOnboarding.name,
        role: pendingOnboarding.role,
        completed: pendingOnboarding.completed,
      });
    }

    if (!pendingOnboarding) {
      // Buscar TODOS os onboardings para este email (para debug)
      const allOnboardings = await db
        .select()
        .from(onboarding)
        .where(eq(onboarding.email, email));

      console.log(
        `Total de onboardings encontrados para ${email}:`,
        allOnboardings.length,
      );
      if (allOnboardings.length > 0) {
        console.log(
          "Onboardings existentes:",
          allOnboardings.map(o => ({
            id: o.id,
            userId: o.userId,
            email: o.email,
            completed: o.completed,
          })),
        );
      }

      return {
        success: false,
        error: "Onboarding pendente não encontrado para este email",
      };
    }

    console.log("Vinculando onboarding ao usuário...");
    // Vincular ao user
    const [updated] = await db
      .update(onboarding)
      .set({
        userId,
        updatedAt: new Date(),
      })
      .where(eq(onboarding.id, pendingOnboarding.id))
      .returning();

    console.log("Onboarding vinculado com sucesso!");

    // Se onboarding está completo, criar profile
    if (updated.completed) {
      console.log("Criando profile a partir do onboarding...");
      const profileResult = await createProfileFromOnboarding(userId);
      if (!profileResult.success) {
        console.error("Erro ao criar profile:", profileResult.error);
        return profileResult;
      }
      console.log("Profile criado com sucesso!");
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

// Verificar se nickname já existe (verifica em profile e onboarding)
export async function checkNicknameAvailability(
  nickname: string,
  excludeUserId?: string,
) {
  try {
    if (!nickname || nickname.trim().length < 3) {
      return {
        success: false,
        available: false,
        error: "Nickname muito curto",
      };
    }

    // Criar slug do nickname
    const slug = createSlugFromNickname(nickname);

    // Verificar em profile (apenas os que têm nickname não nulo)
    const profiles = await db
      .select()
      .from(profile)
      .where(and(eq(profile.nickname, slug), isNotNull(profile.nickname)));

    // Se há userId para excluir, filtrar
    const filteredProfiles = excludeUserId
      ? profiles.filter(p => p.userId !== excludeUserId)
      : profiles;

    if (filteredProfiles.length > 0) {
      return { success: true, available: false };
    }

    // Verificar em onboarding (apenas os que têm nickname não nulo)
    const onboardings = await db
      .select()
      .from(onboarding)
      .where(
        and(eq(onboarding.nickname, slug), isNotNull(onboarding.nickname)),
      );

    // Se há userId para excluir, filtrar
    const filteredOnboardings = excludeUserId
      ? onboardings.filter(o => o.userId !== excludeUserId)
      : onboardings;

    if (filteredOnboardings.length > 0) {
      return { success: true, available: false };
    }

    return { success: true, available: true };
  } catch (error) {
    console.error("Error checking nickname availability:", error);
    return {
      success: false,
      available: false,
      error: "Erro ao verificar disponibilidade do nickname",
    };
  }
}
