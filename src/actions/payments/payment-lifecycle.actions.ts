"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { PAYMENT_REVIEW_STATUS, PAYMENT_STATUS } from "@/constants/payments";
import { db } from "@/db/client";
import { matchReservations, matchSessions, payments } from "@/db/schema";
import { withAction, withAuthAction } from "@/lib/action-helpers";
import { trackServerEvent } from "@/lib/analytics-server";
import { auth } from "@/lib/auth";
import { canActOnReservation } from "@/lib/reservation-access";
import { classifyErrorSafely } from "@/lib/safe-error";
import { canManageTeam } from "@/lib/team-access";
import { createPaymentSchema } from "@/schemas/payments.schema";

const updatePaymentStatusSchema = z.object({
  paymentId: z.number().int().positive(),
  status: z.enum([
    PAYMENT_REVIEW_STATUS.APPROVED,
    PAYMENT_REVIEW_STATUS.REJECTED,
  ]),
});

export const createPayment = withAction(createPaymentSchema, async data => {
  const { guestAccessToken, ...paymentData } = data;
  if (!(await canActOnReservation(data.matchReservationId, guestAccessToken))) {
    return { success: false, error: { code: "FORBIDDEN" } };
  }

  let initialStatus:
    | typeof PAYMENT_STATUS.PENDING
    | typeof PAYMENT_STATUS.PAID_UNVERIFIED = PAYMENT_STATUS.PENDING;

  if (data.method === "transfer") {
    const matchSessionRow = await db
      .select({
        transferRequiresProof: matchSessions.transferRequiresProof,
      })
      .from(matchReservations)
      .innerJoin(
        matchSessions,
        eq(matchSessions.id, matchReservations.matchSessionId),
      )
      .where(eq(matchReservations.id, data.matchReservationId))
      .limit(1)
      .then(rows => rows[0]);

    if (matchSessionRow && !matchSessionRow.transferRequiresProof) {
      initialStatus = PAYMENT_STATUS.PAID_UNVERIFIED;
    }
  }

  const [payment] = await db
    .insert(payments)
    .values({ ...paymentData, status: initialStatus })
    .returning();
  return { success: true, data: payment };
});

export const updatePaymentStatus = withAuthAction(
  updatePaymentStatusSchema,
  async (currentUser, { paymentId, status }) => {
    const [paymentRow] = await db
      .select({
        id: payments.id,
        teamId: matchSessions.teamId,
        eventId: matchSessions.id,
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
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!paymentRow) {
      return { success: false, error: { code: "PAYMENT_NOT_FOUND" } };
    }

    const canAccessTeam = await canManageTeam(
      currentUser.id,
      paymentRow.teamId,
    );
    if (!canAccessTeam) {
      return { success: false, error: { code: "FORBIDDEN" } };
    }

    await db
      .update(payments)
      .set({ status, updatedAt: new Date() })
      .where(eq(payments.id, paymentId));

    if (status === PAYMENT_REVIEW_STATUS.APPROVED) {
      await trackServerEvent(currentUser.id, "payment_approved", {
        payment_id: paymentId,
        event_id: paymentRow.eventId,
      });
    }

    revalidatePath("/arena/payments");
    revalidatePath(`/arena/payments/PAY-${paymentId}`);
    revalidatePath(`/arena/events/${paymentRow.eventId}`);
    revalidatePath(`/event/${paymentRow.eventId}`);

    return { success: true, data: { status } };
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
      .select({
        teamId: matchSessions.teamId,
        priceCents: matchSessions.priceCents,
        currency: matchSessions.currency,
      })
      .from(matchSessions)
      .where(eq(matchSessions.id, eventId))
      .limit(1);

    if (!matchSession) {
      return { success: false as const, error: "Evento não encontrado" };
    }

    const canAccess = await canManageTeam(managerId, matchSession.teamId);
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
  } catch (error) {
    console.error(
      "payments:markPaymentManually failed",
      classifyErrorSafely(error),
    );
    return { success: false as const, error: "Erro ao registar pagamento" };
  }
}

export async function markPaymentAsRefunded(paymentId: number) {
  return await updatePaymentStatusByOwner(paymentId, PAYMENT_STATUS.REFUNDED);
}

export async function markPaymentAsCredited(paymentId: number) {
  return await updatePaymentStatusByOwner(paymentId, PAYMENT_STATUS.CREDITED);
}

async function updatePaymentStatusByOwner(paymentId: number, status: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id)
    return { success: false as const, error: "Não autenticado" };

  const userId = session.user.id;

  const [row] = await db
    .select({
      teamId: matchSessions.teamId,
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
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (!row)
    return { success: false as const, error: "Pagamento não encontrado" };

  const canAccess = await canManageTeam(userId, row.teamId);
  if (!canAccess) return { success: false as const, error: "Sem permissão" };

  await db
    .update(payments)
    .set({ status, updatedAt: new Date(), markedByUserId: userId })
    .where(eq(payments.id, paymentId));

  revalidatePath(`/arena/events/${row.eventId}`);
  revalidatePath(`/arena/payments`);

  return { success: true as const };
}
