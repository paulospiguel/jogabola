import { z } from "zod";

export const PAYMENT_METHODS = ["stripe", "mbway", "cash"] as const;

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
  method: z.enum(PAYMENT_METHODS),
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

export const requestPresignedUrlSchema = z.object({
  paymentId: z.number().int().positive(),
  contentType: z.string(),
  sizeBytes: z.number().int().positive(),
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

export const upsertTeamPaymentSettingsSchema = z.object({
  teamId: z.number().int().positive(),
  stripeEnabled: z.boolean().default(false),
  stripeAccountId: z.string().optional(),
  mbwayEnabled: z.boolean().default(false),
  mbwayPhone: z
    .string()
    .regex(/^\+?[0-9\s]{9,15}$/, "Número inválido")
    .optional()
    .or(z.literal("")),
  mbwayName: z.string().max(80).optional(),
  cashEnabled: z.boolean().default(true),
  cashInstructions: z.string().max(300).optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type SubmitPaymentProofInput = z.infer<typeof submitPaymentProofSchema>;
export type VerifyPaymentProofInput = z.infer<typeof verifyPaymentProofSchema>;
export type UpsertTeamPaymentSettingsInput = z.infer<
  typeof upsertTeamPaymentSettingsSchema
>;
