"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { matchSessions, user as userTable } from "@/db/schema";
import { eventNotices } from "@/db/schema/notices";
import { getAuthUser } from "@/lib/action-helpers";
import { canManageTeam } from "@/lib/team-access";

// eslint-disable-next-line server-auth-actions
export async function getEventNotices(matchSessionId: number) {
  try {
    const rows = await db
      .select({
        id: eventNotices.id,
        message: eventNotices.message,
        type: eventNotices.type,
        createdAt: eventNotices.createdAt,
        author: {
          name: userTable.name,
          image: userTable.image,
        },
      })
      .from(eventNotices)
      .leftJoin(userTable, eq(eventNotices.authorId, userTable.id))
      .where(eq(eventNotices.matchSessionId, matchSessionId))
      .orderBy(desc(eventNotices.createdAt));

    return { success: true as const, data: rows };
  } catch (error) {
    console.error("[getEventNotices]", error);
    return { success: false as const, error: "Erro ao carregar avisos" };
  }
}

export async function createEventNotice(input: {
  matchSessionId: number;
  message: string;
  type?: string;
}) {
  const user = await getAuthUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  try {
    const event = await db.query.matchSessions.findFirst({
      where: eq(matchSessions.id, input.matchSessionId),
      columns: { teamId: true },
    });

    if (!event)
      return { success: false as const, error: "Evento não encontrado" };

    const canManage = await canManageTeam(user.id, event.teamId);
    if (!canManage) return { success: false as const, error: "Sem permissão" };

    const [notice] = await db
      .insert(eventNotices)
      .values({
        matchSessionId: input.matchSessionId,
        authorId: user.id,
        message: input.message,
        type: input.type || "info",
      })
      .returning();

    revalidatePath(`/event/${input.matchSessionId}`);
    revalidatePath(`/arena/events/${input.matchSessionId}`);

    return { success: true as const, data: notice };
  } catch (error) {
    console.error("[createEventNotice]", error);
    return { success: false as const, error: "Erro ao criar aviso" };
  }
}

export async function deleteEventNotice(noticeId: number) {
  const user = await getAuthUser();
  if (!user) return { success: false as const, error: "UNAUTHORIZED" };

  try {
    const notice = await db.query.eventNotices.findFirst({
      where: eq(eventNotices.id, noticeId),
    });

    if (!notice)
      return { success: false as const, error: "Aviso não encontrado" };

    if (notice.authorId !== user.id) {
      // Also allow team owner to delete
      const event = await db.query.matchSessions.findFirst({
        where: eq(matchSessions.id, notice.matchSessionId),
        columns: { teamId: true },
      });
      const canManage = event
        ? await canManageTeam(user.id, event.teamId)
        : false;
      if (!canManage)
        return { success: false as const, error: "Sem permissão" };
    }

    await db.delete(eventNotices).where(eq(eventNotices.id, noticeId));

    revalidatePath(`/event/${notice.matchSessionId}`);
    revalidatePath(`/arena/events/${notice.matchSessionId}`);

    return { success: true as const };
  } catch (error) {
    console.error("[deleteEventNotice]", error);
    return { success: false as const, error: "Erro ao eliminar aviso" };
  }
}
