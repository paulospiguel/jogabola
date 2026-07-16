"use client";

import { UserRoundX } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { PlayerPicker } from "./player-picker";
import {
  type GoalScorerSelection,
  resolveGoalScorer,
} from "./resolve-goal-scorer";
import type { Player, Team } from "./types";

interface LogGoalSheetProps {
  team: Team;
  onConfirm: (playerId: string, assistId?: string) => void;
  onAddPlayer: (name: string) => Player;
  onClose: () => void;
}

export function LogGoalSheet({
  team,
  onConfirm,
  onAddPlayer,
  onClose,
}: LogGoalSheetProps) {
  const t = useTranslations("timer.match.goalSheet");
  const [selection, setSelection] = useState<GoalScorerSelection>(
    team.players.length === 1
      ? { kind: "player", playerId: team.players[0].id }
      : null,
  );
  const [scorerDraft, setScorerDraft] = useState("");
  const [assist, setAssist] = useState<string | null>(null);

  // Mirror the live list so newly-added players appear without re-mounting.
  const [players, setPlayers] = useState<Player[]>(team.players);

  function handleAddScorer(name: string): Player {
    const p = onAddPlayer(name);
    setPlayers(prev => (prev.some(x => x.id === p.id) ? prev : [...prev, p]));
    return p;
  }

  function handleAddAssist(name: string): Player {
    const p = onAddPlayer(name);
    setPlayers(prev => (prev.some(x => x.id === p.id) ? prev : [...prev, p]));
    return p;
  }

  const scorerId = selection?.kind === "player" ? selection.playerId : null;

  function selectScorer(playerId: string) {
    setSelection({ kind: "player", playerId });
    setScorerDraft("");
    setAssist(null);
  }

  function confirmGoal(playerId: string) {
    onConfirm(playerId, assist ?? undefined);
    onClose();
  }

  function handleScorerSubmit(draft = scorerDraft) {
    const resolution = resolveGoalScorer({ draft, selection, players });

    switch (resolution.type) {
      case "select-existing":
        selectScorer(resolution.playerId);
        return;
      case "create-and-select": {
        const player = handleAddScorer(resolution.name);
        selectScorer(player.id);
        return;
      }
      case "confirm":
        confirmGoal(resolution.playerId);
        return;
      case "blocked":
        return;
    }
  }

  return (
    <BottomSheet onClose={onClose} title={t("title", { team: team.name })}>
      <div className="flex flex-col gap-4 overflow-y-auto">
        <PlayerPicker
          players={players}
          selectedId={scorerId}
          teamColor={team.color}
          onSelect={selectScorer}
          onAddPlayer={handleAddScorer}
          label={t("scorer")}
          draft={scorerDraft}
          onDraftChange={value => {
            setScorerDraft(value);
            if (value.trim()) {
              setSelection(null);
              setAssist(null);
            }
          }}
          onSubmitDraft={handleScorerSubmit}
        />

        <button
          type="button"
          aria-pressed={selection?.kind === "unassigned"}
          onClick={() => {
            setSelection({ kind: "unassigned" });
            setScorerDraft("");
            setAssist(null);
          }}
          className="press flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-arena-border bg-arena-surface px-3 text-sm font-semibold text-arena-text-sec transition-colors aria-pressed:border-arena-primary aria-pressed:bg-arena-primary/10 aria-pressed:text-arena-primary"
        >
          <UserRoundX aria-hidden="true" size={16} strokeWidth={1.7} />
          {t("unassigned")}
        </button>

        {scorerId && players.length > 1 && (
          <PlayerPicker
            players={players}
            selectedId={assist}
            teamColor="#38BDF8"
            onSelect={id => setAssist(a => (a === id ? null : id))}
            onAddPlayer={handleAddAssist}
            label={t("assist")}
            excludeId={scorerId}
          />
        )}

        <Cta
          fullWidth
          disabled={!selection && !scorerDraft.trim()}
          onClick={() => handleScorerSubmit()}
        >
          {scorerDraft.trim() && !selection ? t("selectScorer") : t("register")}
        </Cta>
      </div>
    </BottomSheet>
  );
}
