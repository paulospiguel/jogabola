"use server";

import { desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  matchReservations,
  matchSessions,
  paymentProofs,
  payments,
  user,
} from "@/db/schema";
import { z } from "zod";
import {
  createPaymentSchema,
  submitPaymentProofSchema,
} from "@/schemas/payments.schema";
import { withAction, withAuthAction } from "@/lib/action-helpers";

export const createPayment = withAction(createPaymentSchema, async (data) => {
  const [payment] = await db
    .insert(payments)
    .values({ ...data, status: "pending" })
    .returning();
  return { success: true, data: payment };
});

export const submitPaymentProof = withAction(
  submitPaymentProofSchema,
  async (data) => {
    const [proof] = await db.insert(paymentProofs).values(data).returning();
    await db
      .update(payments)
      .set({ status: "paid_unverified", updatedAt: new Date() })
      .where(eq(payments.id, data.paymentId));
    return { success: true, data: proof };
  },
);

export const getTeamPayments = withAuthAction(
  z.object({ teamId: z.number() }),
  async (currentUser, { teamId }) => {
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
      .innerJoin(matchReservations, eq(payments.matchReservationId, matchReservations.id))
      .innerJoin(matchSessions, eq(matchReservations.matchSessionId, matchSessions.id))
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
      date: p.createdAt ? p.createdAt.toISOString().slice(0, 16).replace("T", " ") : "",
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
  }
);
