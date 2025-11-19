"use client";

import { setUserLocale } from "@/actions/user";
import { LuGlobe as Globe } from "@/components/icons";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger
} from "@/components/ui/select";
import { type Locale, locales } from "@/i18n/configs";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

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
      await setUserLocale(newLocale);
      router.refresh();
    });
  }

  return (
    <Select
      disabled={isPending}
      defaultValue={locale}
      onValueChange={onLanguageChange}
    >
      <SelectTrigger 
        className="h-10 w-auto min-w-[80px] gap-2 rounded-full border border-white/20 bg-white/5 px-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10 focus:ring-0 focus:ring-offset-0"
      >
        <div className="flex items-center gap-2">
          {isPending ? (
            <Globe className="h-4 w-4 animate-spin text-[#00cfb1]" />
          ) : (
            <Globe className="h-4 w-4 text-[#00cfb1]" />
          )}
          <span className="text-base leading-none">{LANGUAGES[locale]?.icon}</span>
          {!onlyIcon && (
            <span className="text-xs font-bold text-white/90">
              {LANGUAGES[locale]?.code}
            </span>
          )}
        </div>
      </SelectTrigger>
      <SelectContent className="border-white/10 bg-[#21005a]/95 text-white backdrop-blur-xl">
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
