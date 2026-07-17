import { and, eq } from "drizzle-orm";
import { sendNotification } from "@/lib/notifications";

import { db } from "@/db/client";
import { attendance } from "@/db/schema";
import { user } from "@/db/schema/users";
import { sendEventReminder } from "@/lib/email";

/**
 * Envia lembretes de evento (e-mail + notificação in-app) para todos os
 * jogadores confirmados num evento específico.
 *
 * Idempotente: verifica se já existe notificação do tipo
 * `event_reminder_24h` com `metadata.matchSessionId === eventId` antes
 * de enviar.
 *
 * Não é Server Action — é chamado a partir de Route Handlers de cron.
 */
export async function sendEventReminderCron(
  eventId: number,
): Promise<{ sent: number; skipped: number }> {
  // Fetch event details
  const event = await db.query.matchSessions.findFirst({
    where: (ms, { eq }) => eq(ms.id, eventId),
    columns: {
      id: true,
      title: true,
      startsAt: true,
      location: true,
      capacity: true,
      teamId: true,
    },
  });

  if (!event || !event.startsAt) {
    console.warn(`[cron:event-reminders] event ${eventId} not found`);
    return { sent: 0, skipped: 0 };
  }

  // Fetch confirmed attendance with player info
  const confirmedAttendees = await db
    .select({
      playerId: attendance.playerId,
      playerName: user.name,
      playerEmail: user.email,
    })
    .from(attendance)
    .innerJoin(user, eq(attendance.playerId, user.id))
    .where(
      and(
        eq(attendance.matchSessionId, eventId),
        eq(attendance.status, "confirmed"),
      ),
    );

  // Count total confirmed for the event (for the email stats)
  const confirmedCount = confirmedAttendees.length;

  const now = new Date();
  const hoursUntil = Math.round(
    (event.startsAt.getTime() - now.getTime()) / 3_600_000,
  );

  const eventDate = event.startsAt.toLocaleDateString("pt-PT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Europe/Lisbon",
  });

  const eventTime = event.startsAt.toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Lisbon",
  });

  let sent = 0;
  let skipped = 0;

  for (const attendee of confirmedAttendees) {
    if (!attendee.playerId || !attendee.playerEmail) {
      skipped++;
      continue;
    }

    // Idempotency: check if reminder already sent for this event
    const existingReminder = await db.query.notifications.findFirst({
      where: (n, { and, eq }) =>
        and(eq(n.userId, attendee.playerId!), eq(n.type, "event_reminder_24h")),
      columns: { id: true, metadata: true },
    });

    const isDuplicate =
      existingReminder &&
      (existingReminder.metadata as Record<string, unknown>)?.matchSessionId ===
        eventId;

    if (isDuplicate) {
      skipped++;
      continue;
    }

    // Send email
    await sendEventReminder(attendee.playerEmail, attendee.playerName, {
      id: event.id,
      title: event.title,
      date: eventDate,
      time: eventTime,
      location: event.location,
      hoursUntil,
      confirmedCount,
      totalSpots: event.capacity ?? 0,
    });

    // Send in-app notification
    await sendNotification({
      userId: attendee.playerId,
      type: "event_reminder_24h",
      title: `Jogo amanhã — ${event.title}`,
      message: `O teu jogo começa em ${hoursUntil}h. Local: ${event.location}.`,
      metadata: {
        matchSessionId: event.id,
        startsAt: event.startsAt.toISOString(),
      },
    });

    sent++;
  }

  return { sent, skipped };
}

/**
 * Envia lembretes de pagamento em atraso (notificação in-app) para
 * jogadores confirmados que ainda não pagaram.
 *
 * Idempotente: verifica notificação `payment_deadline_reminder` +
 * `metadata.eventId === eventId` antes de enviar.
 *
 * Não é Server Action — é chamado a partir de Route Handlers de cron.
 */
export async function sendPaymentRemindersCron(): Promise<{
  sent: number;
  skipped: number;
}> {
  const now = new Date();

  // Find upcoming events that require payment
  const upcomingEvents = await db.query.matchSessions.findMany({
    where: (ms, { and, eq, gt }) =>
      and(eq(ms.paymentRequired, true), gt(ms.startsAt, now)),
    columns: {
      id: true,
      title: true,
      startsAt: true,
      paymentDeadlineHours: true,
      teamId: true,
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const event of upcomingEvents) {
    if (!event.paymentDeadlineHours || !event.startsAt) continue;

    // Calculate payment deadline
    const deadlineAt = new Date(
      event.startsAt.getTime() - event.paymentDeadlineHours * 3_600_000,
    );

    // Only process if deadline has passed
    if (deadlineAt > now) continue;

    // Get confirmed attendees for this event
    const confirmedAttendees = await db
      .select({
        playerId: attendance.playerId,
        playerName: user.name,
      })
      .from(attendance)
      .innerJoin(user, eq(attendance.playerId, user.id))
      .where(
        and(
          eq(attendance.matchSessionId, event.id),
          eq(attendance.status, "confirmed"),
        ),
      );

    for (const attendee of confirmedAttendees) {
      if (!attendee.playerId) {
        skipped++;
        continue;
      }

      // Check if player has a paid reservation (status 'confirmed' or 'approved')
      const paidReservation = await db.query.matchReservations.findFirst({
        where: (mr, { and, eq }) =>
          and(
            eq(mr.matchSessionId, event.id),
            eq(mr.playerId, attendee.playerId!),
          ),
        columns: { id: true, status: true },
      });

      // If reservation is already paid/approved, skip
      const reservationPaid =
        paidReservation?.status === "confirmed" ||
        paidReservation?.status === "approved";

      if (reservationPaid) {
        skipped++;
        continue;
      }

      // Idempotency: check if reminder already sent for this event
      const existingReminder = await db.query.notifications.findFirst({
        where: (n, { and, eq }) =>
          and(
            eq(n.userId, attendee.playerId!),
            eq(n.type, "payment_deadline_reminder"),
          ),
        columns: { id: true, metadata: true },
      });

      const isDuplicate =
        existingReminder &&
        (existingReminder.metadata as Record<string, unknown>)?.eventId ===
          event.id;

      if (isDuplicate) {
        skipped++;
        continue;
      }

      // Send in-app notification
      await sendNotification({
        userId: attendee.playerId,
        type: "payment_deadline_reminder",
        title: `Prazo de pagamento ultrapassado — ${event.title}`,
        message: `O prazo de pagamento para "${event.title}" já passou. Regulariza o pagamento para garantires o teu lugar.`,
        metadata: {
          eventId: event.id,
          deadlineAt: deadlineAt.toISOString(),
        },
      });

      sent++;
    }
  }

  return { sent, skipped };
}
