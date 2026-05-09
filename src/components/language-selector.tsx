"use client";

import { Check, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
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
};

const LANGUAGES = {
  en: {
    nativeName: "English",
    name: "locales.en",
    code: "EN",
  },
  pt: {
    nativeName: "Português",
    name: "locales.pt",
    code: "PT",
  },
  es: {
    nativeName: "Español",
    name: "locales.es",
    code: "ES",
  },
  fr: {
    nativeName: "Français",
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
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

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
            <span className="relative text-[13px] leading-snug tracking-[0.12em]">
              {LANGUAGES[locale]?.code}
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
                      "flex size-10 shrink-0 items-center justify-center rounded-full border font-sora text-xs font-extrabold tracking-[0.12em]",
                      isSelected
                        ? "border-arena-primary bg-arena-primary text-[#0B0F14]"
                        : "border-arena-border bg-arena-surface text-arena-primary group-hover:border-arena-primary/45",
                    )}
                  >
                    {language.code}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-base font-extrabold leading-snug tracking-normal text-arena-text">
                      {language.nativeName}
                    </span>
                    <span className="block truncate text-xs font-semibold leading-snug tracking-normal text-arena-text-muted">
                      {t(language.name)}
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
