"use server";

import { user } from "@/drizzle/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";


export const setUserLocale = async (locale: string, userId: string) => {
  //await db.update(user).set({ locale }).where(eq(user.id, userId));
};

export const getUserById = async (userId: string) => {
  return await db.select().from(user).where(eq(user.id, userId)).then(res => res[0]);
};