"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db/client";
import {
  attendance,
  matchReservations,
  matchSessions,
  payments,
  players,
  user,
} from "@/db/schema";
import { withAuthAction } from "@/lib/action-helpers";
import { trackServerEvent } from "@/lib/analytics-server";
import { auth } from "@/lib/auth";
import { userBelongsToTeamRoster } from "@/lib/event-roster-access";
import { hasPendingFines } from "@/lib/fines";
import { classifyErrorSafely } from "@/lib/safe-error";
import { canManageTeam } from "@/lib/team-access";
import { upsertAttendanceSchema } from "@/schemas/attendance.schema";

function isCancelledEventStatus(status: string | null | undefined) {
  return status === "cancelled" || status === "canceled";
}

export const upsertAttendance = withAuthAction(
  upsertAttendanceSchema,
  async (currentUser, data) => {
    if (data.playerId !== currentUser.id) {
      const event = await db.query.matchSessions.findFirst({
        columns: { teamId: true },
        where: eq(matchSessions.id, data.matchSessionId),
      });
      if (!event || !(await canManageTeam(currentUser.id, event.teamId))) {
        return { success: false, error: { code: "FORBIDDEN" } };
      }
    }
    const [row] = await db
      .insert(attendance)
      .values({ ...data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [attendance.matchSessionId, attendance.playerId],
        set: { status: data.status, note: data.note, updatedAt: new Date() },
      })
      .returning();
    return { success: true, data: row };
  },
);

export async function getAttendanceForMatchSession(matchSessionId: number) {
  const rows = await db
    .select()
    .from(attendance)
    .where(eq(attendance.matchSessionId, matchSessionId));
  return { success: true as const, data: rows };
}

export async function getEventAttendanceWithUsers(eventId: number) {
  const records = await db
    .select({
      id: attendance.id,
      status: attendance.status,
      guestName: attendance.guestName,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
      },
      paymentStatus: payments.status,
      paymentMethod: payments.method,
    })
    .from(attendance)
    .leftJoin(user, eq(attendance.playerId, user.id))
    .leftJoin(
      matchReservations,
      and(
        eq(matchReservations.matchSessionId, eventId),
        eq(matchReservations.playerId, attendance.playerId),
      ),
    )
    .leftJoin(payments, eq(payments.matchReservationId, matchReservations.id))
    .where(eq(attendance.matchSessionId, eventId));

  const confirmed = [];
  const reserves = [];
  const pending = [];

  const uniqueRecords = new Map<number, (typeof records)[0]>();
  for (const r of records) {
    const existing = uniqueRecords.get(r.id);
    if (!existing) {
      uniqueRecords.set(r.id, r);
    } else {
      const priority = {
        paid: 3,
        in_review: 2,
        review: 2,
        pending: 1,
        rejected: 0,
        refunded: -1,
      };
      const pNew = priority[r.paymentStatus as keyof typeof priority] ?? -2;
      const pOld =
        priority[existing.paymentStatus as keyof typeof priority] ?? -2;
      if (pNew > pOld) {
        uniqueRecords.set(r.id, r);
      }
    }
  }

  for (const r of uniqueRecords.values()) {
    const name = r.guestName || r.user?.name || "Desconhecido";
    const role = "Jogador";
    const id = r.user?.id || `guest-${r.id}`;

    const participant = {
      id,
      name,
      role,
      status: r.status,
      image: r.user?.image ?? null,
      verified: r.user?.emailVerified ?? false,
      paymentStatus: r.paymentStatus ?? null,
      paymentMethod: r.paymentMethod ?? null,
    };

    if (r.status === "confirmed") {
      confirmed.push(participant);
    } else if (r.status === "reserve") {
      reserves.push(participant);
    } else {
      pending.push(participant);
    }
  }

  return { success: true as const, data: { confirmed, reserves, pending } };
}

export interface EventRosterEntry {
  id: string;
  name: string;
  pos: string;
  status: "PAID" | "REVIEW" | "PENDING" | "RESERVE";
  verified: boolean;
  star: boolean;
}

function mapPaymentToEventStatus(
  paymentStatus: string | null,
): "PAID" | "REVIEW" | "PENDING" {
  if (paymentStatus === "paid") return "PAID";
  if (paymentStatus === "in_review" || paymentStatus === "review")
    return "REVIEW";
  return "PENDING";
}

