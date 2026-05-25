"use client";

import {
  ArrowLeft,
  Brain,
  Check,
  ChevronRight,
  Shuffle,
  Sparkles,
  UserPlus,
  Users,
  ArrowLeftRight,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useMemo, useTransition } from "react";
import type { BalancedPlayer } from "@/actions/team-balancer.actions";
import { balanceTeamsWithAI } from "@/actions/team-balancer.actions";
import { JbAvatar } from "@/components/arena/avatar";
import { Cta } from "@/components/arena/cta";
import type { Guest } from "@/components/arena/guests-sheet";
import { GuestsSheet } from "@/components/arena/guests-sheet";
import { cn } from "@/lib/utils";

// Team colour palette
const TEAM_COLORS = ["#7CFF4F", "#38BDF8", "#F59E0B", "#B97FFF"] as const;
const TEAM_NAMES = ["A", "B", "C", "D"] as const;

type Phase = "setup" | "generating" | "result";
type Format = { pPerTeam: 5 | 7 | 11; nTeams: 2 | 3 | 4 };

interface BalancedTeam {
  id: string;
  name: string;
  color: string;
  players: BalancedPlayer[];
  avgRating: number;
}

interface EquipasTabProps {
  eventId: number;
  confirmed: { id: string; name: string; image: string | null }[];
  canEdit: boolean;
}

function PlayerRow({
  player,
  rank,
  color,
  selected,
  muted,
  onPress,
}: {
  player: BalancedPlayer | (Guest & { isGuest: true });
  rank?: number;
  color?: string;
  selected?: boolean;
  muted?: boolean;
  onPress?: () => void;
}) {
  const isGuest = "level" in player || player.isGuest;
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={!onPress}
      className={cn(
        "flex items-center gap-2.5 rounded-[11px] border px-3 py-2 text-left transition-all duration-100",
        onPress && "active:scale-[0.97] cursor-pointer",
        selected
          ? "border-arena-primary/55 bg-arena-primary/10"
          : muted
            ? "border-arena-border/30 bg-arena-surface opacity-40"
            : "border-arena-border bg-arena-surface",
      )}
    >
      {rank !== undefined && (
        <span className="w-5 shrink-0 text-[11px] font-bold text-arena-text-muted">
          {rank}
        </span>
      )}

      <JbAvatar
        name={player.name}
        image={"image" in player ? player.image : null}
        size={28}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[13px] font-semibold text-arena-text">
            {player.name}
          </span>
          {isGuest && (
            <span className="shrink-0 rounded px-1 py-px text-[9px] font-bold tracking-wide text-arena-text-muted uppercase">
              convidado
            </span>
          )}
        </div>
      </div>

      {player.rating > 0 && (
        <span
          className="shrink-0 text-[12px] font-bold"
          style={{ color: color ?? "#7CFF4F" }}
        >
          {player.rating.toFixed(1)}
        </span>
      )}
    </button>
  );
}

