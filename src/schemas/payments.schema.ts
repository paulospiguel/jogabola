import { z } from "zod";

export const createPaymentSchema = z.object({
  matchReservationId: z
    .number()
    .int()
    .positive({ message: "VALIDATION_RESERVATION_REQUIRED" }),
  amountCents: z
    .number()
    .int()
    .positive({ message: "VALIDATION_AMOUNT_REQUIRED" }),
  currency: z.string().length(3).default("EUR"),
  method: z.enum(["manual_mbway", "stripe", "paypal"]),
});

export const submitPaymentProofSchema = z.object({
  paymentId: z
    .number()
    .int()
    .positive({ message: "VALIDATION_PAYMENT_REQUIRED" }),
  fileUrl: z.string().url({ message: "VALIDATION_PROOF_URL_INVALID" }),
  notes: z
    .string()
    .max(500, { message: "VALIDATION_NOTES_TOO_LONG" })
    .optional(),
});

export const verifyPaymentProofSchema = z.object({
  paymentProofId: z
    .number()
    .int()
    .positive({ message: "VALIDATION_PAYMENT_PROOF_REQUIRED" }),
  aiCheck: z.object({
    decision: z.enum(["likely_valid", "needs_review", "likely_invalid"]),
    confidence: z.number().min(0).max(1),
    extractedAmount: z.number().optional(),
    extractedDate: z.string().optional(),
    extractedRecipient: z.string().optional(),
    riskFlags: z.array(z.string()).default([]),
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type SubmitPaymentProofInput = z.infer<typeof submitPaymentProofSchema>;
export type VerifyPaymentProofInput = z.infer<typeof verifyPaymentProofSchema>;
