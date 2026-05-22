"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Globe, LogOut, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState, useTransition } from "react";
import { setLocale } from "@/actions/locale.actions";
import { type Locale, locales } from "@/i18n/configs";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type Language = {
  nativeName: string;
  code: string;
  flag: string;
  flagLabel: string;
};

const LANGUAGES: Record<Locale, Language> = {
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

type View = "menu" | "language";

export function OnboardingMenu() {
  const t = useTranslations("onboarding");
  const locale = useLocale() as Locale;
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<View>("menu");
  const [isPending, startTransition] = useTransition();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  function handleOpen() {
    setView("menu");
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleLanguageChange(lang: Locale) {
    if (lang === locale || isPending) {
      handleClose();
      return;
    }
    startTransition(async () => {
      const result = await setLocale(lang);
      if (result.success) {
        handleClose();
        router.refresh();
      }
    });
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await signOut();
      window.location.href = "/auth";
    } catch {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger trigger */}
      <button
        id="onboarding-menu-trigger"
        type="button"
        onClick={isOpen ? handleClose : handleOpen}
        aria-label={isOpen ? t("menu.close") : t("menu.open")}
        className="flex size-10 items-center justify-center rounded-full border border-arena-border/70 bg-arena-surface/80 text-arena-text-sec transition-all hover:border-arena-primary/40 hover:bg-arena-surface hover:text-arena-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-arena-primary/60"
      >
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.span
              key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={18} strokeWidth={2.4} />
            </motion.span>
          ) : (
            <motion.span
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Menu size={18} strokeWidth={2.4} />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40"
              onClick={handleClose}
            />

            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              className="absolute top-12 right-0 z-50 w-56 overflow-hidden rounded-[14px] border border-arena-border/80 bg-arena-surface/95 shadow-[0_8px_40px_rgba(0,0,0,.45),0_0_0_1px_rgba(38,50,68,.4)] backdrop-blur-xl"
            >
              {/* Subtle glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(124,255,79,.10),transparent_55%)]" />

              <div className="relative">
                <AnimatePresence mode="wait" initial={false}>
                  {view === "menu" ? (
                    <motion.div
                      key="main-menu"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.14 }}
                      className="p-1.5"
                    >
                      {/* Language option */}
                      <button
                        id="onboarding-menu-language"
                        type="button"
                        onClick={() => setView("language")}
                        className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-medium text-arena-text-sec transition-colors hover:bg-arena-primary/10 hover:text-arena-text"
                      >
                        <Globe
                          size={16}
                          className="shrink-0 text-arena-primary"
                          strokeWidth={2.2}
                        />
                        <span className="flex-1">{t("menu.language")}</span>
                        <span className="text-[11px] font-bold tracking-[0.10em] text-arena-text-muted">
                          {LANGUAGES[locale]?.code}
                        </span>
                      </button>

                      <div className="my-1 h-px bg-arena-border/50" />

                      {/* Logout option */}
                      <button
                        id="onboarding-menu-logout"
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm font-medium text-arena-text-sec transition-colors hover:bg-arena-danger/10 hover:text-arena-danger disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <LogOut
                          size={16}
                          className="shrink-0"
                          strokeWidth={2.2}
                        />
                        <span>
                          {isLoggingOut
                            ? t("menu.loggingOut")
                            : t("menu.logout")}
                        </span>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="lang-submenu"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.14 }}
                    >
                      {/* Back header */}
                      <button
                        type="button"
                        onClick={() => setView("menu")}
                        className="flex w-full items-center gap-2 border-b border-arena-border/50 px-4 py-2.5 text-xs font-semibold tracking-[0.10em] text-arena-text-muted uppercase transition-colors hover:text-arena-text"
                      >
                        <span className="text-base leading-none">←</span>
                        {t("menu.language")}
                      </button>

                      <div className="p-1.5">
                        {locales.map(lang => {
                          const language = LANGUAGES[lang];
                          const isSelected = lang === locale;
                          return (
                            <button
                              key={lang}
                              type="button"
                              disabled={isPending}
                              onClick={() => handleLanguageChange(lang)}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                                isSelected
                                  ? "bg-arena-primary/12 font-semibold text-arena-text"
                                  : "font-medium text-arena-text-sec hover:bg-arena-primary/8 hover:text-arena-text",
                              )}
                            >
                              <span className="text-base leading-none">
                                <LanguageFlag language={language} />
                              </span>
                              <span className="flex-1">
                                {language.nativeName}
                              </span>
                              {isSelected && (
                                <span className="size-4 rounded-full bg-arena-primary/20 text-center text-[10px] font-bold leading-4 text-arena-primary">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
