"use client";

import { ArrowLeft, ArrowLeftRight, Shuffle, Sparkles, X } from "lucide-react";
import type { useTranslations } from "next-intl";
import type { BalancedPlayer } from "@/actions/team-balancer.actions";
import { cn } from "@/lib/utils";
import { PlayerRow } from "./equipas-player-row";

const TEAM_COLORS = ["#7CFF4F", "#38BDF8", "#F59E0B", "#B97FFF"] as const;
const TEAM_NAMES = ["A", "B", "C", "D"] as const;

interface BalancedTeam {
  id: string;
  name: string;
  color: string;
  players: BalancedPlayer[];
  avgRating: number;
}

interface EquipasResultPhaseProps {
  teams: BalancedTeam[];
  format: { pPerTeam: number };
  filled: number;
  swapMode: boolean;
  swapPick: { player: BalancedPlayer; teamIdx: number } | null;
  onBack: () => void;
  onRebalance: () => void;
  onToggleSwapMode: () => void;
  onSwap: (player: BalancedPlayer, teamIdx: number) => void;
  t: ReturnType<typeof useTranslations<"arenaEquipas">>;
}

export function EquipasResultPhase({
  teams,
  format,
  filled,
  swapMode,
  swapPick,
  onBack,
  onRebalance,
  onToggleSwapMode,
  onSwap,
  t,
}: EquipasResultPhaseProps) {
  const maxRating = Math.max(...teams.map(t => t.avgRating));
  const minRating = Math.min(...teams.map(t => t.avgRating));
  const diff = maxRating - minRating;
  const isBalanced = diff < 0.3;

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 px-5 py-4 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="font-sora text-[15px] font-bold tracking-tight text-arena-text">
              {t("result.title")}
            </div>
            <div className="mt-0.5 text-[11px] text-arena-text-muted">
              {format.pPerTeam}vs{format.pPerTeam} ·{" "}
              {t("result.balanced", { count: filled })}
            </div>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="flex size-9 items-center justify-center rounded-[11px] border border-arena-border bg-arena-surface text-arena-text-sec active:scale-[0.97]"
          >
            <ArrowLeft size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Balance indicator */}
        <div className="flex items-center gap-2.5 rounded-[12px] border border-arena-border bg-arena-surface px-3 py-2.5">
          <Sparkles size={14} className="text-arena-primary" strokeWidth={2} />
          <div className="flex-1 text-[11px] leading-snug text-arena-text-sec">
            {t("result.diffLabel")}{" "}
            <strong className="text-arena-text">{diff.toFixed(2)}</strong>
          </div>
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.4px]",
              isBalanced ? "text-arena-primary" : "text-arena-warning",
            )}
          >
            {isBalanced
              ? t("result.balanced_ok")
              : t("result.balanced_ok_rough")}
          </span>
        </div>

        {/* Swap mode banner */}
        {swapMode && (
          <div className="flex items-center gap-2 rounded-[11px] border border-arena-info/44 bg-arena-info/14 px-3 py-2.5">
            <ArrowLeftRight
              size={14}
              className="text-arena-info"
              strokeWidth={2.2}
            />
            <div className="flex-1 text-[11px] font-semibold text-arena-info">
              {swapPick
                ? t("result.swapPick", {
                    name: swapPick.player.name.split(" ")[0],
                  })
                : t("result.swapInstructions")}
            </div>
            <button
              type="button"
              onClick={onToggleSwapMode}
              className="flex items-center"
            >
              <X size={14} className="text-arena-info" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Team cards */}
        {teams.map((team, tIdx) => (
          <div
            key={team.id}
            className="rounded-[14px] border p-3"
            style={{ borderColor: `${TEAM_COLORS[tIdx]}44` }}
          >
            <div className="mb-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex size-7 items-center justify-center rounded-[9px] font-sora text-[13px] font-extrabold"
                  style={{
                    background: `${TEAM_COLORS[tIdx]}22`,
                    border: `1px solid ${TEAM_COLORS[tIdx]}55`,
                    color: TEAM_COLORS[tIdx],
                  }}
                >
                  {TEAM_NAMES[tIdx]}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-arena-text">
                    {team.name}
                  </div>
                  <div className="text-[10px] text-arena-text-muted">
                    {team.players.length} jogador
                    {team.players.length !== 1 ? "es" : ""}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold uppercase tracking-[0.6px] text-arena-text-muted">
                  {t("result.avgRating")}
                </div>
                <div
                  className="font-sora text-[16px] font-extrabold leading-none"
                  style={{ color: TEAM_COLORS[tIdx] }}
                >
                  {team.avgRating.toFixed(1)}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {team.players.map(p => (
                <PlayerRow
                  key={`${p.id}-${tIdx}`}
                  player={p}
                  color={TEAM_COLORS[tIdx]}
                  selected={swapPick?.player.id === p.id}
                  muted={
                    swapMode && swapPick !== null && swapPick.player.id !== p.id
                  }
                  onPress={swapMode ? () => onSwap(p, tIdx) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky action bar */}
      <div
        className="fixed bottom-[72px] left-0 right-0 flex gap-2 px-5 pb-3.5 pt-2"
        style={{
          background:
            "linear-gradient(0deg,var(--color-arena-bg) 50%,transparent)",
        }}
      >
        <button
          type="button"
          onClick={onRebalance}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[13px] border border-arena-border bg-arena-surface text-[13px] font-bold text-arena-text active:scale-[0.97]"
        >
          <Shuffle size={14} strokeWidth={2} />
          {t("result.rebalance")}
        </button>
        <button
          type="button"
          onClick={onToggleSwapMode}
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[13px] border text-[13px] font-bold transition-all duration-100 active:scale-[0.97]",
            swapMode
              ? "border-arena-info/55 bg-arena-info/22 text-arena-info"
              : "border-arena-border bg-arena-surface text-arena-text",
          )}
        >
          <ArrowLeftRight
            size={14}
            strokeWidth={2}
            className={swapMode ? "text-arena-info" : ""}
          />
          {t("result.adjust")}
        </button>
      </div>
    </div>
  );
}
