"use server";

import { eq } from "drizzle-orm";
import { onboarding } from "@/drizzle/schema";
import { db } from "@/lib/db";

export interface AddPlayerInput {
  name: string;
  email: string;
  position: string;
  experience: string;
  jerseyNumber?: number;
  dateOfBirth?: string;
  managerId?: string;
}

export async function addPlayerToRoster(input: AddPlayerInput) {
  try {
    if (!input.name?.trim() || !input.email?.trim()) {
      return { success: false, error: "Nome e email são obrigatórios." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      return { success: false, error: "Email inválido." };
    }

    // Check if email already has a pending/completed onboarding as PLAYER
    const existing = await db
      .select({ id: onboarding.id, completed: onboarding.completed })
      .from(onboarding)
      .where(eq(onboarding.email, input.email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        error: "Já existe um registo com este email.",
      };
    }

    const [created] = await db
      .insert(onboarding)
      .values({
        name: input.name.trim(),
        email: input.email.toLowerCase().trim(),
        role: "PLAYER",
        experience: input.experience || "beginner",
        goals: [],
        waitlistApps: [],
        completed: false,
        customFields: {
          position: input.position || null,
          jerseyNumber: input.jerseyNumber || null,
          invitedByManagerId: input.managerId || null,
          invitedAt: new Date().toISOString(),
        },
        ...(input.dateOfBirth
          ? { dateOfBirth: new Date(input.dateOfBirth) }
          : {}),
      })
      .returning({ id: onboarding.id, name: onboarding.name });

    return { success: true, player: created };
  } catch (error) {
    console.error("[addPlayerToRoster]", error);
    return { success: false, error: "Erro ao adicionar jogador. Tente novamente." };
  }
}
