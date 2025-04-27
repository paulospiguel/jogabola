"use client";

import { type Locale, locales } from "@/i18n/configs";
import { setUserLocale } from "@/services/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LuGlobe as Globe } from "@/components/icons";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { z } from "zod";

const languageSchema = z.object({
  icon: z.string(),
  name: z.string(),
});

type Language = z.infer<typeof languageSchema>;

const LANGUAGES = {
  en: {
    icon: "🇬🇧",
    name: "locales.en",
  },
  pt: {
    icon: "🇧🇷",
    name: "locales.pt",
  },
  es: {
    icon: "🇪🇸",
    name: "locales.es",
  },
  fr: {
    icon: "🇫🇷",
    name: "locales.fr",
  },
} as Record<Locale, Language>;

export default function LanguageSelector({
  onlyIcon = false,
}: {
  onlyIcon?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale();
  const [isPending, startTransition] = useTransition();

  async function onLanguageChange(lang: Locale) {
    const locale = lang as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  }

  return (
    <Select
      disabled={isPending}
      defaultValue={locale}
      onValueChange={onLanguageChange}
    >
      <SelectTrigger className="bg-dark dark:bg-blue-850 w-[180px] dark:border-teal-700 dark:text-teal-700">
        {isPending ? (
          <Globe className="size-6 animate-spin" />
        ) : (
          <Globe className="size-5" />
        )}
        <SelectValue placeholder={t("locales.placeholder")} />
      </SelectTrigger>
      <SelectContent className="dark:bg-zinc-800 dark:text-white">
        {locales.map(lang => (
          <SelectItem key={lang} value={lang} className="space-x-2">
            <span className="mr-1">{LANGUAGES[lang].icon}</span>
            {!onlyIcon && <span>{t(LANGUAGES[lang].name)}</span>}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
