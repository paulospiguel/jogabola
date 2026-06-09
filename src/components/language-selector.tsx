"use client";

import { Check, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations, useFormatter } from "next-intl";
import { useState, useTransition } from "react";
import { setLocale } from "@/actions/locale.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type Locale, locales } from "@/i18n/configs";
import { cn } from "@/lib/utils";

type Language = {
  nativeName: string;
  name: string;
  code: string;
  flag: string;
  flagLabel: string;
};

const LANGUAGES = {
  en: {
    nativeName: "English",
    name: "locales.en",
    code: "EN",
    flag: "england",
    flagLabel: "England flag",
  },
  pt: {
    nativeName: "Português",
    name: "locales.pt",
    code: "PT",
    flag: "🇵🇹",
    flagLabel: "Bandeira de Portugal",
  },
  es: {
    nativeName: "Español",
    name: "locales.es",
    code: "ES",
    flag: "🇪🇸",
    flagLabel: "Bandera de España",
  },
  fr: {
    nativeName: "Français",
    name: "locales.fr",
    code: "FR",
    flag: "🇫🇷",
    flagLabel: "Drapeau de France",
  },
} as Record<Locale, Language>;

function LanguageFlag({
  language,
  className,
}: {
  language: Language;
  className?: string;
}) {
  if (language.flag === "england") {
    return (
      <span
        className={cn(
          "relative inline-block h-[1em] w-[1.42em] overflow-hidden rounded-[0.16em] bg-white align-[-0.12em] shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]",
          className,
        )}
        role="img"
        aria-label={language.flagLabel}
      >
        <span className="absolute top-1/2 left-0 h-[20%] w-full -translate-y-1/2 bg-[#CE1124]" />
        <span className="absolute top-0 left-1/2 h-full w-[14%] -translate-x-1/2 bg-[#CE1124]" />
      </span>
    );
  }

  return (
    <span className={className} role="img" aria-label={language.flagLabel}>
      {language.flag}
    </span>
  );
}

export default function LanguageSelector({
  onlyIcon = false,
}: {
  onlyIcon?: boolean;
}) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const languageFormatter = useFormatter();

  async function onLanguageChange(lang: Locale) {
    if (lang === locale || isPending) {
      setIsOpen(false);
      return;
    }

    const newLocale = lang as Locale;
    startTransition(async () => {
      const result = await setLocale(newLocale);

      if (result.success) {
        setIsOpen(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={isPending}
          className={cn(
            "group relative inline-flex h-11 min-w-11 items-center justify-center gap-2 overflow-hidden rounded-full border border-arena-primary/25 bg-arena-bg/55 px-4 text-sm font-extrabold text-arena-text shadow-[0_0_28px_rgba(124,255,79,.12)] backdrop-blur-xl transition-all hover:border-arena-primary/55 hover:bg-arena-primary/10 hover:shadow-[0_0_34px_rgba(124,255,79,.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arena-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06090D] disabled:cursor-not-allowed disabled:opacity-60",
            onlyIcon ? "w-11 px-0" : "min-w-[88px]",
          )}
          aria-label={t("locales.placeholder")}
        >
          <span className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(124,255,79,.18),transparent_42%),radial-gradient(circle_at_90%_90%,rgba(56,189,248,.14),transparent_45%)] opacity-80 transition-opacity group-hover:opacity-100" />
          <Globe
            className="relative size-5 text-arena-primary"
            strokeWidth={2.4}
          />
          {!onlyIcon && (
            <span className="relative flex items-center gap-2 text-[13px] leading-snug tracking-[0.12em]">
              <LanguageFlag
                language={LANGUAGES[locale]}
                className="text-base leading-none"
              />
              <span>{LANGUAGES[locale]?.code}</span>
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent
        overlayClassName="bg-[#06090D]/72 backdrop-blur-xl"
        className="max-w-[min(92vw,680px)] overflow-hidden rounded-[18px] border border-arena-primary/25 bg-[#06090D]/94 px-5 py-12 text-arena-text shadow-[0_0_70px_rgba(124,255,79,.14),0_34px_90px_-46px_rgba(0,0,0,.95)] backdrop-blur-2xl sm:px-12 sm:py-14 [&>button:last-child]:border [&>button:last-child]:border-arena-primary/20 [&>button:last-child]:bg-arena-bg/70 [&>button:last-child]:text-arena-text-sec [&>button:last-child]:hover:bg-arena-primary/10 [&>button:last-child]:hover:text-arena-primary [&>button:last-child]:focus-visible:ring-arena-primary/70"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(124,255,79,.16),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(56,189,248,.12),transparent_38%),radial-gradient(circle_at_50%_120%,rgba(245,158,11,.08),transparent_44%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(38,50,68,.22)_1px,transparent_1px),linear-gradient(90deg,rgba(38,50,68,.22)_1px,transparent_1px)] bg-[size:56px_56px] opacity-45 [mask-image:radial-gradient(circle_at_center,black_25%,transparent_82%)]" />

        <div className="relative">
          <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full border border-arena-primary/35 bg-arena-primary/10 text-arena-primary shadow-[0_0_28px_rgba(124,255,79,.22)]">
            <Globe className="size-6" strokeWidth={2.4} />
          </div>
          <DialogTitle className="text-center font-sora text-4xl font-extrabold leading-none tracking-normal text-arena-text sm:text-5xl">
            {t("locales.placeholder")}
          </DialogTitle>
        </div>
        <DialogDescription className="sr-only">
          {t("locales.placeholder")}
        </DialogDescription>

        <div className="relative mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {locales.map(lang => {
            const language = LANGUAGES[lang];
            const isSelected = lang === locale;

            return (
              <button
                key={lang}
                type="button"
                disabled={isPending}
                onClick={() => onLanguageChange(lang)}
                className={cn(
                  "group flex min-h-16 w-full items-center justify-between rounded-[10px] border px-4 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arena-primary/70 disabled:cursor-not-allowed disabled:opacity-60",
                  isSelected
                    ? "border-arena-primary/55 bg-arena-primary/15 text-arena-text shadow-[0_0_30px_rgba(124,255,79,.16)]"
                    : "border-arena-border/75 bg-arena-bg/62 text-arena-text-sec hover:border-arena-primary/35 hover:bg-arena-primary/8 hover:text-arena-text",
                )}
              >
                <span className="flex min-w-0 items-center gap-4">
                  <span
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full border text-xl leading-none",
                      isSelected
                        ? "border-arena-primary bg-arena-primary/18 shadow-[0_0_22px_rgba(124,255,79,.18)]"
                        : "border-arena-border bg-arena-surface group-hover:border-arena-primary/45",
                    )}
                  >
                    <LanguageFlag language={language} className="text-xl" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base font-extrabold leading-snug tracking-normal text-arena-text">
                      {languageFormatter.displayName(lang, { type: "language" })}
                    </span>
                    <span className="block truncate text-xs font-semibold leading-snug tracking-normal text-arena-text-muted">
                      {languageFormatter.displayName(lang, { type: "language" })}
                    </span>
                  </span>
                </span>
                {isSelected && (
                  <Check
                    className="ml-3 size-5 shrink-0 text-arena-primary"
                    strokeWidth={2.2}
                  />
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
