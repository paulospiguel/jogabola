"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  User,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SectionHeading, SectionShell } from "./section-shell";

type ClubProfileId = "solo" | "weekly" | "district";

interface ProfileData {
  tabLabel: string;
  badge: string;
  headline: string;
  summary: string;
  recommendedTier: string;
  beforeTitle: string;
  beforeItems: string[];
  afterTitle: string;
  afterItems: string[];
  metrics: {
    value: string;
    label: string;
  }[];
}

const PROFILE_TABS: readonly {
  id: ClubProfileId;
  icon: typeof User;
}[] = [
  { id: "solo", icon: User },
  { id: "weekly", icon: Users },
  { id: "district", icon: Building2 },
] as const;

export function ImpactSection() {
  const t = useTranslations("homePage.impact");
  const [selectedProfile, setSelectedProfile] = useState<ClubProfileId>("solo");
  const profiles = t.raw("profiles") as Record<ClubProfileId, ProfileData>;
  const active = profiles[selectedProfile];

  return (
    <SectionShell id="impacto" number="01" label={t("kicker")}>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <SectionHeading>
          {t("titlePrefix")}{" "}
          <span className="text-arena-primary">{t("titleAccent")}</span>
        </SectionHeading>
        <p className="max-w-xl text-base leading-7 text-arena-text-sec">
          {t("subtitle")}
        </p>
      </div>

      {/* Interactive Club Archetype Selector */}
      <div
        role="tablist"
        aria-label={t("selectorAriaLabel")}
        className="mt-10 flex flex-wrap gap-2.5"
      >
        {PROFILE_TABS.map(({ id, icon: Icon }) => {
          const isSelected = selectedProfile === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setSelectedProfile(id)}
              className={cn(
                "press relative flex min-h-11 items-center gap-2.5 rounded-full border px-5 py-2.5 text-sm font-bold transition-colors",
                isSelected
                  ? "border-arena-primary text-[#0B0F14]"
                  : "border-arena-border bg-arena-surface/70 text-arena-text-sec hover:border-arena-primary/40 hover:text-arena-text",
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId="impact-profile-pill"
                  transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  className="absolute inset-0 rounded-full bg-arena-primary"
                />
              )}
              <Icon className="relative z-10 size-4 shrink-0" />
              <span className="relative z-10">{profiles[id].tabLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Animated Profile Impact Canvas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedProfile}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 grid gap-6 lg:grid-cols-12"
        >
          {/* Left summary + KPIs */}
          <div className="flex flex-col justify-between rounded-[20px] border border-arena-border bg-arena-surface/90 p-6 md:p-8 lg:col-span-5">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="rounded-full border border-arena-info/35 bg-arena-info/12 px-3 py-1 text-[10px] font-extrabold tracking-widest text-arena-info uppercase">
                  {active.badge}
                </span>
                <span className="rounded-full border border-arena-primary/30 bg-arena-primary/10 px-3 py-1 text-[10px] font-extrabold tracking-wider text-arena-primary uppercase">
                  {active.recommendedTier}
                </span>
              </div>

              <h3 className="mt-5 font-sora text-2xl leading-tight font-extrabold text-arena-text md:text-3xl">
                {active.headline}
              </h3>
              <p className="mt-3 text-sm leading-6 text-arena-text-sec md:text-base md:leading-7">
                {active.summary}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-2.5 border-t border-arena-border pt-6">
              {active.metrics.map(metric => (
                <div
                  key={metric.label}
                  className="rounded-xl border border-arena-border bg-arena-bg/70 p-3"
                >
                  <div className="font-sora text-xl font-extrabold text-arena-primary tabular-nums md:text-2xl">
                    {metric.value}
                  </div>
                  <div className="mt-1 text-[10px] leading-tight font-bold tracking-wide text-arena-text-muted uppercase">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Before vs After Comparison */}
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-7">
            <article className="flex flex-col rounded-[20px] border border-arena-danger/25 bg-arena-surface/70 p-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-arena-danger/35 bg-arena-danger/12 px-3 py-1 text-[10px] font-extrabold tracking-widest text-arena-danger uppercase">
                <XCircle className="size-3.5" />
                {active.beforeTitle}
              </div>
              <ul className="mt-5 space-y-3.5">
                {active.beforeItems.map(item => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-6 text-arena-text-sec"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-arena-danger/70" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="flex flex-col justify-between rounded-[20px] border border-arena-primary/35 bg-linear-to-b from-arena-primary/10 to-arena-surface/95 p-6">
              <div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-arena-primary/40 bg-arena-primary/15 px-3 py-1 text-[10px] font-extrabold tracking-widest text-arena-primary uppercase">
                  <CheckCircle2 className="size-3.5" />
                  {active.afterTitle}
                </div>
                <ul className="mt-5 space-y-3.5">
                  {active.afterItems.map(item => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm leading-6 text-arena-text"
                    >
                      <CheckCircle2 className="mt-1 size-4 shrink-0 text-arena-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/auth"
                className="press mt-6 inline-flex items-center gap-2 text-xs font-extrabold tracking-wider text-arena-primary uppercase hover:underline"
              >
                {t("startCta")}
                <ArrowRight className="size-4" />
              </Link>
            </article>
          </div>
        </motion.div>
      </AnimatePresence>
    </SectionShell>
  );
}
