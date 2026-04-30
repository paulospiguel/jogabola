"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { paymentProofs, payments } from "@/db/schema";
import {
  createPaymentSchema,
  submitPaymentProofSchema,
} from "@/schemas/payments.schema";
import { withAction } from "@/lib/action-helpers";

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