/** Roster for the event-detail roster tab: main (confirmed) + reserves, with
 * position (from team membership) and payment-derived status. Real data. */
export async function getEventRoster(eventId: number) {
  const records = await db
    .select({
      attendanceId: attendance.id,
      attendanceStatus: attendance.status,
      guestName: attendance.guestName,
      userId: user.id,
      userName: user.name,
      verified: user.emailVerified,
      position: players.position,
      paymentStatus: payments.status,
    })
    .from(attendance)
    .leftJoin(user, eq(attendance.playerId, user.id))
    .leftJoin(players, eq(players.userId, attendance.playerId))
    .leftJoin(
      matchReservations,
      and(
        eq(matchReservations.matchSessionId, eventId),
        eq(matchReservations.playerId, attendance.playerId),
      ),
    )
    .leftJoin(payments, eq(payments.matchReservationId, matchReservations.id))
    .where(eq(attendance.matchSessionId, eventId));

  const main: EventRosterEntry[] = [];
  const reserves: EventRosterEntry[] = [];

  const uniqueRecords = new Map<number, (typeof records)[0]>();
  for (const r of records) {
    const existing = uniqueRecords.get(r.attendanceId);
    if (!existing) {
      uniqueRecords.set(r.attendanceId, r);
    } else {
      const priority = {
        paid: 3,
        in_review: 2,
        review: 2,
        pending: 1,
        rejected: 0,
        refunded: -1,
      };
      const pNew = priority[r.paymentStatus as keyof typeof priority] ?? -2;
      const pOld =
        priority[existing.paymentStatus as keyof typeof priority] ?? -2;
      if (pNew > pOld) {
        uniqueRecords.set(r.attendanceId, r);
      }
    }
  }

  for (const r of uniqueRecords.values()) {
    const entry: EventRosterEntry = {
      id: r.userId || `guest-${r.attendanceId}`,
      name: r.guestName || r.userName || "Desconhecido",
      pos: r.position || "—",
      status:
        r.attendanceStatus === "reserve"
          ? "RESERVE"
          : mapPaymentToEventStatus(r.paymentStatus),
      verified: r.verified ?? false,
      star: false,
    };

    if (r.attendanceStatus === "reserve") {
      reserves.push(entry);
    } else if (r.attendanceStatus === "confirmed") {
      main.push(entry);
    }
  }

  return { success: true as const, data: { main, reserves } };
}

export async function confirmUserAttendance(eventId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false as const, error: "Não autenticado" };
  }

  const userId = session.user.id;

  try {
    const event = await db.query.matchSessions.findFirst({
      columns: {
        rosterOnly: true,
        status: true,
        teamId: true,
        startsAt: true,
        rosterPriorityHours: true,
      },
      where: eq(matchSessions.id, eventId),
    });

    if (!event) {
      return { success: false as const, error: "Evento não encontrado" };
    }

    if (isCancelledEventStatus(event.status)) {
      return { success: false as const, error: "EVENT_CANCELLED" };
    }

    const isRoster = await userBelongsToTeamRoster(event.teamId, userId);

    if (event.rosterOnly && !isRoster) {
      return { success: false as const, error: "EVENT_ROSTER_ONLY" };
    }

    if ((event.rosterPriorityHours ?? 0) > 0 && !isRoster) {
      const startsAt = new Date(event.startsAt ?? 0);
      const priorityDeadline = new Date(
        startsAt.getTime() - (event.rosterPriorityHours ?? 0) * 60 * 60 * 1000,
      );

      if (new Date() < priorityDeadline) {
        return { success: false as const, error: "EVENT_ROSTER_PRIORITY" };
      }
    }

    const isBlocked = await hasPendingFines(userId);
    if (isBlocked) {
      return { success: false as const, error: "EVENT_HAS_FINES" };
    }

    // 1. Upsert attendance
    await db
      .insert(attendance)
      .values({
        matchSessionId: eventId,
        playerId: userId,
        status: "confirmed",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [attendance.matchSessionId, attendance.playerId],
        set: { status: "confirmed", updatedAt: new Date() },
      });

    // 2. Upsert match_reservation (required for payments)
    const [reservation] = await db
      .insert(matchReservations)
      .values({
        matchSessionId: eventId,
        playerId: userId,
        status: "reserved_unpaid",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [matchReservations.matchSessionId, matchReservations.playerId],
        set: { updatedAt: new Date() },
      })
      .returning();

    trackServerEvent(userId, "attendance_confirmed", { event_id: eventId });

    revalidatePath(`/event/${eventId}`);
    revalidatePath(`/arena/events/${eventId}`);
    return { success: true as const, reservationId: reservation.id };
  } catch (error) {
    console.error(
      "attendance:confirmUserAttendance failed",
      classifyErrorSafely(error),
    );
    return { success: false as const, error: "Erro ao confirmar presença" };
  }
}

