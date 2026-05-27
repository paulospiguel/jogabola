import { type Locale } from "@/i18n/configs";
import { type Language } from "@/types/languages";

export const LANGUAGES: Record<Locale, Language> = {
  en: {
    nativeName: "English",
    code: "EN",
    flag: "england",
    flagLabel: "England flag",
  },
  pt: {
    nativeName: "Português",
    code: "PT",
    flag: "🇵🇹",
    flagLabel: "Bandeira de Portugal",
  },
  es: {
    nativeName: "Español",
    code: "ES",
    flag: "🇪🇸",
    flagLabel: "Bandera de España",
  },
  fr: {
    nativeName: "Français",
    code: "FR",
    flag: "🇫🇷",
    flagLabel: "Drapeau de France",
  },
};
