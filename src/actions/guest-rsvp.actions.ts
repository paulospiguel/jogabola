"use server";

import { and, eq, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { attendance, guestEventOtp, matchSessions } from "@/db/schema";
import {
  getEmailDeliveryErrorCode,
  sendAttendanceConfirmed,
  sendGuestRsvpOtp,
} from "@/lib/email";

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function formatEventDate(d: Date) {
  return d.toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function formatEventTime(d: Date) {
  return d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
}

async function getEventDetails(eventId: number) {
  const event = await db.query.matchSessions.findFirst({
    where: eq(matchSessions.id, eventId),
  });
  if (!event) return undefined;
  return {
    title: event.title,
    date: formatEventDate(event.startsAt),
    time: formatEventTime(event.startsAt),
    location: event.location,
    capacity: event.capacity ?? 14,
  };
}

export async function requestGuestOTP(
  eventId: number,
  name: string,
  email: string,
) {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db
      .delete(guestEventOtp)
      .where(
        and(
          eq(guestEventOtp.email, email),
          eq(guestEventOtp.matchSessionId, eventId),
        ),
      );

    await db.insert(guestEventOtp).values({
      email,
      matchSessionId: eventId,
      otp,
      expiresAt,
    });

    if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
      console.log(`[guest-rsvp:otp] ${email} -> ${otp}`);
      return { success: true };
    }

    const event = await getEventDetails(eventId);
    const emailResult = await sendGuestRsvpOtp(
      email,
      name,
      otp,
      event
        ? {
            title: event.title,
            date: `${event.date} · ${event.time}`,
            location: event.location,
          }
        : undefined,
    );

    if (!emailResult.success) {
      return {
        success: false,
        errorCode: getEmailDeliveryErrorCode(emailResult.error),
        error:
          "Não foi possível enviar o PIN por email. Confirma o email ou tenta novamente.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("[guest-rsvp] requestGuestOTP failed:", error);
    return { success: false, error: "Erro ao enviar PIN. Tenta de novo." };
  }
}

export async function verifyGuestOTP(
  eventId: number,
  email: string,
  otp: string,
  name: string,
) {
  try {
    const record = await db.query.guestEventOtp.findFirst({
      where: and(
        eq(guestEventOtp.email, email),
        eq(guestEventOtp.matchSessionId, eventId),
        eq(guestEventOtp.otp, otp),
        gt(guestEventOtp.expiresAt, new Date()),
      ),
    });

    if (!record) {
      return { success: false, error: "Código inválido ou expirado" };
    }

    await db.insert(attendance).values({
      matchSessionId: eventId,
      guestName: name,
      guestEmail: email,
      status: "confirmed",
    });

    await db.delete(guestEventOtp).where(eq(guestEventOtp.id, record.id));

    revalidatePath(`/event/${eventId}`);
    revalidatePath(`/arena/events/${eventId}`);

    // Fire confirmation email (non-blocking)
    const event = await getEventDetails(eventId);
    if (event) {
      const confirmedCount = await db.query.attendance.findMany({
        where: and(
          eq(attendance.matchSessionId, eventId),
          eq(attendance.status, "confirmed"),
        ),
      });

      sendAttendanceConfirmed(
        email,
        name,
        {
          id: eventId,
          title: event.title,
          date: event.date,
          time: event.time,
          location: event.location,
          spotsLeft: Math.max(0, event.capacity - confirmedCount.length),
        },
        true,
      ).catch(err =>
        console.error("[guest-rsvp] confirmation email failed:", err),
      );
    }

    return { success: true };
  } catch (error) {
    console.error("[guest-rsvp] verifyGuestOTP failed:", error);
    return { success: false, error: "Erro ao verificar PIN. Tenta de novo." };
  }
}
