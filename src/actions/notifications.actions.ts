"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { notifications } from "@/db/schema";
import { getAuthUser } from "@/lib/action-helpers";

export async function getNotifications() {
  const user = await getAuthUser();
  if (!user) return { success: false as const, error: { code: "UNAUTHORIZED" } };

  const data = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt));

  return { success: true as const, data };
}

export async function markNotificationAsRead(id: string) {
  const user = await getAuthUser();
  if (!user) return { success: false as const, error: { code: "UNAUTHORIZED" } };

  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));

  revalidatePath("/arena/notifications");
  return { success: true as const };
}

export async function markAllAsRead() {
  const user = await getAuthUser();
  if (!user) return { success: false as const, error: { code: "UNAUTHORIZED" } };

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
