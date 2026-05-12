"use server";

import { and, desc, eq, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { matchSessions, notifications } from "@/db/schema";
import { getAuthUser } from "@/lib/action-helpers";

export async function getNotifications() {
  const user = await getAuthUser();
  if (!user)
    return { success: false as const, error: { code: "UNAUTHORIZED" } };

  const data = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt));

  return { success: true as const, data };
}

export async function markNotificationAsRead(id: string) {
  const user = await getAuthUser();
  if (!user)
    return { success: false as const, error: { code: "UNAUTHORIZED" } };

  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));

  revalidatePath("/arena/notifications");
  return { success: true as const };
}

export async function markAllAsRead() {
  const user = await getAuthUser();
  if (!user)
    return { success: false as const, error: { code: "UNAUTHORIZED" } };

  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, user.id));

  revalidatePath("/arena/notifications");
  return { success: true as const };
}

export async function sendNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  const userResult = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.id, params.userId),
    columns: { notificationsEnabled: true },
  });

  if (userResult && !userResult.notificationsEnabled) {
    return { success: true as const, skipped: true };
  }

  await db.insert(notifications).values({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    metadata: params.metadata,
  });

  return { success: true as const };
}

/** Notify team manager that a payment was submitted and needs validation */
export async function notifyPaymentValidationRequired(params: {
  managerId: string;
  athleteName: string;
  eventTitle: string;
  paymentId: number;
  eventId: number;
}) {
  return sendNotification({
    userId: params.managerId,
    type: "payment_validation_required",
    title: "Pagamento aguarda validação",
    message: `${params.athleteName} submeteu pagamento para "${params.eventTitle}".`,
    metadata: {
      paymentId: params.paymentId,
      eventId: params.eventId,
    },
  });
}

/** Compute-on-request: create deadline reminders for athlete if not already created */
export async function ensureDeadlineReminders(athleteId: string) {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Find upcoming events with payment deadline within 24h
  const upcomingEvents = await db
    .select({
      id: matchSessions.id,
      title: matchSessions.title,
      startsAt: matchSessions.startsAt,
      paymentDeadlineHours: matchSessions.paymentDeadlineHours,
    })
    .from(matchSessions)
    .where(
      and(
        eq(matchSessions.paymentRequired, true),
        lt(matchSessions.startsAt, in24h),
      ),
    );

  for (const event of upcomingEvents) {
    if (!event.paymentDeadlineHours || !event.startsAt) continue;

    const deadlineAt = new Date(
      event.startsAt.getTime() - event.paymentDeadlineHours * 60 * 60 * 1000,
    );

    if (deadlineAt > now && deadlineAt < in24h) {
      // Check if we already sent this notification
      const existing = await db
        .select({ id: notifications.id })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, athleteId),
            eq(notifications.type, "payment_deadline_reminder"),
          ),
        )
        .limit(1);

      if (existing.length === 0) {
        await sendNotification({
          userId: athleteId,
          type: "payment_deadline_reminder",
          title: "Lembrete de pagamento",
          message: `O prazo de pagamento para "${event.title}" expira em breve.`,
          metadata: {
            eventId: event.id,
            deadlineAt: deadlineAt.toISOString(),
          },
        });
      }
    }
  }
}
