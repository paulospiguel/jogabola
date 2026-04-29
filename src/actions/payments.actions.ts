"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { paymentProofs, payments } from "@/db/schema";
import {
  createPaymentSchema,
  submitPaymentProofSchema,
} from "@/schemas/payments.schema";
import type { ActionResult } from "@/types/common";

export async function createPaymentAction(
  input: unknown,
): Promise<ActionResult<typeof payments.$inferSelect>> {
  return createPayment(input);
}

export async function createPayment(
  input: unknown,
): Promise<ActionResult<typeof payments.$inferSelect>> {
  const parsed = createPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const [payment] = await db
    .insert(payments)
    .values({ ...parsed.data, status: "pending" })
    .returning();

  return { success: true, data: payment };
}

export async function submitPaymentProofAction(
  input: unknown,
): Promise<ActionResult<typeof paymentProofs.$inferSelect>> {
  return submitPaymentProof(input);
}

export async function submitPaymentProof(
  input: unknown,
): Promise<ActionResult<typeof paymentProofs.$inferSelect>> {
  const parsed = submitPaymentProofSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const [proof] = await db
    .insert(paymentProofs)
    .values(parsed.data)
    .returning();

  await db
    .update(payments)
    .set({ status: "paid_unverified", updatedAt: new Date() })
    .where(eq(payments.id, parsed.data.paymentId));

  return { success: true, data: proof };
}

function validationError(fieldErrors: Record<string, string[] | undefined>) {
  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).filter(([, value]) => value?.length),
      ) as Record<string, string[]>,
    },
  } as const;
}
