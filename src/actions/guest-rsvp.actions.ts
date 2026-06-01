"use server";

import { and, eq, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import {
  attendance,
  guestEventOtp,
  matchReservations,
  matchSessions,
  user,
} from "@/db/schema";
import {
  getEmailDeliveryErrorCode,
  sendAttendanceConfirmed,
  sendGuestRsvpOtp,
} from "@/lib/email";
import {
  emailBelongsToTeamRoster,
  normalizeRosterEmail,
} from "@/lib/event-roster-access";
import { hasPendingFines } from "@/lib/fines";
import { trackServerEvent } from "@/lib/posthog-server";

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

function isCancelledEventStatus(status: string | null | undefined) {
  return status === "cancelled" || status === "canceled";
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
    status: event.status,
    rosterOnly: event.rosterOnly,
    rosterPriorityHours: event.rosterPriorityHours ?? 0,
    startsAt: event.startsAt,
    teamId: event.teamId,
  };
}

async function ensureUser(email: string, name: string) {
  const existing = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  if (existing) return existing;

  const [ghostUser] = await db
    .insert(user)
    .values({
      id: crypto.randomUUID(),
      email,
      name,
      emailVerified: false,
    })
    .returning();

  return ghostUser;
}

export async function requestGuestOTP(
  eventId: number,
  name: string,
  email: string,
) {
  try {
    const event = await getEventDetails(eventId);
    if (!event || isCancelledEventStatus(event.status)) {
      return {
        success: false,
        error: "Este evento está cancelado e já não aceita confirmações.",
      };
    }

    const normalizedEmail = normalizeRosterEmail(email);
    const isRoster = await emailBelongsToTeamRoster(
      event.teamId,
      normalizedEmail,
    );

    if (event.rosterOnly && !isRoster) {
      return {
        success: false,
        error: "Este evento é reservado ao plantel.",
      };
    }

    if (event.rosterPriorityHours > 0 && !isRoster) {
      const startsAt = new Date(event.startsAt);
      const priorityDeadline = new Date(
        startsAt.getTime() - event.rosterPriorityHours * 60 * 60 * 1000,
      );

      if (new Date() < priorityDeadline) {
        return {
          success: false,
          errorCode: "ROSTER_PRIORITY_ACTIVE",
          error: `Apenas membros do plantel podem confirmar presença até ${event.rosterPriorityHours}h antes do jogo.`,
        };
      }
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, normalizedEmail),
    });

    if (existingUser) {
      const isBlocked = await hasPendingFines(existingUser.id);
      if (isBlocked) {
        return {
          success: false,
          error: "EVENT_HAS_FINES",
        };
      }
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db
      .delete(guestEventOtp)
      .where(
        and(
          eq(guestEventOtp.email, normalizedEmail),
          eq(guestEventOtp.matchSessionId, eventId),
        ),
      );

    await db.insert(guestEventOtp).values({
      email: normalizedEmail,
      matchSessionId: eventId,
      otp,
      expiresAt,
    });

    if (!process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production") {
      console.log(`[guest-rsvp:otp] ${normalizedEmail} -> ${otp}`);
      return { success: true };
    }

    const emailResult = await sendGuestRsvpOtp(
      normalizedEmail,
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
    const event = await getEventDetails(eventId);
    if (!event || isCancelledEventStatus(event.status)) {
      return {
        success: false,
        error: "Este evento está cancelado e já não aceita confirmações.",
      };
    }

    const normalizedEmail = normalizeRosterEmail(email);
    const isRoster = await emailBelongsToTeamRoster(
      event.teamId,
      normalizedEmail,
    );

    if (event.rosterOnly && !isRoster) {
      return {
        success: false,
        error: "Este evento é reservado ao plantel.",
      };
    }

    if (event.rosterPriorityHours > 0 && !isRoster) {
      const startsAt = new Date(event.startsAt);
      const priorityDeadline = new Date(
        startsAt.getTime() - event.rosterPriorityHours * 60 * 60 * 1000,
      );

      if (new Date() < priorityDeadline) {
        return {
          success: false,
          error: "EVENT_ROSTER_PRIORITY",
        };
      }
    }

    const record = await db.query.guestEventOtp.findFirst({
      where: and(
        eq(guestEventOtp.email, normalizedEmail),
        eq(guestEventOtp.matchSessionId, eventId),
        eq(guestEventOtp.otp, otp),
        gt(guestEventOtp.expiresAt, new Date()),
      ),
    });

    if (!record) {
      return { success: false, error: "Código inválido ou expirado" };
    }

    // Ensure we have a user (Ghost or real)
    const targetUser = await ensureUser(normalizedEmail, name);

    const [_inserted] = await db
      .insert(attendance)
      .values({
        matchSessionId: eventId,
        playerId: targetUser.id,
        guestName: name,
        guestEmail: normalizedEmail,
        status: "confirmed",
      })
      .onConflictDoUpdate({
        target: [attendance.matchSessionId, attendance.playerId],
        set: {
          guestName: name,
          guestEmail: normalizedEmail,
          status: "confirmed",
          updatedAt: new Date(),
        },
      })
      .returning({ id: attendance.id });

    // 2. Upsert match_reservation (required for payments)
    const [reservation] = await db
      .insert(matchReservations)
      .values({
        matchSessionId: eventId,
        playerId: targetUser.id,
        status: "reserved_unpaid",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [matchReservations.matchSessionId, matchReservations.playerId],
        set: { updatedAt: new Date() },
      })
      .returning();

    await db.delete(guestEventOtp).where(eq(guestEventOtp.id, record.id));

    trackServerEvent(targetUser.id, "guest_rsvp_completed", {
      event_id: eventId,
    });

    revalidatePath(`/event/${eventId}`);
    revalidatePath(`/arena/events/${eventId}`);

    // Fire confirmation email (non-blocking)
    if (event) {
      const confirmedCount = await db.query.attendance.findMany({
        where: and(
          eq(attendance.matchSessionId, eventId),
          eq(attendance.status, "confirmed"),
        ),
      });

      sendAttendanceConfirmed(
        normalizedEmail,
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

    return {
      success: true,
      reservationId: reservation.id,
      guestData: {
        id: targetUser.id,
        email: normalizedEmail,
        name: name,
      },
    };
  } catch (error) {
    console.error("[guest-rsvp] verifyGuestOTP failed:", error);
    return { success: false, error: "Erro ao verificar PIN. Tenta de novo." };
  }
}
