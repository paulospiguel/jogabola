"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { paymentPrechecks, paymentProofs, payments } from "@/db/schema";
import { verifyPaymentProofSchema } from "@/schemas/payments.schema";
import type { ActionResult } from "@/types/common";

export async function verifyPaymentProofAction(
  input: unknown,
): Promise<ActionResult<typeof paymentPrechecks.$inferSelect>> {
  return verifyPaymentProof(input);
}

export async function verifyPaymentProof(
  input: unknown,
): Promise<ActionResult<typeof paymentPrechecks.$inferSelect>> {
  const parsed = verifyPaymentProofSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      },
    };
  }

  const { aiCheck, paymentProofId } = parsed.data;
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
}
