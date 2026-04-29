"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { setLocale } from "./locale.actions";

export async function updateUserSettings(data: {
  locale?: string;
  notificationsEnabled?: boolean;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const updateData: Record<string, string | boolean> = {};
    if (data.locale !== undefined) updateData.locale = data.locale;
    if (data.notificationsEnabled !== undefined)
      updateData.notificationsEnabled = data.notificationsEnabled;

    await db.update(user).set(updateData).where(eq(user.id, session.user.id));

    if (data.locale) {
      await setLocale(data.locale);
    }

    revalidatePath("/arena/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
