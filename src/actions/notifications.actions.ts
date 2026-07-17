"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { notifications } from "@/db/schema";
import { getAuthUser } from "@/lib/action-helpers";

// Re-exported for backwards compat — these are pure server helpers, not HTTP endpoints
export {
  ensureDeadlineReminders,
  notifyPaymentValidationRequired,
  sendNotification,
} from "@/lib/notifications";

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

export async function getUnreadNotificationsCount() {
  const user = await getAuthUser();
  if (!user)
    return { success: false as const, error: { code: "UNAUTHORIZED" } };

  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(
      and(eq(notifications.userId, user.id), eq(notifications.read, false)),
    );

  return { success: true as const, count: result?.count ?? 0 };
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
