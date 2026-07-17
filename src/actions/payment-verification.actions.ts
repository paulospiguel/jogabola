"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { paymentPrechecks, paymentProofs, payments } from "@/db/schema";
import { withAction } from "@/lib/action-helpers";
import { canActOnReservation } from "@/lib/reservation-access";
import { verifyPaymentProofSchema } from "@/schemas/payments.schema";

export const verifyPaymentProof = withAction(
  verifyPaymentProofSchema,
  async ({ aiCheck, guestAccessToken, paymentProofId }) => {
    const [proof] = await db
      .select()
      .from(paymentProofs)
      .where(eq(paymentProofs.id, paymentProofId))
      .limit(1);

    if (!proof) {
      return { success: false, error: { code: "PAYMENT_PROOF_NOT_FOUND" } };
    }

    const payment = await db.query.payments.findFirst({
      columns: { matchReservationId: true },
      where: eq(payments.id, proof.paymentId),
    });
    if (!payment) {
      return { success: false, error: { code: "PAYMENT_NOT_FOUND" } };
    }
    if (
      !(await canActOnReservation(payment.matchReservationId, guestAccessToken))
    ) {
      return { success: false, error: { code: "FORBIDDEN" } };
    }

    // Security: client-supplied AI hints must never auto-approve a payment.
    const nextStatus = "review_required" as const;

    const [precheck] = await db
      .insert(paymentPrechecks)
      .values({
        paymentProofId,
        decision: aiCheck.decision,
        confidence: Math.round(aiCheck.confidence * 100),
        extractedAmount: aiCheck.extractedAmount
          ? Math.round(aiCheck.extractedAmount * 100)
          : null,
        extractedDate: aiCheck.extractedDate,
        extractedRecipient: aiCheck.extractedRecipient,
        riskFlags: aiCheck.riskFlags,
        rawCheck: aiCheck,
      })
      .returning();

    await db
      .update(payments)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(payments.id, proof.paymentId));

    return { success: true, data: precheck };
  },
);
