export type Locale = (typeof locales)[number];

export const locales = ["pt", "en", "es", "fr"] as const;
export const defaultLocale: Locale = "pt";
