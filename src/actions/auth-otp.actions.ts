"use server";

import { randomInt, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { verification } from "@/db/schema";
import {
  type EmailDeliveryErrorCode,
  getEmailDeliveryErrorCode,
  sendAuthOtp,
} from "@/lib/email";

type RequestAuthSignInOTPResult =
  | { success: true }
  | {
      success: false;
      errorCode?: EmailDeliveryErrorCode;
      error: string;
    };

const emailSchema = z.string().email();

function generateOTP() {
  return randomInt(100000, 1000000).toString();
}

function getSignInOtpIdentifier(email: string) {
  return `sign-in-otp-${email}`;
}

export async function requestAuthSignInOTP(
  rawEmail: string,
): Promise<RequestAuthSignInOTPResult> {
  const parsed = emailSchema.safeParse(rawEmail.trim().toLowerCase());

  if (!parsed.success) {
    return { success: false, error: "Email inválido." };
  }

  const email = parsed.data;
  const otp = generateOTP();
  const identifier = getSignInOtpIdentifier(email);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const now = new Date();

  try {
    await db
      .delete(verification)
      .where(eq(verification.identifier, identifier));

    await db.insert(verification).values({
      id: randomUUID(),
      identifier,
      value: `${otp}:0`,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
      console.info(`[auth:email-otp] ${email} -> ${otp}`);
      return { success: true };
    }

    const emailResult = await sendAuthOtp(email, otp);

    if (!emailResult.success) {
      await db
        .delete(verification)
        .where(eq(verification.identifier, identifier));

      return {
        success: false,
        errorCode: getEmailDeliveryErrorCode(emailResult.error),
        error:
          "Não foi possível enviar o código por email. Confirma o email ou tenta novamente.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[auth-otp] requestAuthSignInOTP failed:", error);

    return {
      success: false,
      error: "Erro ao enviar código. Tenta de novo.",
    };
  }
}
