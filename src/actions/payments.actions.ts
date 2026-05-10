"use server";

import { and, desc, eq } from "drizzle-orm";
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
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { withAction, withAuthAction } from "@/lib/action-helpers";
import { auth } from "@/lib/auth";
import { userCanAccessTeam } from "@/lib/team-access";
import { notifyPaymentValidationRequired } from "@/actions/notifications.actions";
import {
  createPaymentSchema,
  submitPaymentProofSchema,
} from "@/schemas/payments.schema";

export const createPayment = withAction(createPaymentSchema, async data => {
  const [payment] = await db
    .insert(payments)
    .values({ ...data, status: "pending" })
    .returning();
  return { success: true, data: payment };
});

export const submitPaymentProof = withAction(
  submitPaymentProofSchema,
  async data => {
    const [proof] = await db.insert(paymentProofs).values(data).returning();
    await db
      .update(payments)
      .set({ status: "paid_unverified", updatedAt: new Date() })
      .where(eq(payments.id, data.paymentId));

    // Notify team manager that proof needs validation
    try {
      const [paymentRow] = await db
        .select({
          managerId: teams.ownerId,
          athleteName: user.name,
          eventTitle: matchSessions.title,
          eventId: matchSessions.id,
        })
        .from(payments)
        .innerJoin(matchReservations, eq(matchReservations.id, payments.matchReservationId))
        .innerJoin(matchSessions, eq(matchSessions.id, matchReservations.matchSessionId))
        .innerJoin(teams, eq(teams.id, matchSessions.teamId))
        .innerJoin(user, eq(user.id, matchReservations.playerId))
        .where(eq(payments.id, data.paymentId))
        .limit(1);

      if (paymentRow) {
        await notifyPaymentValidationRequired({
          managerId: paymentRow.managerId,
          athleteName: paymentRow.athleteName ?? "Atleta",
          eventTitle: paymentRow.eventTitle,
          paymentId: data.paymentId,
          eventId: paymentRow.eventId,
        });
      }
    } catch {
      // Non-blocking: notification failure should not break payment flow
    }

    return { success: true, data: proof };
  },
);

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
        playerVerified: user.emailVerified,
        matchId: matchSessions.id,
        matchTitle: matchSessions.title,
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
      status: p.status === "paid_unverified" ? "validating" : p.status,
      score: "low" as const,
      date: p.createdAt
        ? p.createdAt.toISOString().slice(0, 16).replace("T", " ")
        : "",
      proofUrl: p.proofUrl ?? undefined,
      player: {
        id: p.playerId,
        name: p.playerName,
        isVerified: p.playerVerified ?? false,
      },
      event: {
        id: p.matchId,
        title: p.matchTitle,
      },
    }));

    return { success: true, data: formattedPayments };
  },
);

export async function markPaymentManually(
  eventId: number,
  athleteId: string,
  method: string,
  note?: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false as const, error: "Não autenticado" };
  }

  const managerId = session.user.id;

  try {
    // Verify manager has access to the team that owns this event
    const [matchSession] = await db
      .select({ teamId: matchSessions.teamId, priceCents: matchSessions.priceCents, currency: matchSessions.currency })
      .from(matchSessions)
      .where(eq(matchSessions.id, eventId))
      .limit(1);

    if (!matchSession) {
      return { success: false as const, error: "Evento não encontrado" };
    }

    const canAccess = await userCanAccessTeam(managerId, matchSession.teamId);
    if (!canAccess) {
      return { success: false as const, error: "Sem permissão" };
    }

    // Upsert reservation
    const [reservation] = await db
      .insert(matchReservations)
      .values({
        matchSessionId: eventId,
        playerId: athleteId,
        status: "reserved_unpaid",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [matchReservations.matchSessionId, matchReservations.playerId],
        set: { updatedAt: new Date() },
      })
      .returning();

    // Check for existing payment
    const [existingPayment] = await db
      .select()
      .from(payments)
      .where(eq(payments.matchReservationId, reservation.id))
      .limit(1);

    if (existingPayment) {
      await db
        .update(payments)
        .set({
          status: "approved",
          method,
          markedByUserId: managerId,
          manualNote: note ?? null,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, existingPayment.id));
    } else {
      await db.insert(payments).values({
        matchReservationId: reservation.id,
        amountCents: matchSession.priceCents ?? 0,
        currency: matchSession.currency ?? "EUR",
        method,
        status: "approved",
        markedByUserId: managerId,
        manualNote: note ?? null,
      });
    }

    revalidatePath(`/arena/events/${eventId}`);
    revalidatePath(`/event/${eventId}`);
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erro ao registar pagamento" };
  }
}

export async function getPaymentById(paymentId: number): Promise<{
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
    mbwayPhone?: string | null;
  };
} | { success: false; error: string }> {
  try {
    const [row] = await db
      .select({
        id: payments.id,
        status: payments.status,
        method: payments.method,
        amountCents: payments.amountCents,
        currency: payments.currency,
        payerName: user.name,
        teamName: teams.name,
        eventTitle: matchSessions.title,
        eventId: matchSessions.id,
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
      },
    };
  } catch {
    return { success: false, error: "Erro ao carregar pagamento" };
  }
}
