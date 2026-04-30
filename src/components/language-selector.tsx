"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { setLocale } from "@/actions/locale.actions";
import { LuGlobe as Globe } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { type Locale, locales } from "@/i18n/configs";

type Language = {
  icon: string;
  name: string;
  code: string;
};

const LANGUAGES = {
  en: {
    icon: "🇬🇧",
    name: "locales.en",
    code: "EN",
  },
  pt: {
    icon: "🇵🇹",
    name: "locales.pt",
    code: "PT",
  },
  es: {
    icon: "🇪🇸",
    name: "locales.es",
    code: "ES",
  },
  fr: {
    icon: "🇫🇷",
    name: "locales.fr",
    code: "FR",
  },
} as Record<Locale, Language>;

export default function LanguageSelector({
  onlyIcon = false,
}: {
  onlyIcon?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function onLanguageChange(lang: Locale) {
    const newLocale = lang as Locale;
    startTransition(async () => {
      const result = await setLocale(newLocale);

      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <Select
      disabled={isPending}
      defaultValue={locale}
      onValueChange={onLanguageChange}
    >
      <SelectTrigger className="h-10 w-auto min-w-[90px] gap-3 rounded-full border border-white/15 bg-white/5 px-4 text-sm font-medium text-white backdrop-blur-md transition-all hover:border-neon-primary/40 hover:bg-white/10 focus:ring-neon-primary/20 focus:ring-1">
        <div className="flex items-center gap-2.5">
          {isPending ? (
            <Globe
              className="text-neon-primary h-4 w-4 animate-spin shrink-0"
              style={{ minWidth: "16px", minHeight: "16px" }}
            />
          ) : (
            <Globe
              className="text-neon-primary h-4 w-4 shrink-0"
              style={{ minWidth: "16px", minHeight: "16px" }}
            />
          )}
          <span className="text-base leading-none">
            {LANGUAGES[locale]?.icon}
          </span>
          {!onlyIcon && (
            <span className="text-xs font-bold tracking-tight text-white/90">
              {LANGUAGES[locale]?.code}
            </span>
          )}
        </div>
      </SelectTrigger>
      <SelectContent className="border-white/10 bg-[#050312]/95 text-white backdrop-blur-xl">
        {locales.map(lang => (
          <SelectItem
            key={lang}
            value={lang}
            className="cursor-pointer text-white/80 focus:bg-white/10 focus:text-white"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{LANGUAGES[lang].icon}</span>
              <span>{t(LANGUAGES[lang].name)}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
