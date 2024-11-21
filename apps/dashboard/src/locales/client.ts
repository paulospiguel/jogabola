"use client";

import { createI18nClient } from "next-international/client";

// NOTE: Also update middleware.ts to support locale
export const languages = ["pt", "en", "es"];

export const { useScopedI18n, I18nProviderClient, useCurrentLocale, useChangeLocale, useI18n } = createI18nClient({
	en: () => import("./i18n/en"),
	// pt: () => import("./i18n/pt"),
	// es: () => import("./i18n/es"),
});