export async function cancelUserAttendance(eventId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false as const, error: "Não autenticado" };
  }

  try {
    const event = await db.query.matchSessions.findFirst({
      columns: { startsAt: true, priceCents: true },
      where: eq(matchSessions.id, eventId),
    });

    if (event) {
      const startsAt = new Date(event.startsAt);
      const hoursUntilEvent =
        (startsAt.getTime() - Date.now()) / (1000 * 60 * 60);

      // Late cancellation: less than 24 hours before the event
      if (hoursUntilEvent > 0 && hoursUntilEvent < 24) {
        const { fines } = await import("@/db/schema/fines");
        await db.insert(fines).values({
          playerId: session.user.id,
          matchSessionId: eventId,
          amountCents: event.priceCents || 500, // Default 5 EUR fine if price is 0
          currency: "EUR",
          reason: "late_cancellation",
          status: "pending",
        });
      }
    }

    let isLateCancellation = false;
    if (event) {
      const hoursUntil =
        (new Date(event.startsAt).getTime() - Date.now()) / (1000 * 60 * 60);
      isLateCancellation = hoursUntil > 0 && hoursUntil < 24;
    }

    await db
      .delete(attendance)
      .where(
        and(
          eq(attendance.matchSessionId, eventId),
          eq(attendance.playerId, session.user.id),
        ),
      );

    trackServerEvent(session.user.id, "attendance_cancelled", {
      event_id: eventId,
      is_late_cancellation: isLateCancellation,
    });

    revalidatePath(`/event/${eventId}`);
    revalidatePath(`/arena/events/${eventId}`);
    return { success: true as const };
  } catch (error) {
    console.error(
      "attendance:cancelUserAttendance failed",
      classifyErrorSafely(error),
    );
    return { success: false as const, error: "Erro ao cancelar presença" };
  }
}

export async function getUserEventAttendanceStatus(
  eventId: number,
  userId: string,
) {
  if (!userId) return null;

  const record = await db.query.attendance.findFirst({
    where: and(
      eq(attendance.matchSessionId, eventId),
      eq(attendance.playerId, userId),
    ),
  });

  return record?.status ?? null;
}

export async function getPlayerHistory(playerId: string, teamId: number) {
  try {
    // 1. Find the player (registered or guest)
    const [registeredUser] = await db
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(eq(user.id, playerId))
      .limit(1);

    const guestPlayer = registeredUser
      ? null
      : await db.query.players.findFirst({
          where: and(eq(players.id, playerId), eq(players.teamId, teamId)),
        });

    const playerEmail = registeredUser?.email || guestPlayer?.email;

    if (!playerEmail && !registeredUser) {
      return { success: false as const, error: "Player not found" };
    }

    // 2. Fetch attendance records
    const history = await db
      .select({
        id: matchSessions.id,
        title: matchSessions.title,
        startsAt: matchSessions.startsAt,
        status: attendance.status,
      })
      .from(attendance)
      .innerJoin(matchSessions, eq(attendance.matchSessionId, matchSessions.id))
      .where(
        and(
          eq(matchSessions.teamId, teamId),
          registeredUser
            ? eq(attendance.playerId, registeredUser.id)
            : eq(attendance.guestEmail, playerEmail!),
        ),
      )
      .orderBy(desc(matchSessions.startsAt));

    return {
      success: true as const,
      data: history.map(h => ({ ...h, type: "Partida" })),
    };
  } catch (error) {
    console.error("Error fetching player history:", error);
    return { success: false as const, error: "Failed to fetch history" };
  }
}

