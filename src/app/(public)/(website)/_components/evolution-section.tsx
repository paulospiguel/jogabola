"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Layers, Sparkles } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SectionHeading, SectionShell } from "./section-shell";

const EvolutionOrbitCanvas = dynamic(
  () =>
    import("./three/evolution-orbit-canvas").then(
      mod => mod.EvolutionOrbitCanvas,
    ),
  { ssr: false },
);

interface EvolutionStage {
  step: string;
  timeframe: string;
  title: string;
  tierBadge: string;
  description: string;
  unlocks: string[];
  metricLabel: string;
  metricValue: string;
}

export function EvolutionSection() {
  const t = useTranslations("homePage.evolution");
  const stages = t.raw("stages") as EvolutionStage[];
  const [activeStage, setActiveStage] = useState(0);
  const current = stages[activeStage] ?? stages[0];
  const progressPercent = ((activeStage + 1) / stages.length) * 100;

  return (
    <SectionShell id="evolucao" number="03" label={t("kicker")}>
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <SectionHeading>
          {t("titlePrefix")}{" "}
          <span className="text-arena-primary">{t("titleAccent")}</span>
        </SectionHeading>
        <p className="max-w-xl text-base leading-7 text-arena-text-sec">
          {t("subtitle")}
        </p>
      </div>

      {/* Animated Progression Rail */}
      <div className="mt-10">
        <div className="relative mb-6 h-1.5 w-full overflow-hidden rounded-full bg-arena-surface">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-arena-primary via-arena-info to-arena-highlight"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <div
          role="tablist"
          aria-label={t("stagesAriaLabel")}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stages.map((stage, index) => {
            const isSelected = index === activeStage;
            const isCompleted = index < activeStage;
            return (
              <button
                key={stage.step}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveStage(index)}
                className={cn(
                  "press relative rounded-2xl border p-4 text-left transition-all",
                  isSelected
                    ? "border-arena-primary bg-arena-surface-el shadow-[0_0_24px_rgba(124,255,79,0.16)]"
                    : isCompleted
                      ? "border-arena-primary/30 bg-arena-surface/85"
                      : "border-arena-border bg-arena-surface/55 hover:border-arena-primary/35",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "font-sora text-xs font-extrabold tracking-widest uppercase",
                      isSelected
                        ? "text-arena-primary"
                        : "text-arena-text-muted",
                    )}
                  >
                    {stage.step} · {stage.timeframe}
                  </span>
                  <span className="rounded-md border border-arena-border bg-arena-bg/80 px-2 py-0.5 text-[10px] font-bold text-arena-text-sec">
                    {stage.tierBadge}
                  </span>
                </div>
                <h3 className="mt-2.5 font-sora text-base font-extrabold text-arena-text">
                  {stage.title}
                </h3>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive 3D Orbit + Stage Deep Dive */}
      <div className="relative mt-8 grid overflow-hidden rounded-[24px] border border-arena-border bg-[#080C12] lg:grid-cols-12">
        {/* Left: Three.js Evolving Club Network */}
        <div className="relative min-h-[290px] border-b border-arena-border lg:col-span-5 lg:min-h-[400px] lg:border-r lg:border-b-0">
          <EvolutionOrbitCanvas activeStage={activeStage} />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,#080C12_95%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between p-6">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-arena-primary/35 bg-arena-bg/80 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-arena-primary uppercase backdrop-blur-md">
              <Layers className="size-3.5" />
              {t("orbitLabel")}
            </span>

            <div className="rounded-2xl border border-arena-border bg-arena-bg/85 p-4 backdrop-blur-md">
              <p className="text-[10px] font-extrabold tracking-widest text-arena-text-muted uppercase">
                {current.metricLabel}
              </p>
              <p className="mt-1 font-sora text-2xl font-extrabold text-arena-primary tabular-nums">
                {current.metricValue}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Active Stage Details */}
        <div className="flex flex-col justify-between p-6 md:p-9 lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.step}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full border border-arena-primary/35 bg-arena-primary/12 px-3 py-1 text-[10px] font-extrabold tracking-widest text-arena-primary uppercase">
                  {current.step} · {current.timeframe}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-arena-info/35 bg-arena-info/12 px-3 py-1 text-[10px] font-extrabold tracking-widest text-arena-info uppercase">
                  <Sparkles className="size-3" />
                  {current.tierBadge}
                </span>
              </div>

              <h3 className="mt-5 font-sora text-2xl font-extrabold text-arena-text md:text-4xl">
                {current.title}
              </h3>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-arena-text-sec md:text-base">
                {current.description}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {current.unlocks.map(item => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5 rounded-xl border border-arena-border bg-arena-surface/75 p-3.5 text-sm text-arena-text"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-arena-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-arena-border pt-6">
            <p className="text-xs font-medium text-arena-text-muted">
              {t("historyPreservedNote")}
            </p>
            <div className="flex items-center gap-2">
              {activeStage < stages.length - 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setActiveStage(prev =>
                      Math.min(prev + 1, stages.length - 1),
                    )
                  }
                  className="press inline-flex min-h-11 items-center gap-2 rounded-full border border-arena-primary/40 bg-arena-primary/12 px-5 py-2 text-xs font-extrabold tracking-wider text-arena-primary uppercase hover:bg-arena-primary/20"
                >
                  {t("nextStageCta")}
                  <ArrowRight className="size-4" />
                </button>
              ) : (
                <a
                  href="#planos"
                  className="press inline-flex min-h-11 items-center gap-2 rounded-full bg-arena-primary px-5 py-2 text-xs font-extrabold tracking-wider text-[#0B0F14] uppercase hover:bg-arena-primary/90"
                >
                  {t("comparePlansCta")}
                  <ArrowRight className="size-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
