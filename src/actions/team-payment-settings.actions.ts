"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { teamPaymentSettings } from "@/db/schema";
import { withAuthAction } from "@/lib/action-helpers";
import { upsertTeamPaymentSettingsSchema } from "@/schemas/payments.schema";
import type { TeamPaymentConfig } from "@/types/payments";

export const upsertTeamPaymentSettings = withAuthAction(
  upsertTeamPaymentSettingsSchema,
  async (_user, data) => {
    const existing = await db.query.teamPaymentSettings.findFirst({
      where: eq(teamPaymentSettings.teamId, data.teamId),
    });

    if (existing) {
      const [updated] = await db
        .update(teamPaymentSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(teamPaymentSettings.teamId, data.teamId))
        .returning();
      return { success: true as const, data: updated };
    }

    const [created] = await db
      .insert(teamPaymentSettings)
      .values(data)
      .returning();
    return { success: true as const, data: created };
  },
);

export const getTeamPaymentSettings = withAuthAction(
  z.object({ teamId: z.number() }),
  async (_user, { teamId }) => {
    const settings = await db.query.teamPaymentSettings.findFirst({
      where: eq(teamPaymentSettings.teamId, teamId),
    });
    return { success: true as const, data: settings ?? null };
  },
);

// Returns a typed config, merging DB settings with defaults
export async function resolveTeamPaymentConfig(
  teamId: number,
): Promise<TeamPaymentConfig> {
  const settings = await db.query.teamPaymentSettings.findFirst({
    where: eq(teamPaymentSettings.teamId, teamId),
  });

  return {
    stripe: {
      enabled: settings?.stripeEnabled ?? false,
      accountId: settings?.stripeAccountId ?? undefined,
    },
    mbway: {
      enabled: settings?.mbwayEnabled ?? false,
      phone: settings?.mbwayPhone ?? undefined,
      name: settings?.mbwayName ?? undefined,
    },
    cash: {
      enabled: settings?.cashEnabled ?? true,
      instructions:
        settings?.cashInstructions ?? "Paga ao capitão no início do jogo.",
    },
  };
}
