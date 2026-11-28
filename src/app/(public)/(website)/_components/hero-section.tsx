"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DemoModal } from "@/components/demo/demo-modal";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/providers/analytics";
import { strokeTextStyle, tacticalGridStyle } from "./section-shell";

const TacticalPitchCanvas = dynamic(
  () =>
    import("./three/tactical-pitch-canvas").then(
      mod => mod.TacticalPitchCanvas,
    ),
  { ssr: false },
);

type PreviewTab = "convocation" | "racha" | "secretary";

const PREVIEW_TABS: readonly {
  id: PreviewTab;
  icon: typeof CalendarCheck2;
}[] = [
  { id: "convocation", icon: CalendarCheck2 },
  { id: "racha", icon: Wallet },
  { id: "secretary", icon: Bot },
] as const;

export function HeroSection() {
  const t = useTranslations("homePage.hero");
  const headerT = useTranslations("header");
  const { data: session } = useSession();
  const { logEvent } = useAnalytics();
  const [activeTab, setActiveTab] = useState<PreviewTab>("convocation");

  const ctaHref = session?.user ? "/arena" : "/auth";
  const ctaLabel = session?.user ? t("goToArena") : t("primaryCta");
  const proofItems = t.raw("proofStrip") as string[];

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-[#06090D] px-5 pt-28 pb-16 md:px-10 lg:px-16 lg:pt-32 lg:pb-24">
      <TacticalPitchCanvas className="opacity-90" />

      {/* Atmospheric vignettes for WCAG AA legibility over 3D pitch */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,rgba(124,255,79,0.09),transparent_52%),linear-gradient(180deg,rgba(6,9,13,0.72)_0%,rgba(6,9,13,0.45)_45%,rgba(6,9,13,0.96)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#06090D]/92 via-[#06090D]/60 to-transparent lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={tacticalGridStyle}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1.18fr_0.82fr] lg:gap-10">
          {/* Editorial Value Proposition */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-arena-primary/40 bg-arena-bg/75 px-4 py-2 backdrop-blur-xl">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-2 animate-[pulseDot_1.8s_ease-in-out_infinite] rounded-full bg-arena-primary" />
                <span className="relative inline-flex size-2 rounded-full bg-arena-primary" />
              </span>
              <span className="text-[11px] font-extrabold tracking-[0.14em] text-arena-primary uppercase">
                {t("badge")}
              </span>
            </div>

            <h1 className="mt-7 font-sora text-[42px] leading-[0.96] font-extrabold tracking-tight text-arena-text sm:text-6xl lg:text-[74px]">
              <span>{t("headline.line1")} </span>
              <span className="italic" style={strokeTextStyle()}>
                {t("headline.stroke")}
              </span>
              <br />
              <span className="text-arena-primary">{t("headline.accent")}</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-arena-text-sec md:text-lg md:leading-8">
              {t("description")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Button
                asChild
                className="press h-13 rounded-full bg-arena-primary px-7 text-sm font-extrabold text-[#0B0F14] shadow-[0_0_32px_rgba(124,255,79,0.42)] hover:bg-arena-primary/90"
              >
                <Link
                  href={ctaHref}
                  onClick={() =>
                    logEvent("landing_cta_clicked", undefined, {
                      destination: session?.user ? "arena" : "auth",
                      location: "hero",
                    })
                  }
                >
                  {ctaLabel || headerT("launchJourney")}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>

              <DemoModal
                label={t("secondaryCta")}
                className="press inline-flex h-13 items-center rounded-full border border-arena-border bg-arena-bg/70 px-6 text-sm font-bold text-arena-text backdrop-blur-xl transition-colors hover:border-arena-primary/45 hover:bg-arena-surface"
              />

              <a
                href="#planos"
                className="press inline-flex h-13 items-center px-3 text-sm font-bold text-arena-text-sec transition-colors hover:text-arena-primary"
              >
                {t("plansAnchor")}
              </a>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 border-t border-arena-border/80 pt-6 sm:grid-cols-4">
              {proofItems.map(item => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-xs font-semibold text-arena-text-sec"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-arena-primary" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Interactive Live Command Center Preview */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.75,
              delay: 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-4 rounded-[28px] bg-[radial-gradient(circle_at_80%_20%,rgba(124,255,79,0.22),transparent_55%),radial-gradient(circle_at_20%_80%,rgba(56,189,248,0.16),transparent_55%)] blur-2xl"
            />

            <div className="jb-hero-card jb-hero-card--live relative overflow-hidden rounded-[22px] p-5 md:p-6">
              {/* Top command bar */}
              <div className="flex items-center justify-between gap-3 border-b border-arena-border/80 pb-4">
                <div>
                  <p className="text-[10px] font-extrabold tracking-[0.14em] text-arena-primary uppercase">
                    {t("commandCard.eyebrow")}
                  </p>
                  <p className="mt-0.5 font-sora text-lg font-extrabold text-arena-text">
                    {t("commandCard.clubName")}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-arena-primary/35 bg-arena-primary/15 px-3 py-1 text-[10px] font-extrabold tracking-wider text-arena-primary uppercase">
                  <Sparkles className="size-3" />
                  {t("commandCard.liveTag")}
                </span>
              </div>

              {/* Interactive mode switcher */}
              <div
                role="tablist"
                aria-label={t("commandCard.tabsAriaLabel")}
                className="mt-4 grid grid-cols-3 gap-1.5 rounded-xl border border-arena-border bg-arena-bg/75 p-1"
              >
                {PREVIEW_TABS.map(({ id, icon: Icon }) => {
                  const selected = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setActiveTab(id)}
                      className={cn(
                        "press relative flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-bold transition-colors",
                        selected
                          ? "text-[#0B0F14]"
                          : "text-arena-text-sec hover:text-arena-text",
                      )}
                    >
                      {selected && (
                        <motion.span
                          layoutId="hero-preview-pill"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                          className="absolute inset-0 rounded-lg bg-arena-primary"
                        />
                      )}
                      <Icon className="relative z-10 size-3.5 shrink-0" />
                      <span className="relative z-10 truncate">
                        {t(`commandCard.tabs.${id}`)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Preview Body */}
              <div className="mt-4 min-h-[268px]">
                <AnimatePresence mode="wait">
                  {activeTab === "convocation" && (
                    <motion.div
                      key="convocation"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                      className="space-y-3"
                    >
                      <div className="rounded-xl border border-arena-border bg-arena-bg/70 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-arena-text">
                            {t("commandCard.convocation.matchTitle")}
                          </span>
                          <span className="font-sora text-lg font-extrabold text-arena-primary tabular-nums">
                            14/14
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-arena-text-sec">
                          {t("commandCard.convocation.matchMeta")}
                        </p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-arena-surface">
                          <motion.div
                            initial={{ scaleX: 0.25 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="h-full w-full origin-left rounded-full bg-arena-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            value: "14",
                            label: t("commandCard.convocation.statConfirmed"),
                            tone: "text-arena-primary",
                          },
                          {
                            value: "2",
                            label: t("commandCard.convocation.statWaitlist"),
                            tone: "text-arena-info",
                          },
                          {
                            value: "1",
                            label: t("commandCard.convocation.statPending"),
                            tone: "text-arena-warning",
                          },
                        ].map(stat => (
                          <div
                            key={stat.label}
                            className="rounded-xl border border-arena-border bg-arena-bg/60 p-3"
                          >
                            <div
                              className={cn(
                                "font-sora text-2xl font-extrabold tabular-nums",
                                stat.tone,
                              )}
                            >
                              {stat.value}
                            </div>
                            <div className="mt-0.5 text-[10px] font-bold tracking-wider text-arena-text-muted uppercase">
                              {stat.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-arena-primary/25 bg-arena-primary/10 px-3.5 py-2.5 text-xs font-semibold text-arena-primary">
                        <span className="flex items-center gap-2">
                          <Clock className="size-4 shrink-0" />
                          {t("commandCard.convocation.footerNote")}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "racha" && (
                    <motion.div
                      key="racha"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between rounded-xl border border-arena-border bg-arena-bg/70 p-4">
                        <div>
                          <p className="text-[10px] font-extrabold tracking-wider text-arena-text-muted uppercase">
                            {t("commandCard.racha.collectedLabel")}
                          </p>
                          <p className="mt-1 font-sora text-3xl font-extrabold text-arena-primary tabular-nums">
                            65,00€{" "}
                            <span className="text-sm font-semibold text-arena-text-muted">
                              / 70,00€
                            </span>
                          </p>
                        </div>
                        <span className="rounded-lg border border-arena-success/40 bg-arena-success/15 px-2.5 py-1 text-xs font-extrabold text-arena-success">
                          93%
                        </span>
                      </div>

                      <div className="space-y-2">
                        {(
                          t.raw("commandCard.racha.rows") as {
                            name: string;
                            amount: string;
                            status: string;
                            paid: boolean;
                          }[]
                        ).map(row => (
                          <div
                            key={row.name}
                            className="flex items-center justify-between rounded-xl border border-arena-border bg-arena-bg/55 px-3.5 py-2.5 text-xs"
                          >
                            <span className="font-bold text-arena-text">
                              {row.name}
                            </span>
                            <div className="flex items-center gap-2.5">
                              <span className="font-semibold text-arena-text-sec tabular-nums">
                                {row.amount}
                              </span>
                              <span
                                className={cn(
                                  "rounded-md border px-2 py-0.5 text-[10px] font-extrabold uppercase",
                                  row.paid
                                    ? "border-arena-success/35 bg-arena-success/15 text-arena-success"
                                    : "border-arena-warning/35 bg-arena-warning/15 text-arena-warning",
                                )}
                              >
                                {row.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "secretary" && (
                    <motion.div
                      key="secretary"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                      className="space-y-3"
                    >
                      <div className="rounded-xl border border-arena-info/35 bg-arena-info/10 p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold tracking-wider text-arena-info uppercase">
                            {t("commandCard.secretary.agentLabel")}
                          </span>
                          <span className="text-[10px] font-bold text-arena-text-sec">
                            {t("commandCard.secretary.scopeLabel")}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-arena-text">
                          {t("commandCard.secretary.summary")}
                        </p>
                      </div>

                      <div className="rounded-xl border border-arena-warning/35 bg-arena-warning/10 p-3.5">
                        <p className="text-[10px] font-extrabold tracking-wider text-arena-warning uppercase">
                          {t("commandCard.secretary.ambiguousTag")}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-arena-text-sec">
                          {t("commandCard.secretary.ambiguousDetail")}
                        </p>
                      </div>

                      <div className="flex items-center justify-between rounded-xl border border-arena-primary/35 bg-arena-primary/12 px-3.5 py-2.5">
                        <span className="flex items-center gap-2 text-xs font-bold text-arena-primary">
                          <ShieldCheck className="size-4 shrink-0" />
                          {t("commandCard.secretary.humanGate")}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
