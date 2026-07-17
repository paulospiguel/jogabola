"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Cookie } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  ANALYTICS_CONSENT_CHANGE_EVENT,
  CONSENT_SETTINGS_COOKIE,
  CONSENT_VERSION,
  createConsentRecord,
  parseConsentRecord,
} from "@/lib/consent";

export default function CookieConsent() {
  const t = useTranslations("cookieConsent");
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Granular consent states (defaulting to false under GDPR)
  const [functionalAllowed, setFunctionalAllowed] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const [marketingAllowed, setMarketingAllowed] = useState(false);

  const isPrivacyPage =
    pathname === "/privacy" || pathname.endsWith("/privacy");

  // Load saved per-category preferences into the switches.
  const loadSavedSettings = () => {
    const record = parseConsentRecord(
      localStorage.getItem(CONSENT_SETTINGS_COOKIE),
    );
    if (!record) return null;

    setFunctionalAllowed(record.settings.functional);
    setAnalyticsAllowed(record.settings.analytics);
    setMarketingAllowed(record.settings.marketing);
    return record;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    setMounted(true);
    const consentRecord = loadSavedSettings();

    // No prior consent, or policy/categories changed → ask again (RGPD).
    // Never auto-open on the privacy page (avoid nagging there).
    if (!isPrivacyPage && !consentRecord) {
      setIsVisible(true);
    }
  }, []);

  // Manual re-open (e.g. "Cookie settings" link). Opens the granular panel.
  // biome-ignore lint/correctness/useExhaustiveDependencies: stable handler
  useEffect(() => {
    const handler = () => {
      loadSavedSettings();
      setIsCustomizing(true);
      setIsVisible(true);
    };
    window.addEventListener("jb:open-cookie-settings", handler);
    return () => window.removeEventListener("jb:open-cookie-settings", handler);
  }, []);

  if (!mounted) return null;

  const saveConsent = (
    status: "accepted" | "declined" | "custom",
    settings: { functional: boolean; analytics: boolean; marketing: boolean },
  ) => {
    // Proof-of-consent record (RGPD accountability): what, when, which version.
    const record = createConsentRecord(status, settings);
    const serializedRecord = JSON.stringify(record);

    // 1. Save to Local Storage
    localStorage.setItem("cookie-consent", status);
    localStorage.setItem(CONSENT_SETTINGS_COOKIE, serializedRecord);
    localStorage.setItem("cookie-consent-version", String(CONSENT_VERSION));
    localStorage.setItem("cookie-consent-record", serializedRecord);

    // 2. Save to document.cookie (6 months — ePrivacy/CNPD: consent ≤ 6 months)
    const maxAge = 180 * 24 * 60 * 60; // 6 months in seconds
    // biome-ignore lint/suspicious/noDocumentCookie: Necessário para o Next.js Middleware ler o consentimento no servidor
    document.cookie = `cookie-consent=${status}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
    // biome-ignore lint/suspicious/noDocumentCookie: Necessário para o Next.js Middleware ler o consentimento no servidor
    document.cookie = `${CONSENT_SETTINGS_COOKIE}=${encodeURIComponent(serializedRecord)}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;

    window.dispatchEvent(new Event(ANALYTICS_CONSENT_CHANGE_EVENT));

    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const allEnabled = { functional: true, analytics: true, marketing: true };
    setFunctionalAllowed(true);
    setAnalyticsAllowed(true);
    setMarketingAllowed(true);
    saveConsent("accepted", allEnabled);
  };

  const handleDecline = () => {
    const allDisabled = {
      functional: false,
      analytics: false,
      marketing: false,
    };
    setFunctionalAllowed(false);
    setAnalyticsAllowed(false);
    setMarketingAllowed(false);
    saveConsent("declined", allDisabled);
  };

  const handleSavePreferences = () => {
    const customSettings = {
      functional: functionalAllowed,
      analytics: analyticsAllowed,
      marketing: marketingAllowed,
    };
    saveConsent("custom", customSettings);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          layout
          className="fixed bottom-6 left-1/2 z-50 w-full max-w-2xl -translate-x-1/2 px-4"
        >
          <div className="overflow-hidden rounded-2xl border border-arena-border bg-arena-bg-sec/95 p-6 shadow-[0_32px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl md:p-8">
            <motion.div
              layout
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
              {!isCustomizing ? (
                // Vista 1: Banner de Consentimento Geral (Simplificado)
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-arena-primary/10 text-arena-primary">
                      <Cookie className="h-6 w-6" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-sora text-base font-bold text-arena-text tracking-wide">
                        {t("title")}
                      </h3>
                      <p className="text-sm text-arena-text-sec leading-relaxed">
                        {t("description")}{" "}
                        <a
                          href="/privacy"
                          className="text-arena-primary hover:text-arena-primary/80 font-semibold underline underline-offset-4 transition-colors"
                        >
                          {t("privacyPolicy")}
                        </a>
                        .
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 pt-3 border-t border-arena-border/50 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                      variant="outline"
                      onClick={handleDecline}
                      className="w-full sm:w-auto rounded-xl border border-arena-border bg-arena-surface-el px-6 font-bold text-arena-text transition-all hover:bg-arena-surface active:scale-[0.97]"
                    >
                      {t("rejectAll")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCustomizing(true)}
                      className="w-full sm:w-auto rounded-xl border border-arena-border/60 bg-transparent px-6 font-bold text-arena-text-sec transition-all hover:bg-arena-surface hover:text-arena-text active:scale-[0.97]"
                    >
                      {t("customize")}
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      className="w-full sm:w-auto rounded-xl bg-arena-primary hover:bg-arena-primary/90 px-8 font-black text-arena-bg shadow-lg shadow-arena-primary/20 transition-all hover:shadow-arena-primary/30 active:scale-[0.97]"
                    >
                      {t("acceptAll")}
                    </Button>
                  </div>
                </div>
              ) : (
                // Vista 2: Painel de Definições Granular (Personalizado)
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsCustomizing(false)}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-arena-border bg-arena-surface text-arena-text-sec hover:text-arena-text hover:bg-arena-surface-el transition-all active:scale-95"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h3 className="font-sora text-lg font-bold text-arena-text tracking-wide">
                      {t("title")}
                    </h3>
                  </div>

                  {/* Lista de Categorias de Cookies */}
                  <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-arena-border">
                    {/* Estritamente Necessários */}
                    <div className="flex items-start justify-between gap-4 rounded-xl border border-arena-border/50 bg-arena-surface p-4 transition-colors hover:bg-arena-surface-el">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-sora text-sm font-bold text-arena-text">
                            {t("categories.necessary.title")}
                          </span>
                          <span className="rounded-md bg-arena-primary/15 px-2 py-0.5 text-[9px] font-bold text-arena-primary uppercase tracking-wider">
                            {t("alwaysActive")}
                          </span>
                        </div>
                        <p className="text-xs text-arena-text-sec leading-relaxed">
                          {t("categories.necessary.description")}
                        </p>
                      </div>
                      <Switch checked={true} disabled className="mt-1" />
                    </div>

                    {/* Funcionais e Preferências */}
                    <div className="flex items-start justify-between gap-4 rounded-xl border border-arena-border/50 bg-arena-surface p-4 transition-colors hover:bg-arena-surface-el">
                      <div className="space-y-1">
                        <span className="font-sora text-sm font-bold text-arena-text">
                          {t("categories.functional.title")}
                        </span>
                        <p className="text-xs text-arena-text-sec leading-relaxed">
                          {t("categories.functional.description")}
                        </p>
                      </div>
                      <Switch
                        checked={functionalAllowed}
                        onCheckedChange={setFunctionalAllowed}
                        className="mt-1"
                      />
                    </div>

                    {/* Estatísticas de Desempenho */}
                    <div className="flex items-start justify-between gap-4 rounded-xl border border-arena-border/50 bg-arena-surface p-4 transition-colors hover:bg-arena-surface-el">
                      <div className="space-y-1">
                        <span className="font-sora text-sm font-bold text-arena-text">
                          {t("categories.analytics.title")}
                        </span>
                        <p className="text-xs text-arena-text-sec leading-relaxed">
                          {t("categories.analytics.description")}
                        </p>
                      </div>
                      <Switch
                        checked={analyticsAllowed}
                        onCheckedChange={setAnalyticsAllowed}
                        className="mt-1"
                      />
                    </div>

                    {/* Marketing e Publicidade */}
                    <div className="flex items-start justify-between gap-4 rounded-xl border border-arena-border/50 bg-arena-surface p-4 transition-colors hover:bg-arena-surface-el">
                      <div className="space-y-1">
                        <span className="font-sora text-sm font-bold text-arena-text">
                          {t("categories.marketing.title")}
                        </span>
                        <p className="text-xs text-arena-text-sec leading-relaxed">
                          {t("categories.marketing.description")}
                        </p>
                      </div>
                      <Switch
                        checked={marketingAllowed}
                        onCheckedChange={setMarketingAllowed}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Rodapé da Configuração */}
                  <div className="flex flex-col gap-2.5 pt-3 border-t border-arena-border/50 sm:flex-row sm:items-center sm:justify-end">
                    <Button
                      variant="outline"
                      onClick={handleDecline}
                      className="w-full sm:w-auto rounded-xl border border-arena-border bg-arena-surface-el px-6 font-bold text-arena-text transition-all hover:bg-arena-surface active:scale-[0.97]"
                    >
                      {t("rejectAll")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleSavePreferences}
                      className="w-full sm:w-auto rounded-xl border border-arena-border/60 bg-transparent px-6 font-bold text-arena-text-sec transition-all hover:bg-arena-surface hover:text-arena-text active:scale-[0.97]"
                    >
                      {t("savePreferences")}
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      className="w-full sm:w-auto rounded-xl bg-arena-primary hover:bg-arena-primary/90 px-8 font-black text-arena-bg shadow-lg shadow-arena-primary/20 transition-all hover:shadow-arena-primary/30 active:scale-[0.97]"
                    >
                      {t("acceptAll")}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