export function EquipasTab({ eventId, confirmed, canEdit }: EquipasTabProps) {
  const t = useTranslations("arenaEquipas");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [format, setFormat] = useState<Format>({ pPerTeam: 7, nTeams: 2 });
  const [teams, setTeams] = useState<BalancedTeam[] | null>(null);
  const [phase, setPhase] = useState<Phase>("setup");
  const [showGuestsSheet, setShowGuestsSheet] = useState(false);
  const [swapMode, setSwapMode] = useState(false);
  const [swapPick, setSwapPick] = useState<{
    player: BalancedPlayer;
    teamIdx: number;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const required = format.pPerTeam * format.nTeams;
  const filled = confirmed.length + guests.length;
  const missing = Math.max(0, required - filled);
  const canGenerate = filled >= format.nTeams * 2;

  const statusOk = filled >= required;

  function handleGenerate() {
    setPhase("generating");
    startTransition(async () => {
      const res = await balanceTeamsWithAI(eventId, guests.length);
      if (res.success && res.data) {
        const allPlayers = [...res.data.teamA, ...res.data.teamB];
        // Rebuild into nTeams groups with snake-draft
        const sorted = [...allPlayers].sort((a, b) => b.rating - a.rating);
        const buckets: BalancedPlayer[][] = Array.from(
          { length: format.nTeams },
          () => [],
        );
        sorted.forEach((p, i) => {
          const round = Math.floor(i / format.nTeams);
          const pos = round % 2 === 0 ? i % format.nTeams : format.nTeams - 1 - (i % format.nTeams);
          buckets[pos].push(p);
        });
        const built: BalancedTeam[] = buckets.map((players, idx) => ({
          id: `team-${idx}`,
          name: `Equipa ${TEAM_NAMES[idx]}`,
          color: TEAM_COLORS[idx],
          players,
          avgRating:
            players.length > 0
              ? players.reduce((s, p) => s + p.rating, 0) / players.length
              : 0,
        }));
        setTeams(built);
        setPhase("result");
      } else {
        setPhase("setup");
      }
    });
  }

  function handleRebalance() {
    setSwapMode(false);
    setSwapPick(null);
    handleGenerate();
  }

  function handleSwap(player: BalancedPlayer, teamIdx: number) {
    if (!swapPick) {
      setSwapPick({ player, teamIdx });
      return;
    }
    if (swapPick.player.id === player.id) {
      setSwapPick(null);
      return;
    }
    if (!teams) return;

    const newTeams = teams.map(t => ({ ...t, players: [...t.players] }));
    const aT = newTeams[swapPick.teamIdx];
    const bT = newTeams[teamIdx];
    const aIdx = aT.players.findIndex(p => p.id === swapPick.player.id);
    const bIdx = bT.players.findIndex(p => p.id === player.id);

    if (swapPick.teamIdx === teamIdx) {
      [aT.players[aIdx], aT.players[bIdx]] = [
        aT.players[bIdx],
        aT.players[aIdx],
      ];
    } else {
      [aT.players[aIdx], bT.players[bIdx]] = [
        bT.players[bIdx],
        aT.players[aIdx],
      ];
    }

    const rebuilt = newTeams.map(t => ({
      ...t,
      avgRating:
        t.players.length > 0
          ? t.players.reduce((s, p) => s + p.rating, 0) / t.players.length
          : 0,
    }));

    setTeams(rebuilt);
    setSwapPick(null);
  }

  // ── Setup ──
  if (phase === "setup") {
    return (
      <div className="flex flex-col gap-3.5 px-5 py-4 pb-28">
        {/* Status card */}
        <div
          className={cn(
            "rounded-[14px] border p-3.5",
            statusOk
              ? "border-arena-success/44 bg-arena-success/[0.08]"
              : missing > 0
                ? "border-arena-warning/33 bg-arena-warning/[0.07]"
                : "border-arena-border bg-arena-surface",
          )}
        >
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-[10px]",
                  statusOk
                    ? "bg-arena-success/22"
                    : "bg-arena-warning/22",
                )}
              >
                {statusOk ? (
                  <Check size={15} className="text-arena-success" strokeWidth={2.2} />
                ) : (
                  <Users size={15} className="text-arena-warning" strokeWidth={2.2} />
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold text-arena-text">
                  {statusOk
                    ? t("status.complete")
                    : missing > 0
                      ? t("status.missing", { count: missing })
                      : t("status.overflow", { count: -missing })}
                </div>
                <div className="text-[11px] text-arena-text-muted">
                  {format.pPerTeam}vs{format.pPerTeam} · {format.nTeams}{" "}
                  {t("status.teams")}
                </div>
              </div>
            </div>
            <div className="shrink-0 font-sora text-[18px] font-extrabold leading-none text-arena-text">
              {filled}
              <span className="text-[13px] font-semibold text-arena-text-muted">
                /{required}
              </span>
            </div>
          </div>
          <div className="h-[5px] overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${Math.min(100, (filled / required) * 100)}%`,
                background: statusOk ? "#22C55E" : "#F59E0B",
              }}
            />
          </div>
        </div>

        {/* Format selector */}
        <div className="rounded-[14px] border border-arena-border bg-arena-surface p-3.5">
          <div className="mb-2.5 flex items-center gap-1.5">
            <span className="text-[11px] font-bold tracking-[0.7px] text-arena-text-sec uppercase">
              {t("format.label")}
            </span>
          </div>
          <div className="mb-2.5 flex gap-1.5">
            {([5, 7, 11] as const).map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setFormat(f => ({ ...f, pPerTeam: n }))}
                className={cn(
                  "flex h-9 flex-1 items-center justify-center rounded-[10px] border text-[13px] font-bold transition-all duration-100 active:scale-[0.97]",
                  format.pPerTeam === n
                    ? "border-arena-primary/55 bg-arena-primary/15 text-arena-primary"
                    : "border-arena-border bg-arena-surface-el text-arena-text-sec",
                )}
              >
                {n}vs{n}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-arena-text-muted">
              {t("format.numTeams")}
            </span>
            <div className="flex gap-1">
              {([2, 3, 4] as const).map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setFormat(f => ({ ...f, nTeams: n }))}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-[8px] border text-[12px] font-bold transition-all duration-100 active:scale-[0.97]",
                    format.nTeams === n
                      ? "border-arena-primary/55 bg-arena-primary/15 text-arena-primary"
                      : "border-arena-border bg-arena-surface-el text-arena-text-sec",
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmed list */}
        <div>
          <div className="mb-2 px-0.5 text-[12px] font-bold uppercase tracking-[0.6px] text-arena-text">
            {t("confirmed.label")}{" "}
            <span className="font-medium text-arena-text-muted">
              · {confirmed.length}
            </span>
          </div>
          {confirmed.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-arena-border px-4 py-4 text-center text-[12px] text-arena-text-muted">
              {t("confirmed.empty")}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {confirmed.map((p, i) => (
                <PlayerRow
                  key={p.id}
                  player={{ ...p, rating: 0, isGuest: false }}
                  rank={i + 1}
                />
              ))}
            </div>
          )}
        </div>

        {/* Guests */}
        <div>
          <div className="mb-2 flex items-center justify-between px-0.5">
            <span className="text-[12px] font-bold uppercase tracking-[0.6px] text-arena-text">
              {t("guests.label")}{" "}
              <span className="font-medium text-arena-text-muted">
                · {guests.length}
              </span>
            </span>
            {guests.length > 0 && (
              <button
                type="button"
                onClick={() => setShowGuestsSheet(true)}
                className="text-[12px] font-semibold text-arena-primary"
              >
                {t("guests.edit")}
              </button>
            )}
          </div>
          {guests.length === 0 ? (
            <button
              type="button"
              onClick={() => setShowGuestsSheet(true)}
              className="flex w-full items-center gap-3 rounded-[12px] border border-dashed border-arena-primary/44 bg-arena-surface px-3.5 py-3 active:scale-[0.97]"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-[11px] border border-arena-primary/33 bg-arena-primary/18">
                <UserPlus size={17} className="text-arena-primary" strokeWidth={2.2} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-[13px] font-bold text-arena-text">
                  {t("guests.addTitle")}
                </div>
                <div className="mt-0.5 text-[11px] text-arena-text-muted">
                  {missing > 0
                    ? t("guests.addSubMissing", { count: missing })
                    : t("guests.addSub")}
                </div>
              </div>
              <ChevronRight size={16} className="text-arena-text-muted" strokeWidth={2} />
            </button>
          ) : (
            <div className="flex flex-col gap-1.5">
              {guests.map((g, i) => (
                <PlayerRow
                  key={g.id}
                  player={{ ...g, id: g.id, isGuest: true, image: null }}
                  rank={confirmed.length + i + 1}
                  color={g.levelColor}
                />
              ))}
              <button
                type="button"
                onClick={() => setShowGuestsSheet(true)}
                className="flex items-center justify-center gap-1.5 rounded-[11px] border border-dashed border-arena-border py-2.5 text-[12px] font-semibold text-arena-text-sec transition-colors active:scale-[0.97]"
              >
                <UserPlus size={13} strokeWidth={2.2} />
                {t("guests.addMore")}
              </button>
            </div>
          )}
        </div>

        {/* AI Card */}
        <div
          className="relative overflow-hidden rounded-[16px] border border-arena-primary/33 p-4"
          style={{
            background:
              "linear-gradient(135deg,rgba(124,255,79,0.10) 0%,var(--color-arena-surface) 60%)",
          }}
        >
          <div
            className="pointer-events-none absolute -top-8 -right-8 size-[140px] rounded-full"
            style={{
              background:
                "radial-gradient(circle,rgba(124,255,79,0.22) 0%,transparent 70%)",
            }}
          />
          <div className="relative mb-2.5 flex items-center gap-2.5">
            <div className="flex size-[34px] items-center justify-center rounded-[11px] border border-arena-primary/44 bg-arena-primary/22">
              <Brain size={17} className="text-arena-primary" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-[14px] font-bold text-arena-text">
                {t("ai.title")}
                <span className="rounded-[5px] border border-arena-primary/44 bg-arena-primary/22 px-1.5 py-px text-[9px] font-bold tracking-[0.6px] text-arena-primary uppercase">
                  BETA
                </span>
              </div>
              <div className="mt-0.5 text-[11px] text-arena-text-muted">
                {t("ai.sub")}
              </div>
            </div>
          </div>
          <Cta
            variant={canGenerate ? "primary" : "secondary"}
            size="lg"
            fullWidth
            disabled={!canGenerate}
            onClick={handleGenerate}
            className={cn(
              canGenerate && "shadow-[0_0_24px_rgba(124,255,79,0.33)]",
            )}
          >
            <Sparkles size={17} strokeWidth={2.2} />
            {canGenerate
              ? t("ai.cta", { count: format.nTeams })
              : t("ai.ctaDisabled", { count: format.nTeams * 2 - filled })}
          </Cta>
        </div>

        {showGuestsSheet && (
          <GuestsSheet
            guests={guests}
            setGuests={setGuests}
            suggestedMissing={missing}
            onClose={() => setShowGuestsSheet(false)}
          />
        )}
      </div>
    );
  }

  // ── Generating ──
  if (phase === "generating" || isPending) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 py-16">
        <div className="relative flex size-[90px] items-center justify-center">
          <div
            className="absolute inset-0 animate-spin rounded-full border-2"
            style={{ borderColor: "rgba(124,255,79,0.22)" }}
          />
          <div
            className="absolute inset-0 animate-spin rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "#7CFF4F",
              animationDuration: "0.9s",
            }}
          />
          <div
            className="flex size-[60px] items-center justify-center rounded-[18px] border border-arena-primary/55 bg-arena-primary/18"
            style={{ boxShadow: "0 0 40px rgba(124,255,79,0.55)" }}
          >
            <Brain size={28} className="text-arena-primary" strokeWidth={1.8} />
          </div>
        </div>
        <div className="text-center">
          <div className="text-[16px] font-bold text-arena-text">
            {t("ai.generating")}
          </div>
          <div className="mt-1.5 max-w-[240px] text-[12px] leading-relaxed text-arena-text-muted">
            {t("ai.generatingDesc")}
          </div>
        </div>
      </div>
    );
  }

  // ── Result ──
  if (phase === "result" && teams) {
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
              onClick={() => {
                setPhase("setup");
                setTeams(null);
                setSwapMode(false);
                setSwapPick(null);
              }}
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
              {isBalanced ? t("result.balanced_ok") : t("result.balanced_ok_rough")}
            </span>
          </div>

          {/* Swap mode banner */}
          {swapMode && (
            <div className="flex items-center gap-2 rounded-[11px] border border-arena-info/44 bg-arena-info/14 px-3 py-2.5">
              <ArrowLeftRight size={14} className="text-arena-info" strokeWidth={2.2} />
              <div className="flex-1 text-[11px] font-semibold text-arena-info">
                {swapPick
                  ? t("result.swapPick", {
                      name: swapPick.player.name.split(" ")[0],
                    })
                  : t("result.swapInstructions")}
              </div>
              <button
                type="button"
                onClick={() => {
                  setSwapMode(false);
                  setSwapPick(null);
                }}
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
              style={{ borderColor: `${team.color}44` }}
            >
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex size-7 items-center justify-center rounded-[9px] font-sora text-[13px] font-extrabold"
                    style={{
                      background: `${team.color}22`,
                      border: `1px solid ${team.color}55`,
                      color: team.color,
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
                    style={{ color: team.color }}
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
                    color={team.color}
                    selected={swapPick?.player.id === p.id}
                    muted={
                      swapMode &&
                      swapPick !== null &&
                      swapPick.player.id !== p.id
                    }
                    onPress={swapMode ? () => handleSwap(p, tIdx) : undefined}
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
            onClick={handleRebalance}
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[13px] border border-arena-border bg-arena-surface text-[13px] font-bold text-arena-text active:scale-[0.97]"
          >
            <Shuffle size={14} strokeWidth={2} />
            {t("result.rebalance")}
          </button>
          <button
            type="button"
            onClick={() => {
              setSwapMode(s => !s);
              setSwapPick(null);
            }}
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

  return null;
}
