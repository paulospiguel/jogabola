"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Bot,
  CalendarCheck,
  Check,
  Layers,
  Lock,
  MessageSquareText,
  Receipt,
  ShieldCheck,
  Trophy,
  UserCog,
  Users,
  Wallet,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import { ClubEvolutionConnectors } from "./club-evolution-connectors";
import {
  EVOLUTION_LAYERS,
  type EvolutionAccent,
  type EvolutionNodeId,
  type EvolutionNodeSpec,
  getNodeById,
  getNodeConnections,
} from "./club-evolution-data";

interface ClubEvolutionMapProps {
  activeStage: number;
  selectedNodeId: EvolutionNodeId;
  hoveredNodeId: EvolutionNodeId | null;
  prefersReducedMotion: boolean;
  onSelectNode: (nodeId: EvolutionNodeId) => void;
  onHoverNode: (nodeId: EvolutionNodeId | null) => void;
  onSelectStage: (stageIndex: number) => void;
}

const NODE_ICONS: Record<EvolutionNodeSpec["icon"], typeof Users> = {
  users: Users,
  calendarCheck: CalendarCheck,
  wallet: Wallet,
  receipt: Receipt,
  messageSquare: MessageSquareText,
  barChart: BarChart3,
  layers: Layers,
  trophy: Trophy,
  userCog: UserCog,
  bot: Bot,
  shieldCheck: ShieldCheck,
};

const ACCENT_STYLES: Record<
  EvolutionAccent,
  {
    selectedBorder: string;
    activeBorder: string;
    iconBg: string;
    pill: string;
    dot: string;
    spineLine: string;
    spineIcon: string;
  }
> = {
  primary: {
    selectedBorder:
      "border-arena-primary bg-arena-surface-el shadow-[0_0_24px_rgba(124,255,79,0.16)]",
    activeBorder:
      "border-arena-primary/35 bg-arena-surface hover:border-arena-primary/65 hover:bg-arena-surface-el",
    iconBg: "border-arena-primary/30 bg-arena-primary/12 text-arena-primary",
    pill: "border-arena-primary/35 bg-arena-primary/12 text-arena-primary",
    dot: "bg-arena-primary",
    spineLine: "bg-arena-primary/45",
    spineIcon: "border-arena-primary/40 bg-arena-primary/12 text-arena-primary",
  },
  info: {
    selectedBorder:
      "border-arena-info bg-arena-surface-el shadow-[0_0_24px_rgba(56,189,248,0.16)]",
    activeBorder:
      "border-arena-info/35 bg-arena-surface hover:border-arena-info/65 hover:bg-arena-surface-el",
    iconBg: "border-arena-info/30 bg-arena-info/12 text-arena-info",
    pill: "border-arena-info/35 bg-arena-info/12 text-arena-info",
    dot: "bg-arena-info",
    spineLine: "bg-arena-info/45",
    spineIcon: "border-arena-info/40 bg-arena-info/12 text-arena-info",
  },
  highlight: {
    selectedBorder:
      "border-arena-highlight bg-arena-surface-el shadow-[0_0_24px_rgba(250,204,21,0.16)]",
    activeBorder:
      "border-arena-highlight/35 bg-arena-surface hover:border-arena-highlight/65 hover:bg-arena-surface-el",
    iconBg:
      "border-arena-highlight/30 bg-arena-highlight/12 text-arena-highlight",
    pill: "border-arena-highlight/35 bg-arena-highlight/12 text-arena-highlight",
    dot: "bg-arena-highlight",
    spineLine: "bg-arena-highlight/45",
    spineIcon:
      "border-arena-highlight/40 bg-arena-highlight/12 text-arena-highlight",
  },
};

