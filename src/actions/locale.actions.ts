"use server";

import { cookies } from "next/headers";
import { type Locale, locales } from "@/i18n/configs";
import type { ActionResult } from "@/types/common";

export async function setLocale(
  input: unknown,
): Promise<ActionResult<{ locale: Locale }>> {
  if (typeof input !== "string" || !locales.includes(input as Locale)) {
    return { success: false, error: { code: "VALIDATION_INVALID_LOCALE" } };
  }

  const locale = input as Locale;
  const cookieStore = await cookies();

  cookieStore.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 31_536_000,
    sameSite: "lax",
  });

  return { success: true, data: { locale } };
}
