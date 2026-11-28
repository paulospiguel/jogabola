"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CalendarCheck2,
  CheckCircle2,
  Timer,
  Trophy,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  PhoneMockup,
  type PhoneScreen,
} from "@/components/landing/phone-mockup";
import { cn } from "@/lib/utils";
import { SectionHeading, SectionShell } from "./section-shell";

type ModuleKey = "convocations" | "payments" | "secretary" | "timer" | "roster";

interface ShowcaseModule {
  key: ModuleKey;
  screen: PhoneScreen;
  icon: typeof CalendarCheck2;
  badgeColor: string;
}

interface ModuleTranslation {
  tag: string;
  title: string;
  subtitle: string;
  highlights: string[];
  outcomeLabel: string;
  outcomeValue: string;
  ctaLabel: string;
  ctaHref: string;
}

const MODULES: readonly ShowcaseModule[] = [
  {
    key: "convocations",
    screen: "convoca",
    icon: CalendarCheck2,
    badgeColor:
      "text-arena-primary border-arena-primary/35 bg-arena-primary/12",
  },
  {
    key: "payments",
    screen: "paid",
    icon: Wallet,
    badgeColor:
      "text-arena-success border-arena-success/35 bg-arena-success/12",
  },
  {
    key: "secretary",
    screen: "secretary",
    icon: Bot,
    badgeColor: "text-arena-info border-arena-info/35 bg-arena-info/12",
  },
  {
    key: "timer",
    screen: "timer",
    icon: Timer,
    badgeColor:
      "text-arena-highlight border-arena-highlight/35 bg-arena-highlight/12",
  },
  {
    key: "roster",
    screen: "team",
    icon: Trophy,
    badgeColor:
      "text-arena-primary border-arena-primary/35 bg-arena-primary/12",
  },
] as const;

export function ProductShowcaseSection() {
  const t = useTranslations("homePage.productShowcase");
  const [activeIndex, setActiveIndex] = useState(0);
  const items = t.raw("modules") as Record<ModuleKey, ModuleTranslation>;
  const activeMeta = MODULES[activeIndex];
  const activeCopy = items[activeMeta.key];

  return (
    <SectionShell id="produto" number="02" label={t("kicker")}>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <SectionHeading>
          {t("titlePrefix")}{" "}
          <span className="text-arena-primary">{t("titleAccent")}</span>
        </SectionHeading>
        <p className="max-w-xl text-base leading-7 text-arena-text-sec">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-12 grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        {/* Interactive Module Selector List */}
        <div
          role="tablist"
          aria-label={t("tabsAriaLabel")}
          className="flex flex-col gap-3 lg:col-span-5"
        >
          {MODULES.map((mod, index) => {
            const copy = items[mod.key];
            const Icon = mod.icon;
            const isSelected = index === activeIndex;

            return (
              <button
                key={mod.key}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "press group relative flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-all",
                  isSelected
                    ? "border-arena-primary/50 bg-arena-surface-el shadow-[0_0_28px_rgba(124,255,79,0.12)]"
                    : "border-arena-border bg-arena-surface/70 hover:border-arena-primary/30 hover:bg-arena-surface",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
                    isSelected
                      ? "border-arena-primary bg-arena-primary text-[#0B0F14]"
                      : "border-arena-border bg-arena-bg text-arena-primary",
                  )}
                >
                  <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold tracking-[0.14em] text-arena-text-muted uppercase">
                      0{index + 1} · {copy.tag}
                    </span>
                    {isSelected && (
                      <motion.span
                        layoutId="showcase-active-dot"
                        className="size-2 rounded-full bg-arena-primary"
                      />
                    )}
                  </div>
                  <h3 className="mt-1 font-sora text-lg font-extrabold text-arena-text">
                    {copy.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-arena-text-sec">
                    {copy.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Stage: Live Phone Mockup + Operational Detail Card */}
        <div className="relative overflow-hidden rounded-[24px] border border-arena-border bg-linear-to-br from-arena-surface to-[#0B1018] p-6 md:p-8 lg:col-span-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-20 size-72 rounded-full bg-arena-primary/14 blur-[90px]"
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeMeta.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 grid items-center gap-8 md:grid-cols-[auto_1fr]"
            >
              {/* Mobile pitch-side view */}
              <div className="flex justify-center">
                <PhoneMockup
                  scale={0.68}
                  screen={activeMeta.screen}
                  className="drop-shadow-[0_24px_55px_rgba(0,0,0,0.65)]"
                />
              </div>

              {/* Operational capabilities & concrete outcome */}
              <div className="flex flex-col justify-between">
                <div>
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-3 py-1 text-[10px] font-extrabold tracking-widest uppercase",
                      activeMeta.badgeColor,
                    )}
                  >
                    {activeCopy.tag}
                  </span>

                  <h3 className="mt-4 font-sora text-2xl font-extrabold text-arena-text md:text-3xl">
                    {activeCopy.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-arena-text-sec">
                    {activeCopy.subtitle}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {activeCopy.highlights.map(highlight => (
                      <li
                        key={highlight}
                        className="flex items-start gap-2.5 text-sm leading-6 text-arena-text"
                      >
                        <CheckCircle2 className="mt-1 size-4 shrink-0 text-arena-primary" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7 space-y-4 border-t border-arena-border pt-5">
                  <div className="flex items-baseline justify-between gap-4 rounded-xl border border-arena-border bg-arena-bg/70 px-4 py-3">
                    <span className="text-[11px] font-bold tracking-wider text-arena-text-muted uppercase">
                      {activeCopy.outcomeLabel}
                    </span>
                    <span className="font-sora text-lg font-extrabold text-arena-primary tabular-nums">
                      {activeCopy.outcomeValue}
                    </span>
                  </div>

                  <Link
                    href={activeCopy.ctaHref}
                    className="press inline-flex min-h-11 items-center gap-2 rounded-full bg-arena-primary px-5 py-2.5 text-xs font-extrabold tracking-wider text-[#0B0F14] uppercase shadow-[0_0_24px_rgba(124,255,79,0.28)] transition-colors hover:bg-arena-primary/90"
                  >
                    {activeCopy.ctaLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SectionShell>
  );
}
