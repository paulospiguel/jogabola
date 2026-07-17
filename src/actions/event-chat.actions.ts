"use server";

import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import {
  attendance,
  eventMessages,
  matchReservations,
  matchSessions,
  payments,
  teams,
  user,
} from "@/db/schema";
import {
  EVENT_CHAT_MESSAGE_EVENT,
  eventChannelName,
  getAblyRest,
} from "@/lib/ably";
import { getAuthUser } from "@/lib/action-helpers";

export interface ChatMessage {
  id: number;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
  deletedAt?: string | null;
  censoredAt?: string | null;
}

/** Access rule: the team captain (owner) always; otherwise the user must have
 * confirmed attendance AND (when the event requires payment) an approved
 * payment. Pending/unpaid/reserve see only the blurred teaser. */
export async function canParticipateInChat(
  eventId: number,
  userId: string,
): Promise<boolean> {
  const authUser = await getAuthUser();
  if (!authUser) return false;

  const event = await db.query.matchSessions.findFirst({
    columns: { teamId: true, paymentRequired: true },
    where: eq(matchSessions.id, eventId),
  });
  if (!event) return false;

  const team = await db.query.teams.findFirst({
    columns: { ownerId: true },
    where: eq(teams.id, event.teamId),
  });
  if (team?.ownerId === userId) return true;

  const confirmed = await db
    .select({ id: attendance.id })
    .from(attendance)
    .where(
      and(
        eq(attendance.matchSessionId, eventId),
        eq(attendance.playerId, userId),
        eq(attendance.status, "confirmed"),
      ),
    )
    .limit(1);

  if (confirmed.length === 0) return false;

  // Free events: confirmed attendance is enough.
  if (!event.paymentRequired) return true;

  // Paid events: require an approved payment for this user's reservation.
  const paid = await db
    .select({ id: payments.id })
    .from(payments)
    .innerJoin(
      matchReservations,
      eq(payments.matchReservationId, matchReservations.id),
    )
    .where(
      and(
        eq(matchReservations.matchSessionId, eventId),
        eq(matchReservations.playerId, userId),
        eq(payments.status, "paid"),
      ),
    )
    .limit(1);

  return paid.length > 0;
}

/** Returns the teamId owner (captain) for a given event. */
async function getEventCaptain(eventId: number): Promise<string | null> {
  const event = await db.query.matchSessions.findFirst({
    columns: { teamId: true },
    where: eq(matchSessions.id, eventId),
  });
  if (!event) return null;

  const team = await db.query.teams.findFirst({
    columns: { ownerId: true },
    where: eq(teams.id, event.teamId),
  });
  return team?.ownerId ?? null;
}

export async function getEventMessages(eventId: number) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return { success: false as const, error: { code: "UNAUTHORIZED" } };
  }

  const allowed = await canParticipateInChat(eventId, authUser.id);
  if (!allowed) {
    return { success: false as const, error: { code: "FORBIDDEN" } };
  }

  const rows = await db
    .select({
      id: eventMessages.id,
      authorId: eventMessages.authorId,
      authorName: user.name,
      text: eventMessages.text,
      createdAt: eventMessages.createdAt,
      deletedAt: eventMessages.deletedAt,
      censoredAt: eventMessages.censoredAt,
    })
    .from(eventMessages)
    .leftJoin(user, eq(eventMessages.authorId, user.id))
    .where(
      and(
        eq(eventMessages.matchSessionId, eventId),
        isNull(eventMessages.deletedAt),
      ),
    )
    .orderBy(asc(eventMessages.createdAt))
    .limit(100);

  const data: ChatMessage[] = rows.map(r => ({
    id: r.id,
    authorId: r.authorId,
    authorName: r.authorName || "Desconhecido",
    text: r.text,
    createdAt: (r.createdAt ?? new Date()).toISOString(),
    deletedAt: r.deletedAt?.toISOString() ?? null,
    censoredAt: r.censoredAt?.toISOString() ?? null,
  }));

  return { success: true as const, data };
}

export async function sendEventMessage(eventId: number, text: string) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return { success: false as const, error: { code: "UNAUTHORIZED" } };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { success: false as const, error: { code: "EMPTY_MESSAGE" } };
  }
  if (trimmed.length > 2000) {
    return { success: false as const, error: { code: "MESSAGE_TOO_LONG" } };
  }

  const allowed = await canParticipateInChat(eventId, authUser.id);
  if (!allowed) {
    return { success: false as const, error: { code: "FORBIDDEN" } };
  }

  const [row] = await db
    .insert(eventMessages)
    .values({
      matchSessionId: eventId,
      authorId: authUser.id,
      text: trimmed,
    })
    .returning();

  const message: ChatMessage = {
    id: row.id,
    authorId: row.authorId,
    authorName: authUser.name || "Desconhecido",
    text: row.text,
    createdAt: (row.createdAt ?? new Date()).toISOString(),
    deletedAt: null,
    censoredAt: null,
  };

  // Publish to Ably so other participants receive it in real time.
  try {
    const rest = getAblyRest();
    await rest.channels
      .get(eventChannelName(eventId))
      .publish(EVENT_CHAT_MESSAGE_EVENT, message);
  } catch (err) {
    // Message is persisted; realtime fan-out failure should not fail the send.
    console.error("Ably publish failed:", err);
  }

  return { success: true as const, data: message };
}

/** Soft-delete: the author can delete their own message. */
export async function deleteMyMessage(messageId: number) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return { success: false as const, error: { code: "UNAUTHORIZED" } };
  }

  const msg = await db.query.eventMessages.findFirst({
    where: eq(eventMessages.id, messageId),
  });

  if (!msg) {
    return { success: false as const, error: { code: "NOT_FOUND" } };
  }
  if (msg.authorId !== authUser.id) {
    return { success: false as const, error: { code: "FORBIDDEN" } };
  }

  await db
    .update(eventMessages)
    .set({ deletedAt: new Date() })
    .where(eq(eventMessages.id, messageId));

  return { success: true as const };
}

/** Captain moderation: blur a participant's message (censorship). */
export async function censorMessage(messageId: number) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return { success: false as const, error: { code: "UNAUTHORIZED" } };
  }

  const msg = await db.query.eventMessages.findFirst({
    columns: { matchSessionId: true },
    where: eq(eventMessages.id, messageId),
  });
  if (!msg) {
    return { success: false as const, error: { code: "NOT_FOUND" } };
  }

  const captainId = await getEventCaptain(msg.matchSessionId);
  if (captainId !== authUser.id) {
    return { success: false as const, error: { code: "FORBIDDEN" } };
  }

  await db
    .update(eventMessages)
    .set({ censoredAt: new Date() })
    .where(eq(eventMessages.id, messageId));

  return { success: true as const };
}

/** Captain can undo censorship. */
export async function uncensorMessage(messageId: number) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return { success: false as const, error: { code: "UNAUTHORIZED" } };
  }

  const msg = await db.query.eventMessages.findFirst({
    columns: { matchSessionId: true },
    where: eq(eventMessages.id, messageId),
  });
  if (!msg) {
    return { success: false as const, error: { code: "NOT_FOUND" } };
  }

  const captainId = await getEventCaptain(msg.matchSessionId);
  if (captainId !== authUser.id) {
    return { success: false as const, error: { code: "FORBIDDEN" } };
  }

  await db
    .update(eventMessages)
    .set({ censoredAt: null })
    .where(eq(eventMessages.id, messageId));

  return { success: true as const };
}
