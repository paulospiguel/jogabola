"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { user } from "@/db/schema";
import { getAuthUser } from "@/lib/action-helpers";
import { setLocale } from "./locale.actions";

export async function updateUserSettings(data: {
  locale?: string;
  notificationsEnabled?: boolean;
}) {
  const authUser = await getAuthUser();
  if (!authUser)
    return { success: false as const, error: { code: "UNAUTHORIZED" } };

  const updateData: Record<string, string | boolean> = {};
  if (data.locale !== undefined) updateData.locale = data.locale;
  if (data.notificationsEnabled !== undefined)
    updateData.notificationsEnabled = data.notificationsEnabled;

  await db.update(user).set(updateData).where(eq(user.id, authUser.id));

  if (data.locale) await setLocale(data.locale);

  revalidatePath("/arena/settings");
  return { success: true as const };
}
