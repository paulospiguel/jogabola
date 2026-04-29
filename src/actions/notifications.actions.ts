"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { notifications } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getNotifications() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const data = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, session.user.id))
      .orderBy(desc(notifications.createdAt));

    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return { success: false, error: "Failed to fetch notifications" };
  }
}

export async function markNotificationAsRead(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, session.user.id),
        ),
      );

    revalidatePath("/arena/notifications");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { success: false, error: "Failed to update notification" };
  }
}

export async function markAllAsRead() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, session.user.id));

    revalidatePath("/arena/notifications");
    return { success: true };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return { success: false, error: "Failed to update notifications" };
  }
}

/**
 * Utility to send a notification (server-side only)
 */
export async function sendNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    // Check if user has notifications enabled
    const userResult = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, params.userId),
      columns: { notificationsEnabled: true },
    });

    if (userResult && !userResult.notificationsEnabled) {
      return { success: true, skipped: true };
    }

    await db.insert(notifications).values({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      metadata: params.metadata,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send notification:", error);
    return { success: false, error: "Failed to send notification" };
  }
}
