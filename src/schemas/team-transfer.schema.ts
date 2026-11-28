import { z } from "zod";

const teamIdField = z
  .number()
  .int()
  .positive({ message: "VALIDATION_TEAM_REQUIRED" });

const transferIdField = z.number().int().positive();

/** base64url of 32 random bytes is 43 chars; accept a small margin. */
const tokenField = z
  .string()
  .min(32)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/);

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const requestOwnershipTransferSchema = z
  .object({
    teamId: teamIdField,
    toUserId: z.string().trim().min(1).optional(),
    toEmail: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "VALIDATION_EMAIL_INVALID" })
      .optional(),
    confirmTeamName: z.string().min(1, { message: "VALIDATION_REQUIRED" }),
  })
  .refine(
    data => (data.toUserId === undefined) !== (data.toEmail === undefined),
    {
      message: "VALIDATION_ONE_RECIPIENT",
      path: ["toUserId"],
    },
  );

export const teamTransferTeamSchema = z.object({ teamId: teamIdField });

export const transferTokenSchema = z.object({ token: tokenField });

export const transferIdSchema = z.object({ transferId: transferIdField });

export type RequestOwnershipTransferInput = z.infer<
  typeof requestOwnershipTransferSchema
>;
