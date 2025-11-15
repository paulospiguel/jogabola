"use client";

import { setUserLocale } from "@/actions/user";
import { LuGlobe as Globe } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Locale, locales } from "@/i18n/configs";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
type Language = {
  icon: string;
  name: string;
};

const LANGUAGES = {
  en: {
    icon: "🇬🇧",
    name: "locales.en",
  },
  pt: {
    icon: "🇵🇹",
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
  const router = useRouter();

  const buildLocalizedPath = (targetLocale: Locale) => {
    if (typeof window === "undefined") {
      return `/${targetLocale}`;
    }

    const matcher = new RegExp(`^/(${locales.join("|")})`);
    const suffix = window.location.pathname.replace(matcher, "") || "";
    return `/${targetLocale}${suffix}`;
  };

  async function onLanguageChange(lang: Locale) {
    const newLocale = lang as Locale;
    startTransition(async () => {
      await setUserLocale(newLocale);
      router.replace(buildLocalizedPath(newLocale));
      router.refresh();
    });
  }

  return (
    <Select
      disabled={isPending}
      defaultValue={locale}
      onValueChange={onLanguageChange}
    >
      <SelectTrigger className="w-[180px] border-neon-primary/50 bg-overlay-light text-neon-primary backdrop-blur hover:border-neon-primary hover:bg-overlay-medium">
        {isPending ? (
          <Globe className="size-6 animate-spin" />
        ) : (
          <Globe className="size-5" />
        )}
        <SelectValue placeholder={t("locales.placeholder")} />
      </SelectTrigger>
      <SelectContent className="border-border-default bg-background-surface/90 text-text-primary backdrop-blur">
        {locales.map(lang => (
          <SelectItem 
            key={lang} 
            value={lang} 
            className="space-x-2 text-text-primary hover:bg-overlay-medium focus:bg-overlay-medium"
          >
            <span className="mr-1">{LANGUAGES[lang].icon}</span>
            {!onlyIcon && <span>{t(LANGUAGES[lang].name)}</span>}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
