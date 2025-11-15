"use server";

import { user } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export const setUserLocale = async (locale: string) => {
  // Persist preference in cookie for i18n resolution
  const cookieStore = await cookies();
  cookieStore.set("NEXT_LOCALE", locale, { path: "/" });
};

export const getUserById = async (userId: string) => {
  return await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .then(res => res[0]);
};
