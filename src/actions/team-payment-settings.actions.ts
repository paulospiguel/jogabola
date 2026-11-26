"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { teamPaymentSettings } from "@/db/schema";
import { withAuthAction } from "@/lib/action-helpers";
import { userCanAccessTeam, userIsTeamOwner } from "@/lib/team-access";
import { upsertTeamPaymentSettingsSchema } from "@/schemas/payments.schema";
import type { TeamPaymentConfig } from "@/types/payments";

export const upsertTeamPaymentSettings = withAuthAction(
  upsertTeamPaymentSettingsSchema,
  async (user, data) => {
    // Payment destination (IBAN, MB WAY, Stripe account) is owner-only:
    // a roster member must never be able to redirect the team's payments.
    const canAccessTeam = await userCanAccessTeam(user.id, data.teamId);
    if (!canAccessTeam) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
    }
    if (!(await userIsTeamOwner(user.id, data.teamId))) {
      return { success: false, error: { code: "FORBIDDEN" } };
    }

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
  async (user, { teamId }) => {
    const canAccessTeam = await userCanAccessTeam(user.id, teamId);
    if (!canAccessTeam) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
    }

    const settings = await db.query.teamPaymentSettings.findFirst({
      where: eq(teamPaymentSettings.teamId, teamId),
    });
    return { success: true as const, data: settings ?? null };
  },
);

import { withAction } from "@/lib/action-helpers";

export const getPublicTeamPaymentSettings = withAction(
  z.object({ teamId: z.number() }),
  async ({ teamId }) => {
    const settings = await db.query.teamPaymentSettings.findFirst({
      where: eq(teamPaymentSettings.teamId, teamId),
    });
    return { success: true as const, data: toPublicPaymentSettings(settings) };
  },
);

/**
 * Public (guest-facing) view of the payment settings: only the fields an
 * athlete needs to pay, and only for enabled methods. Internal ids and
 * timestamps never leave the server, and details of disabled methods are
 * not exposed.
 */
function toPublicPaymentSettings(
  settings: typeof teamPaymentSettings.$inferSelect | undefined,
) {
  if (!settings) return null;
  return {
    stripeEnabled: settings.stripeEnabled,
    stripeAccountId: settings.stripeEnabled ? settings.stripeAccountId : null,
    mbwayEnabled: settings.mbwayEnabled,
    mbwayPhone: settings.mbwayEnabled ? settings.mbwayPhone : null,
    mbwayName: settings.mbwayEnabled ? settings.mbwayName : null,
    cashEnabled: settings.cashEnabled,
    cashInstructions: settings.cashEnabled ? settings.cashInstructions : null,
    transferEnabled: settings.transferEnabled,
    transferIban: settings.transferEnabled ? settings.transferIban : null,
    transferName: settings.transferEnabled ? settings.transferName : null,
  };
}

// eslint-disable-next-line server-auth-actions
// eslint-disable-next-line react-doctor/server-auth-actions
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
    transfer: {
      enabled: settings?.transferEnabled ?? false,
      iban: settings?.transferIban ?? undefined,
      name: settings?.transferName ?? undefined,
    },
  };
}