export async function managerUpdateParticipantStatus(
  eventId: number,
  targetUserId: string,
  newStatus: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false as const, error: "Não autenticado" };
  }

  try {
    const event = await db.query.matchSessions.findFirst({
      columns: { teamId: true },
      where: eq(matchSessions.id, eventId),
    });

    if (!event) {
      return { success: false as const, error: "Evento não encontrado" };
    }

    if (!(await canManageTeam(session.user.id, event.teamId))) {
      return {
        success: false as const,
        error: "Sem permissão para gerir este evento",
      };
    }

    const isGuest = targetUserId.startsWith("guest-");

    if (isGuest) {
      const attendanceId = parseInt(targetUserId.replace("guest-", ""), 10);
      await db
        .update(attendance)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(attendance.id, attendanceId));
    } else {
      await db
        .update(attendance)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(
          and(
            eq(attendance.matchSessionId, eventId),
            eq(attendance.playerId, targetUserId),
          ),
        );
    }

    revalidatePath(`/event/${eventId}`);
    revalidatePath(`/arena/events/${eventId}`);
    return { success: true as const };
  } catch (error) {
    console.error("Error updating participant status:", error);
    return {
      success: false as const,
      error: "Erro ao atualizar status do participante",
    };
  }
}

export async function managerRemoveParticipant(
  eventId: number,
  targetUserId: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false as const, error: "Não autenticado" };
  }

  try {
    const event = await db.query.matchSessions.findFirst({
      columns: { teamId: true },
      where: eq(matchSessions.id, eventId),
    });

    if (!event) {
      return { success: false as const, error: "Evento não encontrado" };
    }

    if (!(await canManageTeam(session.user.id, event.teamId))) {
      return {
        success: false as const,
        error: "Sem permissão para gerir este evento",
      };
    }

    const isGuest = targetUserId.startsWith("guest-");

    if (isGuest) {
      const attendanceId = parseInt(targetUserId.replace("guest-", ""), 10);
      await db.delete(attendance).where(eq(attendance.id, attendanceId));
    } else {
      await db
        .delete(attendance)
        .where(
          and(
            eq(attendance.matchSessionId, eventId),
            eq(attendance.playerId, targetUserId),
          ),
        );
    }

    revalidatePath(`/event/${eventId}`);
    revalidatePath(`/arena/events/${eventId}`);
    return { success: true as const };
  } catch (error) {
    console.error("Error removing participant:", error);
    return { success: false as const, error: "Erro ao remover participante" };
  }
}

export async function managerBlockParticipant(
  eventId: number,
  targetUserId: string,
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false as const, error: "Não autenticado" };
  }

  try {
    const event = await db.query.matchSessions.findFirst({
      columns: { teamId: true, priceCents: true },
      where: eq(matchSessions.id, eventId),
    });

    if (!event) {
      return { success: false as const, error: "Evento não encontrado" };
    }

    if (!(await canManageTeam(session.user.id, event.teamId))) {
      return {
        success: false as const,
        error: "Sem permissão para gerir este evento",
      };
    }

    const isGuest = targetUserId.startsWith("guest-");

    // Para utilizadores registados, podemos também aplicar uma multa como forma de "bloqueio"
    if (!isGuest) {
      const { fines } = await import("@/db/schema/fines");
      await db.insert(fines).values({
        playerId: targetUserId,
        matchSessionId: eventId,
        amountCents: event.priceCents || 500,
        currency: "EUR",
        reason: "manager_blocked",
        status: "pending",
      });
    }

    if (isGuest) {
      const attendanceId = parseInt(targetUserId.replace("guest-", ""), 10);
      await db
        .update(attendance)
        .set({
          status: "refused",
          note: "Bloqueado pelo gestor",
          updatedAt: new Date(),
        })
        .where(eq(attendance.id, attendanceId));
    } else {
      await db
        .update(attendance)
        .set({
          status: "refused",
          note: "Bloqueado pelo gestor",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(attendance.matchSessionId, eventId),
            eq(attendance.playerId, targetUserId),
          ),
        );
    }

    revalidatePath(`/event/${eventId}`);
    revalidatePath(`/arena/events/${eventId}`);
    return { success: true as const };
  } catch (error) {
    console.error("Error blocking participant:", error);
    return { success: false as const, error: "Erro ao bloquear participante" };
  }
}
