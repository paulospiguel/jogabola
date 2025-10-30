"use server";

import { user } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export const setUserLocale = async (locale: string, userId: string) => {
  // Persist preference in cookie for i18n resolution
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, { path: "/" });

  // Optionally persist in DB if needed in the future
  // await db.update(user).set({ locale }).where(eq(user.id, userId));
};

export const getUserById = async (userId: string) => {
  return await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .then(res => res[0]);
};
