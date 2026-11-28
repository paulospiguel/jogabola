"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  Pause,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { type KeyboardEvent, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  type EvolutionNodeId,
  getDefaultNodeForStage,
  getStageTelemetry,
  STAGE_UNLOCK_NODES,
} from "./club-evolution-data";
import { ClubEvolutionMap } from "./club-evolution-map";
import { SectionHeading, SectionShell } from "./section-shell";

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

const AUTO_STEP_MS = 4500;

export function EvolutionSection() {
  const t = useTranslations("homePage.evolution");
  const stages = t.raw("stages") as EvolutionStage[];
  const [activeStage, setActiveStage] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState<EvolutionNodeId>(() =>
    getDefaultNodeForStage(0),
  );
  const [hoveredNodeId, setHoveredNodeId] = useState<EvolutionNodeId | null>(
    null,
  );
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
      if (event.matches) setIsAutoPlaying(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || prefersReducedMotion) return;
    const timer = window.setInterval(() => {
      const next = (activeStage + 1) % stages.length;
      setActiveStage(next);
      setSelectedNodeId(getDefaultNodeForStage(next));
    }, AUTO_STEP_MS);
    return () => window.clearInterval(timer);
  }, [activeStage, isAutoPlaying, prefersReducedMotion, stages.length]);

  const current = stages[activeStage] ?? stages[0];
  const progressPercent = ((activeStage + 1) / stages.length) * 100;
  const telemetry = getStageTelemetry(activeStage);
  const unlockNodeIds =
    STAGE_UNLOCK_NODES[activeStage] ?? STAGE_UNLOCK_NODES[0];

  const handleSelectStage = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), stages.length - 1);
    setIsAutoPlaying(false);
    setActiveStage(clamped);
    setSelectedNodeId(getDefaultNodeForStage(clamped));
  };

  const handleSelectNode = (nodeId: EvolutionNodeId) => {
    setIsAutoPlaying(false);
    setSelectedNodeId(nodeId);
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      handleSelectStage((index + 1) % stages.length);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      handleSelectStage((index - 1 + stages.length) % stages.length);
    }
  };

  return (
    <SectionShell id="evolucao" number="03" label={t("kicker")}>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-6">
        <SectionHeading>
          {t("titlePrefix")}{" "}
          <span className="text-arena-primary">{t("titleAccent")}</span>
        </SectionHeading>
        <p className="max-w-xl text-sm leading-6 text-arena-text-sec sm:text-base sm:leading-7">
          {t("subtitle")}
        </p>
      </div>

      {/* Animated Progression Rail */}
      <div className="mt-8 sm:mt-10">
        <div className="relative mb-4 h-1.5 w-full overflow-hidden rounded-full bg-arena-surface sm:mb-5">
          <motion.div
            className="h-full w-full origin-left rounded-full bg-linear-to-r from-arena-primary via-arena-info to-arena-highlight"
            animate={{ scaleX: progressPercent / 100 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.45,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>

        <div
          role="tablist"
          aria-label={t("stagesAriaLabel")}
          className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4"
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
                onClick={() => handleSelectStage(index)}
                onKeyDown={event => handleTabKeyDown(event, index)}
                className={cn(
                  "press relative flex min-h-[76px] min-w-0 flex-col justify-between rounded-2xl border p-3 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-primary sm:p-4",
                  isSelected
                    ? "border-arena-primary bg-arena-surface-el shadow-[0_0_24px_rgba(124,255,79,0.16)]"
                    : isCompleted
                      ? "border-arena-primary/30 bg-arena-surface/85 hover:border-arena-primary/50"
                      : "border-arena-border bg-arena-surface/55 hover:border-arena-primary/35",
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 font-sora text-[10px] font-extrabold tracking-widest uppercase sm:text-xs",
                      isSelected
                        ? "text-arena-primary"
                        : isCompleted
                          ? "text-arena-text-sec"
                          : "text-arena-text-muted",
                    )}
                  >
                    {isCompleted && (
                      <CheckCircle2 className="size-3 shrink-0 text-arena-primary sm:size-3.5" />
                    )}
                    <span>{stage.step}</span>
                    <span className="hidden sm:inline">
                      · {stage.timeframe}
                    </span>
                  </span>
                  <span className="hidden rounded-md border border-arena-border bg-arena-bg/80 px-2 py-0.5 text-[10px] font-bold text-arena-text-sec sm:inline-block">
                    {stage.tierBadge}
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="font-sora text-xs leading-snug font-extrabold text-arena-text sm:text-base">
                    {stage.title}
                  </h3>
                  <p className="mt-0.5 text-[10px] font-semibold text-arena-text-muted sm:hidden">
                    {stage.timeframe} · {stage.tierBadge}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Architectural Blueprint + Club Telemetry Panel */}
      <div className="relative mt-6 overflow-hidden rounded-[20px] border border-arena-border bg-arena-bg sm:mt-8 sm:rounded-[24px]">
        {/* Blueprint Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-arena-border bg-arena-bg-sec/80 px-3.5 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-arena-primary/35 bg-arena-primary/10 px-2.5 py-1 text-[10px] font-extrabold tracking-[0.12em] text-arena-primary uppercase sm:gap-2 sm:px-3 sm:tracking-[0.14em]">
              <Layers className="size-3.5" />
              {t("orbitLabel")}
            </span>
            <span className="hidden truncate text-xs font-semibold text-arena-text-sec sm:inline">
              {current.step} · {current.title}
            </span>
          </div>

          <div className="flex w-full items-center justify-between gap-1.5 sm:w-auto sm:justify-end">
            {!prefersReducedMotion && (
              <button
                type="button"
                onClick={() => setIsAutoPlaying(prev => !prev)}
                aria-pressed={isAutoPlaying}
                className={cn(
                  "press inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-colors sm:min-h-9 sm:px-3",
                  isAutoPlaying
                    ? "border-arena-primary/50 bg-arena-primary/15 text-arena-primary"
                    : "border-arena-border bg-arena-surface text-arena-text-sec hover:border-arena-primary/40 hover:text-arena-text",
                )}
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="size-3.5" />
                    {t("map.controls.pause")}
                  </>
                ) : (
                  <>
                    <Play className="size-3.5" />
                    {t("map.controls.autoPlay")}
                  </>
                )}
              </button>
            )}

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectStage(activeStage - 1)}
                disabled={activeStage === 0}
                aria-label={t("map.controls.previousStage")}
                className="press inline-flex size-11 items-center justify-center rounded-full border border-arena-border bg-arena-surface text-arena-text-sec transition-colors hover:border-arena-primary/40 hover:text-arena-text disabled:cursor-not-allowed disabled:opacity-35 sm:size-9"
              >
                <ChevronLeft className="size-4" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectStage(activeStage + 1)}
                disabled={activeStage === stages.length - 1}
                aria-label={t("map.controls.nextStage")}
                className="press inline-flex size-11 items-center justify-center rounded-full border border-arena-border bg-arena-surface text-arena-text-sec transition-colors hover:border-arena-primary/40 hover:text-arena-text disabled:cursor-not-allowed disabled:opacity-35 sm:size-9"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-12">
          {/* Left: Interactive Layered Club Structure Map */}
          <ClubEvolutionMap
            activeStage={activeStage}
            selectedNodeId={selectedNodeId}
            hoveredNodeId={hoveredNodeId}
            prefersReducedMotion={prefersReducedMotion}
            onSelectNode={handleSelectNode}
            onHoverNode={setHoveredNodeId}
            onSelectStage={handleSelectStage}
          />

          {/* Right: Live Telemetry + Active Stage Breakdown */}
          <div className="flex min-w-0 flex-col justify-between bg-arena-bg-sec/35 p-4 sm:p-6 xl:col-span-5 xl:p-7">
            <div>
              {/* Live Club Capacity Telemetry Strip */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-2">
                <div className="min-w-0 rounded-xl border border-arena-border bg-arena-surface/80 p-3">
                  <p className="text-[10px] font-bold tracking-wider text-arena-text-muted uppercase">
                    {t("map.telemetry.teams")}
                  </p>
                  <p className="mt-1 font-sora text-base font-extrabold text-arena-text tabular-nums sm:text-lg">
                    {activeStage === 3
                      ? t("map.telemetry.teamsScale", {
                          count: telemetry.maxTeams,
                        })
                      : t("map.telemetry.teamsUpTo", {
                          count: telemetry.maxTeams,
                        })}
                  </p>
                </div>

                <div className="min-w-0 rounded-xl border border-arena-border bg-arena-surface/80 p-3">
                  <p className="text-[10px] font-bold tracking-wider text-arena-text-muted uppercase">
                    {t("map.telemetry.athletes")}
                  </p>
                  <p className="mt-1 font-sora text-base font-extrabold text-arena-text tabular-nums sm:text-lg">
                    {activeStage === 3
                      ? t("map.telemetry.athletesScale", {
                          count: telemetry.maxPlayersPerTeam,
                        })
                      : t("map.telemetry.athletesPerTeam", {
                          count: telemetry.maxPlayersPerTeam,
                        })}
                  </p>
                </div>

                <div className="min-w-0 rounded-xl border border-arena-border bg-arena-surface/80 p-3">
                  <p className="text-[10px] font-bold tracking-wider text-arena-text-muted uppercase">
                    {t("map.telemetry.aiWorkflow")}
                  </p>
                  <p className="mt-1 font-sora text-xs leading-snug font-extrabold text-arena-info sm:text-sm">
                    {t(`map.telemetry.aiModes.${telemetry.aiModeKey}`)}
                  </p>
                </div>

                <div className="min-w-0 rounded-xl border border-arena-primary/25 bg-arena-primary/8 p-3">
                  <p className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-arena-primary uppercase">
                    <ShieldCheck className="size-3 shrink-0" />
                    <span className="truncate">
                      {t("map.telemetry.humanControl")}
                    </span>
                  </p>
                  <p className="mt-1 font-sora text-base font-extrabold text-arena-primary tabular-nums sm:text-lg">
                    {telemetry.humanControlPercent}%
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.step}
                  initial={prefersReducedMotion ? false : { opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={
                    prefersReducedMotion ? undefined : { opacity: 0, x: -10 }
                  }
                  transition={{ duration: 0.22 }}
                  className="mt-5 sm:mt-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-arena-primary/35 bg-arena-primary/12 px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-arena-primary uppercase">
                        {current.step} · {current.timeframe}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-arena-info/35 bg-arena-info/12 px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-arena-info uppercase">
                        <Sparkles className="size-3" />
                        {current.tierBadge}
                      </span>
                    </div>

                    <span className="font-sora text-xs font-extrabold text-arena-primary tabular-nums">
                      {current.metricValue}
                    </span>
                  </div>

                  <h3 className="mt-4 font-sora text-xl font-extrabold text-arena-text sm:text-2xl">
                    {current.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-arena-text-sec">
                    {current.description}
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
                    {current.unlocks.map((item, idx) => {
                      const linkedNodeId = unlockNodeIds[idx] ?? selectedNodeId;
                      const isLinkedSelected = selectedNodeId === linkedNodeId;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleSelectNode(linkedNodeId)}
                          onMouseEnter={() => setHoveredNodeId(linkedNodeId)}
                          onMouseLeave={() => setHoveredNodeId(null)}
                          className={cn(
                            "press flex min-h-11 w-full items-start gap-2.5 rounded-xl border p-3 text-left text-xs leading-5 transition-colors",
                            isLinkedSelected
                              ? "border-arena-primary/45 bg-arena-surface-el text-arena-text"
                              : "border-arena-border bg-arena-surface/75 text-arena-text-sec hover:border-arena-primary/35 hover:text-arena-text",
                          )}
                        >
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-arena-primary" />
                          <span>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex flex-col gap-3 border-t border-arena-border pt-5">
              <p className="text-xs leading-5 font-medium text-arena-text-muted">
                {t("historyPreservedNote")}
              </p>

              <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-[10px] font-bold tracking-widest text-arena-text-muted uppercase">
                  {current.metricLabel}:{" "}
                  <strong className="text-arena-text-sec">
                    {current.metricValue}
                  </strong>
                </span>

                {activeStage < stages.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => handleSelectStage(activeStage + 1)}
                    className="press inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-arena-primary/40 bg-arena-primary/12 px-5 py-2 text-xs font-extrabold tracking-wider text-arena-primary uppercase hover:bg-arena-primary/20 sm:w-auto"
                  >
                    {t("nextStageCta")}
                    <ArrowRight className="size-4" />
                  </button>
                ) : (
                  <a
                    href="#planos"
                    className="press inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-arena-primary px-5 py-2 text-xs font-extrabold tracking-wider text-arena-bg uppercase hover:bg-arena-primary/90 sm:w-auto"
                  >
                    {t("comparePlansCta")}
                    <ArrowRight className="size-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
