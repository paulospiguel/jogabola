"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { teamPaymentSettings } from "@/db/schema";
import { withAction, withAuthAction } from "@/lib/action-helpers";
import {
  decidePayoutUpdate,
  maskPayoutSettings,
} from "@/lib/payout-reconfigure";
import { can, canViewTeam, isTeamOwner } from "@/lib/team-authz";
import { upsertTeamPaymentSettingsSchema } from "@/schemas/payments.schema";
import type { TeamPaymentConfig } from "@/types/payments";

export const upsertTeamPaymentSettings = withAuthAction(
  upsertTeamPaymentSettingsSchema,
  async (user, data) => {
    const canManage = await can(user.id, data.teamId, "payments.manage");
    if (!canManage) {
      return { success: false, error: { code: "FORBIDDEN" } };
    }

    const existing = await db.query.teamPaymentSettings.findFirst({
      where: eq(teamPaymentSettings.teamId, data.teamId),
    });

    if (existing) {
      // After a transfer, only the new owner can re-enable online methods,
      // and only with fresh details (ADR 0006).
      const flagged = existing.payoutReconfigureRequiredAt != null;
      const decision = decidePayoutUpdate({
        flagged,
        isOwner: flagged ? await isTeamOwner(user.id, data.teamId) : false,
        payload: data,
      });
      if (!decision.allowed) {
        return {
          success: false,
          error: { code: "PAYOUT_RECONFIGURE_REQUIRED" },
        };
      }

      const [updated] = await db
        .update(teamPaymentSettings)
        .set({
          ...decision.payload,
          ...(decision.clearFlag && { payoutReconfigureRequiredAt: null }),
          updatedAt: new Date(),
        })
        .where(eq(teamPaymentSettings.teamId, data.teamId))
        .returning();
      return { success: true as const, data: maskPayoutSettings(updated) };
    }

    const [created] = await db
      .insert(teamPaymentSettings)
      .values(data)
      .returning();
    return { success: true as const, data: maskPayoutSettings(created) };
  },
);

export const getTeamPaymentSettings = withAuthAction(
  z.object({ teamId: z.number() }),
  async (user, { teamId }) => {
    const canAccessTeam = await canViewTeam(user.id, teamId);
    if (!canAccessTeam) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
    }

    const settings = await db.query.teamPaymentSettings.findFirst({
      where: eq(teamPaymentSettings.teamId, teamId),
    });
    return { success: true as const, data: maskPayoutSettings(settings) };
  },
);

export const getPublicTeamPaymentSettings = withAction(
  z.object({ teamId: z.number() }),
  async ({ teamId }) => {
    const settings = await db.query.teamPaymentSettings.findFirst({
      where: eq(teamPaymentSettings.teamId, teamId),
    });
    return { success: true as const, data: maskPayoutSettings(settings) };
  },
);

// eslint-disable-next-line server-auth-actions
// eslint-disable-next-line react-doctor/server-auth-actions
export async function resolveTeamPaymentConfig(
  teamId: number,
): Promise<TeamPaymentConfig> {
  const settings = maskPayoutSettings(
    await db.query.teamPaymentSettings.findFirst({
      where: eq(teamPaymentSettings.teamId, teamId),
    }),
  );

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
