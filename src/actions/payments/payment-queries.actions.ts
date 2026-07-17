"use server";

import { and, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/db/client";
import {
  matchReservations,
  matchSessions,
  paymentProofs,
  payments,
  teams,
  user,
} from "@/db/schema";
import { withAuthAction } from "@/lib/action-helpers";
import { auth } from "@/lib/auth";
import { toUiPaymentStatus } from "@/lib/payment-status";
import { classifyErrorSafely } from "@/lib/safe-error";
import { userCanAccessTeam } from "@/lib/team-access";

export const getTeamPayments = withAuthAction(
  z.object({ teamId: z.number() }),
  async (currentUser, { teamId }) => {
    const canAccessTeam = await userCanAccessTeam(currentUser.id, teamId);
    if (!canAccessTeam) {
      return { success: false, error: { code: "TEAM_NOT_FOUND" } };
    }

    const rawPayments = await db
      .select({
        id: payments.id,
        amountCents: payments.amountCents,
        method: payments.method,
        status: payments.status,
        createdAt: payments.createdAt,
        proofUrl: paymentProofs.fileUrl,
        playerId: user.id,
        playerName: user.name,
        playerEmail: user.email,
        playerImage: user.image,
        playerVerified: user.emailVerified,
        playerCreatedAt: user.createdAt,
        matchId: matchSessions.id,
        matchTitle: matchSessions.title,
        matchStatus: matchSessions.status,
      })
      .from(payments)
      .innerJoin(
        matchReservations,
        eq(payments.matchReservationId, matchReservations.id),
      )
      .innerJoin(
        matchSessions,
        eq(matchReservations.matchSessionId, matchSessions.id),
      )
      .innerJoin(user, eq(matchReservations.playerId, user.id))
      .leftJoin(paymentProofs, eq(paymentProofs.paymentId, payments.id))
      .where(eq(matchSessions.teamId, teamId))
      .orderBy(desc(payments.createdAt));

    const formattedPayments = rawPayments.map(p => ({
      id: `PAY-${p.id}`,
      amount: `€${(p.amountCents / 100).toFixed(2).replace(".", ",")}`,
      method: p.method,
      status: toUiPaymentStatus(p.status),
      score: "low" as const,
      date: p.createdAt
        ? p.createdAt.toISOString().slice(0, 16).replace("T", " ")
        : "",
      proofUrl: p.proofUrl ?? undefined,
      player: {
        id: p.playerId,
        name: p.playerName,
        email: p.playerEmail,
        image: p.playerImage,
        isVerified: p.playerVerified ?? false,
        createdAt: p.playerCreatedAt
          ? p.playerCreatedAt.toISOString()
          : new Date().toISOString(),
      },
      event: {
        id: p.matchId,
        title: p.matchTitle,
        status: p.matchStatus,
      },
    }));

    return { success: true, data: formattedPayments };
  },
);

export async function getPaymentById(paymentId: number): Promise<
  | {
      success: true;
      data: {
        id: number;
        status: string;
        method: string;
        amountCents: number;
        currency: string;
        payerName: string | null;
        teamName: string;
        eventTitle: string;
        eventId: number;
        eventSlug: string | null;
        transferRequiresProof: boolean;
      };
    }
  | { success: false; error: string }
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    const [row] = await db
      .select({
        id: payments.id,
        status: payments.status,
        method: payments.method,
        amountCents: payments.amountCents,
        currency: payments.currency,
        payerName: user.name,
        payerId: matchReservations.playerId,
        teamOwnerId: teams.ownerId,
        teamName: teams.name,
        eventTitle: matchSessions.title,
        eventId: matchSessions.id,
        eventSlug: matchSessions.slug,
        transferRequiresProof: matchSessions.transferRequiresProof,
      })
      .from(payments)
      .innerJoin(
        matchReservations,
        eq(matchReservations.id, payments.matchReservationId),
      )
      .innerJoin(
        matchSessions,
        eq(matchSessions.id, matchReservations.matchSessionId),
      )
      .innerJoin(teams, eq(teams.id, matchSessions.teamId))
      .leftJoin(user, eq(user.id, matchReservations.playerId))
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!row) {
      return { success: false, error: "Pagamento não encontrado" };
    }

    // If authenticated, verify ownership: must be payer or team owner
    if (session?.user?.id) {
      const userId = session.user.id;
      const isPayer = row.payerId === userId;
      const isTeamOwner = row.teamOwnerId === userId;
      if (!isPayer && !isTeamOwner) {
        return { success: false, error: "Sem permissão" };
      }
    }
    // No session = guest user; allow (they were redirected here immediately after paying)

    return {
      success: true,
      data: {
        id: row.id,
        status: row.status,
        method: row.method,
        amountCents: row.amountCents,
        currency: row.currency,
        payerName: row.payerName,
        teamName: row.teamName,
        eventTitle: row.eventTitle,
        eventId: row.eventId,
        eventSlug: row.eventSlug,
        transferRequiresProof: row.transferRequiresProof,
      },
    };
  } catch (error) {
    console.error("payments:getPaymentById failed", classifyErrorSafely(error));
    return { success: false, error: "Erro ao carregar pagamento" };
  }
}

export async function getMyPaymentForEvent(eventId: number): Promise<
  | {
      success: true;
      data: {
        id: number;
        amountCents: number;
        currency: string;
        method: string;
        status: string;
        createdAt: Date | null;
        updatedAt: Date | null;
        proofUrl: string | null;
      } | null;
    }
  | { success: false; error: string }
> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "UNAUTHORIZED" };
    }

    const userId = session.user.id;

    const [row] = await db
      .select({
        id: payments.id,
        amountCents: payments.amountCents,
        currency: payments.currency,
        method: payments.method,
        status: payments.status,
        createdAt: payments.createdAt,
        updatedAt: payments.updatedAt,
        proofUrl: paymentProofs.fileUrl,
      })
      .from(payments)
      .innerJoin(
        matchReservations,
        eq(payments.matchReservationId, matchReservations.id),
      )
      .leftJoin(paymentProofs, eq(paymentProofs.paymentId, payments.id))
      .where(
        and(
          eq(matchReservations.matchSessionId, eventId),
          eq(matchReservations.playerId, userId),
        ),
      )
      .orderBy(desc(paymentProofs.createdAt))
      .limit(1);

    return { success: true, data: row || null };
  } catch (error) {
    console.error("[getMyPaymentForEvent]", error);
    return { success: false, error: "Erro ao carregar pagamento" };
  }
}