export function ClubEvolutionMap({
  activeStage,
  selectedNodeId,
  hoveredNodeId,
  prefersReducedMotion,
  onSelectNode,
  onHoverNode,
  onSelectStage,
}: ClubEvolutionMapProps) {
  const t = useTranslations("homePage.evolution.map");
  const topologyRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<
    Partial<Record<EvolutionNodeId, HTMLButtonElement | null>>
  >({});

  const focusNodeId = hoveredNodeId ?? selectedNodeId;
  const focusConnections = getNodeConnections(focusNodeId);
  const selectedSpec = getNodeById(selectedNodeId);
  const selectedConnections = getNodeConnections(selectedNodeId);
  const SelectedIcon = NODE_ICONS[selectedSpec.icon];
  const selectedAccent = ACCENT_STYLES[selectedSpec.accent];

  const handleNodeActivate = (node: EvolutionNodeSpec) => {
    if (node.stageIndex > activeStage) {
      onSelectStage(node.stageIndex);
    }
    onSelectNode(node.id);
  };

  return (
    <div className="relative flex min-w-0 flex-col justify-between overflow-hidden border-b border-arena-border bg-arena-bg xl:col-span-7 xl:border-r xl:border-b-0">
      {/* Subtle Architectural Blueprint Grid + Tactical Pitch Watermark */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-55"
      >
        <defs>
          <pattern
            id="club-blueprint-grid"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 28 0 L 0 0 0 28"
              fill="none"
              className="stroke-arena-border/35"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#club-blueprint-grid)" />
        <g className="stroke-arena-border/25" fill="none" strokeWidth="1">
          <line x1="0" y1="50%" x2="100%" y2="50%" />
          <circle cx="50%" cy="50%" r="88" />
          <circle cx="50%" cy="50%" r="3" className="fill-arena-border/30" />
        </g>
      </svg>

      {/* Interactive Layered Club Topology */}
      <div className="relative z-10 p-3.5 sm:p-6">
        <div ref={topologyRef} className="relative space-y-2 sm:space-y-7">
          <ClubEvolutionConnectors
            containerRef={topologyRef}
            nodeRefs={nodeRefs}
            activeStage={activeStage}
            highlightedEdgeIds={focusConnections.edgeIds}
            prefersReducedMotion={prefersReducedMotion}
          />

          {EVOLUTION_LAYERS.map((layer, layerIdx) => {
            const isCurrentLayer = layer.stageIndex === activeStage;
            const isConsolidated = layer.stageIndex < activeStage;
            const isLockedLayer = layer.stageIndex > activeStage;
            const layerAccent = ACCENT_STYLES[layer.accent];
            const nextLayer = EVOLUTION_LAYERS[layerIdx + 1];
            const isNextUnlocked = nextLayer
              ? nextLayer.stageIndex <= activeStage
              : false;
            const nextAccent = nextLayer
              ? ACCENT_STYLES[nextLayer.accent]
              : null;

            return (
              <div key={layer.key} className="relative z-10">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectStage(layer.stageIndex)}
                    className={cn(
                      "press inline-flex min-h-8 items-center gap-2 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tracking-[0.14em] uppercase transition-colors sm:min-h-0",
                      isCurrentLayer
                        ? "text-arena-text"
                        : isConsolidated
                          ? "text-arena-text-sec hover:text-arena-text"
                          : "text-arena-text-muted hover:text-arena-text-sec",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        isLockedLayer ? "bg-arena-border" : layerAccent.dot,
                      )}
                    />
                    {layer.code} · {t(`layers.${layer.key}`)}
                  </button>

                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-extrabold tracking-widest uppercase",
                      isCurrentLayer
                        ? layerAccent.pill
                        : isConsolidated
                          ? "border-arena-border bg-arena-surface/80 text-arena-text-sec"
                          : "border-arena-border/70 bg-arena-bg/80 text-arena-text-muted",
                    )}
                  >
                    {isConsolidated && <Check className="size-2.5" />}
                    {isLockedLayer && <Lock className="size-2.5" />}
                    {isCurrentLayer
                      ? t("status.active")
                      : isConsolidated
                        ? t("status.consolidated")
                        : t("status.locked", { code: layer.code })}
                  </span>
                </div>

                <div
                  className={cn(
                    "grid gap-2 sm:gap-3",
                    layer.nodes.length === 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : "grid-cols-1 sm:grid-cols-3",
                  )}
                >
                  {layer.nodes.map(node => {
                    const Icon = NODE_ICONS[node.icon];
                    const isUnlocked = node.stageIndex <= activeStage;
                    const isSelected = node.id === selectedNodeId;
                    const isConnectedToFocus =
                      node.id === focusNodeId ||
                      focusConnections.upstream.includes(node.id) ||
                      focusConnections.downstream.includes(node.id);
                    const accent = ACCENT_STYLES[node.accent];

                    return (
                      <button
                        key={node.id}
                        ref={el => {
                          nodeRefs.current[node.id] = el;
                        }}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => handleNodeActivate(node)}
                        onMouseEnter={() => onHoverNode(node.id)}
                        onMouseLeave={() => onHoverNode(null)}
                        onFocus={() => onHoverNode(node.id)}
                        onBlur={() => onHoverNode(null)}
                        className={cn(
                          "press group relative flex min-h-[58px] w-full min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-primary sm:min-h-[96px] sm:flex-col sm:items-start sm:justify-between sm:gap-2.5 sm:p-3.5",
                          isUnlocked
                            ? isSelected
                              ? accent.selectedBorder
                              : accent.activeBorder
                            : "border-dashed border-arena-border/80 bg-arena-bg/75 opacity-60 hover:border-arena-text-muted hover:opacity-85",
                          !isConnectedToFocus && isUnlocked && !isSelected
                            ? "opacity-80"
                            : "",
                        )}
                      >
                        {/* Icon + desktop status row */}
                        <div className="flex shrink-0 items-center justify-between sm:w-full">
                          <span
                            className={cn(
                              "flex size-8 items-center justify-center rounded-lg border transition-colors",
                              isUnlocked
                                ? accent.iconBg
                                : "border-arena-border bg-arena-surface/50 text-arena-text-muted",
                            )}
                          >
                            <Icon className="size-4" strokeWidth={1.7} />
                          </span>

                          <span className="hidden sm:inline-flex">
                            {isUnlocked ? (
                              <span
                                className={cn(
                                  "size-2 rounded-full",
                                  accent.dot,
                                  isSelected && !prefersReducedMotion
                                    ? "animate-pulse"
                                    : "",
                                )}
                              />
                            ) : (
                              <Lock className="size-3.5 text-arena-text-muted" />
                            )}
                          </span>
                        </div>

                        {/* Title + badge */}
                        <div className="min-w-0 flex-1 sm:w-full">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={cn(
                                "font-sora text-xs leading-snug font-bold sm:text-[13px]",
                                isUnlocked
                                  ? "text-arena-text"
                                  : "text-arena-text-sec",
                              )}
                            >
                              {t(`nodes.${node.id}.title`)}
                            </span>
                            <span className="inline-flex shrink-0 sm:hidden">
                              {isUnlocked ? (
                                <span
                                  className={cn(
                                    "size-2 rounded-full",
                                    accent.dot,
                                    isSelected && !prefersReducedMotion
                                      ? "animate-pulse"
                                      : "",
                                  )}
                                />
                              ) : (
                                <Lock className="size-3.5 text-arena-text-muted" />
                              )}
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] leading-tight font-medium text-arena-text-muted">
                            {t(`nodes.${node.id}.badge`)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile vertical architectural flow connector between layers */}
                {nextLayer && nextAccent && (
                  <div
                    aria-hidden="true"
                    className="flex flex-col items-center py-1.5 sm:hidden"
                  >
                    <div
                      className={cn(
                        "h-2.5 w-px",
                        isNextUnlocked
                          ? nextAccent.spineLine
                          : "bg-arena-border/60",
                      )}
                    />
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full border",
                        isNextUnlocked
                          ? nextAccent.spineIcon
                          : "border-arena-border/70 bg-arena-bg text-arena-text-muted",
                      )}
                    >
                      <ArrowDown className="size-2.5" />
                    </span>
                    <div
                      className={cn(
                        "h-2.5 w-px",
                        isNextUnlocked
                          ? nextAccent.spineLine
                          : "bg-arena-border/60",
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inline Module Inspector Dock */}
      <div className="relative z-10 border-t border-arena-border bg-arena-bg-sec/85 px-4 py-4 backdrop-blur-md sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSpec.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="space-y-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-lg border",
                    selectedAccent.iconBg,
                  )}
                >
                  <SelectedIcon className="size-3.5" strokeWidth={1.8} />
                </span>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <span className="font-sora text-sm font-extrabold text-arena-text">
                    {t(`nodes.${selectedSpec.id}.title`)}
                  </span>
                  <span
                    className={cn(
                      "rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold tracking-widest uppercase",
                      selectedAccent.pill,
                    )}
                  >
                    {t(`layers.${selectedSpec.layerKey}`)}
                  </span>
                </div>
              </div>

              <span className="hidden text-[11px] font-medium text-arena-text-muted sm:inline">
                {t("controls.clickToExplore")}
              </span>
            </div>

            <p className="text-xs leading-5 text-arena-text-sec">
              {t(`nodes.${selectedSpec.id}.summary`)}
            </p>

            {(selectedConnections.upstream.length > 0 ||
              selectedConnections.downstream.length > 0) && (
              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1.5">
                {selectedConnections.upstream.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-arena-text-muted uppercase">
                      {t("inspector.builtOn")}
                    </span>
                    {selectedConnections.upstream.map(upId => {
                      const upSpec = getNodeById(upId);
                      return (
                        <button
                          key={upId}
                          type="button"
                          onClick={() => handleNodeActivate(upSpec)}
                          className="press min-h-8 rounded-md border border-arena-border bg-arena-surface px-2.5 py-1 text-[11px] font-semibold text-arena-text-sec transition-colors hover:border-arena-primary/45 hover:text-arena-text sm:min-h-0 sm:px-2 sm:py-0.5 sm:text-[10px]"
                        >
                          {t(`nodes.${upId}.title`)}
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedConnections.downstream.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-arena-text-muted uppercase">
                      <ArrowRight className="size-3 text-arena-primary" />
                      {t("inspector.flowsTo")}
                    </span>
                    {selectedConnections.downstream.map(downId => {
                      const downSpec = getNodeById(downId);
                      const isLockedDown = downSpec.stageIndex > activeStage;
                      return (
                        <button
                          key={downId}
                          type="button"
                          onClick={() => handleNodeActivate(downSpec)}
                          className={cn(
                            "press inline-flex min-h-8 items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors sm:min-h-0 sm:px-2 sm:py-0.5 sm:text-[10px]",
                            isLockedDown
                              ? "border-dashed border-arena-border bg-arena-bg text-arena-text-muted hover:border-arena-primary/40 hover:text-arena-text-sec"
                              : "border-arena-border bg-arena-surface text-arena-text-sec hover:border-arena-primary/45 hover:text-arena-text",
                          )}
                        >
                          {isLockedDown && <Lock className="size-2.5" />}
                          {t(`nodes.${downId}.title`)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
