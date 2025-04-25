import { CONFIG } from "@/constants/app";

// Define tipo Locale com base nas constantes centralizadas
export type Locale = (typeof CONFIG.SUPPORTED_LOCALES)[number];

// Usa as constantes para os locales suportados
export const locales = CONFIG.SUPPORTED_LOCALES as readonly Locale[];

// Usa a constante para o locale padrão
export const defaultLocale: Locale = CONFIG.DEFAULT_LOCALE as Locale;
