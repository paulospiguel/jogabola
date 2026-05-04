"use server";

import { eq, and, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { guestEventOtp, attendance } from "@/db/schema";
import { sendEmail } from "@/lib/email";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function requestGuestOTP(
  eventId: number,
  name: string,
  email: string
) {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete existing OTPs for this email and event
    await db
      .delete(guestEventOtp)
      .where(
        and(
          eq(guestEventOtp.email, email),
          eq(guestEventOtp.matchSessionId, eventId)
        )
      );

    // Insert new OTP
    await db.insert(guestEventOtp).values({
      email,
      matchSessionId: eventId,
      otp,
      expiresAt,
    });

    // Send email
    if (process.env.NODE_ENV !== "production" && !process.env.RESEND_API_KEY) {
      console.log(`[Guest RSVP OTP] ${email} -> ${otp}`);
    } else {
      await sendEmail({
        to: email,
        subject: "Código de confirmação JogaBola",
        html: `
          <div style="font-family:Arial,sans-serif;background:#0b0f14;color:#f5f7fa;padding:32px">
            <div style="max-width:420px;margin:auto;background:#111827;border:1px solid #263244;border-radius:18px;padding:28px">
              <h1 style="font-size:20px;margin:0 0 12px">Confirma a tua presença</h1>
              <p style="color:#a7b0be;margin:0 0 20px">Olá ${name}, usa este código para confirmar a tua presença no evento.</p>
              <div style="font-size:32px;letter-spacing:8px;font-weight:800;color:#7cff4f;background:#151c26;border-radius:12px;padding:16px;text-align:center">${otp}</div>
              <p style="color:#6b7280;font-size:12px;margin:20px 0 0">Este código expira em 10 minutos.</p>
            </div>
          </div>
        `,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error requesting guest OTP:", error);
    return { success: false, error: "Failed to send OTP" };
  }
}

export async function verifyGuestOTP(
  eventId: number,
  email: string,
  otp: string,
  name: string
) {
  try {
    const record = await db.query.guestEventOtp.findFirst({
      where: and(
        eq(guestEventOtp.email, email),
        eq(guestEventOtp.matchSessionId, eventId),
        eq(guestEventOtp.otp, otp),
        gt(guestEventOtp.expiresAt, new Date())
      ),
    });

    if (!record) {
      return { success: false, error: "Código inválido ou expirado" };
    }

    // Insert attendance
    await db.insert(attendance).values({
      matchSessionId: eventId,
      guestName: name,
      guestEmail: email,
      status: "confirmed",
    });

    // Delete OTP record
    await db.delete(guestEventOtp).where(eq(guestEventOtp.id, record.id));

    revalidatePath(`/e/${eventId}`);
    revalidatePath(`/arena/events/${eventId}`);

    return { success: true };
  } catch (error) {
    console.error("Error verifying guest OTP:", error);
    return { success: false, error: "Failed to verify OTP" };
  }
}
