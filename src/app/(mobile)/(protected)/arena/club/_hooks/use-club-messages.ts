"use client";

import { useTranslations } from "next-intl";

/**
 * Maps Server Action error codes (`arenaClubCalendar.errors.*`) and field
 * validation codes (`validation.*`) to localized text. Unknown codes fall
 * back to a generic message instead of leaking the raw code.
 */
export function useClubMessages() {
  const tErrors = useTranslations("arenaClubCalendar.errors");
  const tValidation = useTranslations("validation");

  return {
    error(code: string | null | undefined) {
      if (!code) return "";
      return tErrors.has(code) ? tErrors(code) : tErrors("UNKNOWN_ERROR");
    },
    field(code: string | null | undefined) {
      if (!code) return undefined;
      if (tValidation.has(code)) return tValidation(code);
      return tErrors.has(code) ? tErrors(code) : tErrors("UNKNOWN_ERROR");
    },
  };
}
