"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Crown,
  Flame,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PLAN_LIMITS,
  PLAN_ORDER,
  PLAN_PRICING,
  type PlanTier,
} from "@/constants/plans";
import { cn } from "@/lib/utils";
import { SectionHeading, SectionShell } from "./section-shell";

type BillingCycle = "monthly" | "annual";

const PLAN_ICONS: Record<PlanTier, typeof Zap> = {
  free: Zap,
  basic: Shield,
  amateur: Flame,
  pro: Sparkles,
  champion: Crown,
};

function formatPriceEur(value: number): string {
  if (value === 0) return "0€";
  return `${value.toFixed(2).replace(".", ",")}€`;
}

function formatLimit(value: number): string {
  return value >= 999 ? "∞" : String(value);
}

interface PlansSectionProps {
  standalone?: boolean;
}

export function PlansSection({ standalone = false }: PlansSectionProps) {
  const t = useTranslations("pricingPage");
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  const corePlans = PLAN_ORDER.filter(plan => plan !== "champion");
  const championFeatures = t.raw("plans.champion.features") as string[];

  const content = (
    <>
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          {standalone ? (
            <>
              <p className="mb-3 text-xs font-extrabold tracking-[0.2em] text-arena-primary uppercase">
                {t("eyebrow")}
              </p>
              <h1 className="max-w-4xl font-sora text-4xl leading-[1.02] font-extrabold tracking-tight text-arena-text sm:text-5xl lg:text-6xl">
                {t("title")}
              </h1>
            </>
          ) : (
            <SectionHeading>
              {t("homeTitlePrefix")}{" "}
              <span className="text-arena-primary">{t("homeTitleAccent")}</span>
            </SectionHeading>
          )}
          <p className="mt-4 max-w-2xl text-base leading-7 text-arena-text-sec">
            {t("subtitle")}
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex w-fit items-center gap-1 rounded-full border border-arena-border bg-arena-surface p-1">
          {(["monthly", "annual"] as const).map(cycle => {
            const active = billing === cycle;
            return (
              <button
                key={cycle}
                type="button"
                onClick={() => setBilling(cycle)}
                className={cn(
                  "press relative flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold transition-colors",
                  active
                    ? "text-[#0B0F14]"
                    : "text-arena-text-sec hover:text-arena-text",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="pricing-billing-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-arena-primary"
                  />
                )}
                <span className="relative z-10">{t(`billing.${cycle}`)}</span>
                {cycle === "annual" && (
                  <span
                    className={cn(
                      "relative z-10 rounded-full px-2 py-0.5 text-[10px] font-extrabold",
                      active
                        ? "bg-[#0B0F14]/15 text-[#0B0F14]"
                        : "bg-arena-primary/15 text-arena-primary",
                    )}
                  >
                    -20%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Self-Serve Progressive Tiers: Grátis · Básico · Amador · Profissional */}
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {corePlans.map((plan, index) => {
          const Icon = PLAN_ICONS[plan];
          const limits = PLAN_LIMITS[plan];
          const pricing = PLAN_PRICING[plan];
          const featured = Boolean(pricing.isFeatured);
          const features = t.raw(`plans.${plan}.features`) as string[];
          const numericPrice =
            billing === "annual"
              ? (pricing.annualMonthlyEur ?? 0)
              : (pricing.monthlyEur ?? 0);
          const displayPrice = formatPriceEur(numericPrice);
          const ctaHref = plan === "free" ? "/auth" : `/waitlist?plan=${plan}`;

          return (
            <motion.article
              key={plan}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className={cn(
                "relative flex flex-col rounded-[22px] border p-6 transition-all",
                featured
                  ? "border-arena-primary/55 bg-linear-to-b from-arena-primary/12 via-arena-surface to-arena-surface shadow-[0_0_40px_rgba(124,255,79,0.12)]"
                  : "border-arena-border bg-arena-surface/85 hover:border-arena-primary/35",
              )}
            >
              {featured && (
                <div className="absolute -top-3.5 left-6 rounded-full border border-arena-primary/40 bg-arena-primary px-3.5 py-1 text-[10px] font-extrabold tracking-widest text-[#0B0F14] uppercase">
                  {t("recommended")}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl border",
                    featured
                      ? "border-arena-primary/40 bg-arena-primary/15 text-arena-primary"
                      : "border-arena-border bg-arena-bg text-arena-primary",
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <span className="rounded-full border border-arena-border bg-arena-bg/80 px-2.5 py-1 text-[10px] font-extrabold tracking-wider text-arena-text-sec uppercase">
                  {t(`plans.${plan}.badge`)}
                </span>
              </div>

              <div className="mt-5">
                <h3 className="font-sora text-2xl font-extrabold text-arena-text">
                  {t(`plans.${plan}.name`)}
                </h3>
                <p className="mt-2 min-h-[60px] text-xs leading-5 text-arena-text-sec">
                  {t(`plans.${plan}.description`)}
                </p>
              </div>

              <div className="mt-5 flex items-baseline gap-1.5 border-y border-arena-border/80 py-4">
                <span className="font-sora text-4xl leading-none font-extrabold text-arena-text tabular-nums">
                  {displayPrice}
                </span>
                <span className="text-xs font-semibold text-arena-text-muted">
                  {t(`plans.${plan}.period`)}
                </span>
              </div>

              {/* Compact operational limits */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <LimitTile
                  label={t("limits.teams")}
                  value={formatLimit(limits.maxTeams)}
                />
                <LimitTile
                  label={t("limits.players")}
                  value={formatLimit(limits.maxPlayersPerTeam)}
                />
                <LimitTile
                  label={t("limits.events")}
                  value={formatLimit(limits.maxEventsPerMonth)}
                />
              </div>

              {limits.includesVirtualStaff && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-arena-info/30 bg-arena-info/10 px-3 py-2 text-[11px] font-bold text-arena-info">
                  <Bot className="size-4 shrink-0" />
                  <span>{t(`plans.${plan}.aiSummary`)}</span>
                </div>
              )}

              <ul className="mt-5 mb-7 flex-1 space-y-2.5">
                {features.map(feature => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-arena-primary" />
                    <span className="text-xs leading-5 text-arena-text-sec">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  "press h-12 w-full rounded-full text-sm font-extrabold",
                  featured || plan === "free"
                    ? "bg-arena-primary text-[#0B0F14] hover:bg-arena-primary/90"
                    : "border border-arena-border bg-arena-bg text-arena-text hover:border-arena-primary/45 hover:bg-arena-surface-el",
                )}
              >
                <Link href={ctaHref}>
                  {t(`plans.${plan}.cta`)}
                  <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            </motion.article>
          );
        })}
      </div>

      {/* 5th Tier — Campeão (Exclusive Custom Contact Tier) */}
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
        className="relative mt-6 overflow-hidden rounded-[24px] border border-arena-highlight/45 bg-linear-to-r from-arena-highlight/12 via-arena-surface to-arena-surface p-6 md:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-12 size-64 rounded-full bg-arena-highlight/15 blur-[80px]"
        />

        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-arena-highlight/40 bg-arena-highlight/15 px-3.5 py-1 text-[10px] font-extrabold tracking-widest text-arena-highlight uppercase">
              <Crown className="size-3.5" />
              {t("plans.champion.badge")}
            </div>
            <h3 className="mt-4 font-sora text-3xl font-extrabold text-arena-text md:text-4xl">
              {t("plans.champion.name")}
            </h3>
            <p className="mt-3 text-sm leading-6 text-arena-text-sec">
              {t("plans.champion.description")}
            </p>
            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-sora text-2xl font-extrabold text-arena-highlight md:text-3xl">
                {t("plans.champion.price")}
              </span>
              <span className="text-xs font-semibold text-arena-text-muted">
                {t("plans.champion.period")}
              </span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5">
            {championFeatures.map(feature => (
              <div
                key={feature}
                className="flex items-start gap-2.5 rounded-xl border border-arena-border bg-arena-bg/75 p-3 text-xs leading-5 text-arena-text"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-arena-highlight" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 lg:col-span-2">
            <Button
              asChild
              className="press h-13 w-full rounded-full bg-arena-highlight px-5 text-sm font-extrabold text-[#0B0F14] shadow-[0_0_28px_rgba(250,204,21,0.3)] hover:bg-arena-highlight/90"
            >
              <Link href="/contact?plan=champion">
                {t("plans.champion.cta")}
                <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
            <p className="text-center text-[11px] font-medium text-arena-text-muted">
              {t("plans.champion.responseHint")}
            </p>
          </div>
        </div>
      </motion.article>

      {/* Transparent Beta & Migration Guarantee */}
      <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-arena-border bg-arena-surface/65 p-5 md:flex-row md:items-center md:px-7">
        <div>
          <h4 className="font-sora text-base font-extrabold text-arena-text">
            {t("note.title")}
          </h4>
          <p className="mt-1 text-xs leading-5 text-arena-text-sec md:text-sm">
            {t("note.description")}
          </p>
        </div>
        <Link
          href="/contact"
          className="press inline-flex shrink-0 items-center gap-1.5 text-xs font-extrabold tracking-wider text-arena-primary uppercase hover:underline"
        >
          {t("note.cta")}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </>
  );

  if (standalone) {
    return (
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-24 md:px-10">
        {content}
      </div>
    );
  }

  return (
    <SectionShell id="planos" number="04" label={t("eyebrow")}>
      {content}
    </SectionShell>
  );
}

function LimitTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-arena-border bg-arena-bg/75 p-2.5 text-center">
      <div className="font-sora text-base font-extrabold text-arena-text tabular-nums">
        {value}
      </div>
      <div className="mt-0.5 text-[9px] font-bold tracking-wider text-arena-text-muted uppercase">
        {label}
      </div>
    </div>
  );
}
