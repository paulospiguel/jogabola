"use client";

import { Brain } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import type { BalancedPlayer } from "@/actions/team-balancer.actions";
import { balanceTeamsWithAI } from "@/actions/team-balancer.actions";
import type { Guest } from "@/components/arena/guests-sheet";
import { EquipasResultPhase } from "./equipas-result-phase";
import { EquipasSetupPhase } from "./equipas-setup-phase";

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

export function EquipasTab({ eventId, confirmed }: EquipasTabProps) {
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
      const res = await balanceTeamsWithAI(
        eventId,
        guests.map(g => ({ id: g.id, name: g.name, rating: g.rating })),
      );
      if (res.success && res.data) {
        const allPlayers = [...res.data.teamA, ...res.data.teamB];
        const sorted = [...allPlayers].sort((a, b) => b.rating - a.rating);
        const buckets: BalancedPlayer[][] = Array.from(
          { length: format.nTeams },
          () => [],
        );
        sorted.forEach((p, i) => {
          const round = Math.floor(i / format.nTeams);
          const pos =
            round % 2 === 0
              ? i % format.nTeams
              : format.nTeams - 1 - (i % format.nTeams);
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

    setTeams(
      newTeams.map(t => ({
        ...t,
        avgRating:
          t.players.length > 0
            ? t.players.reduce((s, p) => s + p.rating, 0) / t.players.length
            : 0,
      })),
    );
    setSwapPick(null);
  }

  if (phase === "setup") {
    return (
      <EquipasSetupPhase
        confirmed={confirmed}
        guests={guests}
        setGuests={setGuests}
        format={format}
        setFormat={setFormat}
        showGuestsSheet={showGuestsSheet}
        setShowGuestsSheet={setShowGuestsSheet}
        missing={missing}
        filled={filled}
        required={required}
        canGenerate={canGenerate}
        statusOk={statusOk}
        onGenerate={handleGenerate}
        t={t}
      />
    );
  }

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
            style={{ borderTopColor: "#7CFF4F", animationDuration: "0.9s" }}
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

  if (phase === "result" && teams) {
    return (
      <EquipasResultPhase
        teams={teams}
        format={format}
        filled={filled}
        swapMode={swapMode}
        swapPick={swapPick}
        onBack={() => {
          setPhase("setup");
          setTeams(null);
          setSwapMode(false);
          setSwapPick(null);
        }}
        onRebalance={() => {
          setSwapMode(false);
          setSwapPick(null);
          handleGenerate();
        }}
        onToggleSwapMode={() => {
          setSwapMode(s => !s);
          setSwapPick(null);
        }}
        onSwap={handleSwap}
        t={t}
      />
    );
  }

  return null;
}
