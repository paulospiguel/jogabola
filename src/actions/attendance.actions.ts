"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { attendance } from "@/db/schema";
import { withAction } from "@/lib/action-helpers";
import { auth } from "@/lib/auth";
import { upsertAttendanceSchema } from "@/schemas/attendance.schema";

export const upsertAttendance = withAction(
  upsertAttendanceSchema,
  async data => {
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

import { user } from "@/db/schema";

export async function getEventAttendanceWithUsers(eventId: number) {
  const records = await db
    .select({
      id: attendance.id,
      status: attendance.status,
      guestName: attendance.guestName,
      user: {
        id: user.id,
        name: user.name,
      },
    })
    .from(attendance)
    .leftJoin(user, eq(attendance.playerId, user.id))
    .where(eq(attendance.matchSessionId, eventId));

  const confirmed = [];
  const reserves = [];
  const pending = [];

  for (const r of records) {
    const name = r.guestName || r.user?.name || "Desconhecido";
    const role = "Jogador";
    const id = r.user?.id || `guest-${r.id}`;

    const participant = { id, name, role };

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

export async function confirmUserAttendance(eventId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false as const, error: "Não autenticado" };
  }

  try {
    await db
      .insert(attendance)
      .values({
        matchSessionId: eventId,
        playerId: session.user.id,
        status: "confirmed",
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [attendance.matchSessionId, attendance.playerId],
        set: { status: "confirmed", updatedAt: new Date() },
      });

    revalidatePath(`/event/${eventId}`);
    revalidatePath(`/arena/events/${eventId}`);
    return { success: true as const };
  } catch {
    return { success: false as const, error: "Erro ao confirmar presença" };
  }
}

export async function cancelUserAttendance(eventId: number) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false as const, error: "Não autenticado" };
  }

  try {
    await db
      .delete(attendance)
      .where(
        and(
          eq(attendance.matchSessionId, eventId),
          eq(attendance.playerId, session.user.id),
        ),
      );

    revalidatePath(`/event/${eventId}`);
    revalidatePath(`/arena/events/${eventId}`);
    return { success: true as const };
  } catch {
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
