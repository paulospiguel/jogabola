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
            "inline-flex h-11 min-w-11 items-center justify-center gap-2 border rounded-3xl border-border-default bg-white/5 px-4 text-sm font-bold text-text-primary shadow-[0_18px_45px_-28px_rgba(2,167,255,0.35)] backdrop-blur-md transition-all hover:border-border-hover hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background-base disabled:cursor-not-allowed disabled:opacity-60",
            "[--color-focus-ring:var(--color-neon-primary)]",
            onlyIcon ? "w-11 px-0" : "min-w-[88px]",
          )}
          aria-label={t("locales.placeholder")}
        >
          <Globe className="size-6" strokeWidth={2.4} />
          {!onlyIcon && (
            <span className="text-[15px] leading-snug tracking-normal">
              {LANGUAGES[locale]?.code}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent
        overlayClassName="bg-background-base/35 backdrop-blur-md"
        className="max-w-[min(92vw,720px)] gap-0 rounded-[28px] border border-border-default bg-background-surface/82 px-6 py-14 text-text-primary shadow-[0_32px_90px_-48px_var(--color-shadow-neon-primary)] backdrop-blur-2xl sm:px-16 sm:py-16 [&>button:last-child]:border [&>button:last-child]:border-border-default [&>button:last-child]:bg-white/6 [&>button:last-child]:text-text-muted [&>button:last-child]:hover:bg-white/10 [&>button:last-child]:hover:text-text-primary [&>button:last-child]:focus-visible:ring-neon-primary/60"
      >
        <DialogTitle className="text-center text-3xl font-semibold leading-tight tracking-normal text-text-primary">
          {t("locales.placeholder")}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {t("locales.placeholder")}
        </DialogDescription>

        <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-3 sm:grid-cols-2">
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
                  "flex min-h-12 w-full items-center justify-between rounded-2xl border px-5 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-primary/60 disabled:cursor-not-allowed disabled:opacity-60",
                  "[--color-focus-ring:var(--color-neon-primary)]",
                  isSelected
                    ? "border-arena-primary/35 bg-arena-primary/12 text-text-primary shadow-[0_0_24px_-14px_var(--color-journey-arena-glow)]"
                    : "border-transparent text-text-secondary hover:border-border-hover hover:bg-white/5 hover:text-text-primary",
                )}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="truncate text-lg font-medium leading-snug tracking-normal">
                    {language.nativeName}
                  </span>
                  <span className="truncate text-sm font-medium leading-snug tracking-normal text-text-muted">
                    {t(language.name)}
                  </span>
                </span>
                {isSelected && (
                  <Check
                    className="ml-3 size-4 shrink-0 text-arena-primary"
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
