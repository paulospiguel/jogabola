"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { paymentPrechecks, paymentProofs, payments } from "@/db/schema";
import { withAction } from "@/lib/action-helpers";
import { verifyPaymentProofSchema } from "@/schemas/payments.schema";

export const verifyPaymentProof = withAction(
  verifyPaymentProofSchema,
  async ({ aiCheck, paymentProofId }) => {
    const [proof] = await db
      .select()
      .from(paymentProofs)
      .where(eq(paymentProofs.id, paymentProofId))
      .limit(1);

    if (!proof) {
      return { success: false, error: { code: "PAYMENT_PROOF_NOT_FOUND" } };
    }

    const nextStatus =
      aiCheck.decision === "likely_valid" && aiCheck.confidence >= 0.85
        ? "paid_unverified"
        : "review_required";

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
