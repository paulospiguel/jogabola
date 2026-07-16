"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { PlayerPicker } from "./player-picker";
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
  const [scorer, setScorer] = useState<string | null>(
    team.players.length === 1 ? team.players[0].id : null,
  );
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

  const hasPlayers = players.length > 0;

  return (
    <BottomSheet onClose={onClose} title={`Golo · ${team.name}`}>
      <div className="flex flex-col gap-4 overflow-y-auto">
        <PlayerPicker
          players={players}
          selectedId={scorer}
          teamColor={team.color}
          onSelect={setScorer}
          onAddPlayer={handleAddScorer}
          label="Marcador"
        />

        {scorer && players.length > 1 && (
          <PlayerPicker
            players={players}
            selectedId={assist}
            teamColor="#38BDF8"
            onSelect={id => setAssist(a => (a === id ? null : id))}
            onAddPlayer={handleAddAssist}
            label="Assistência (opcional)"
            excludeId={scorer}
          />
        )}

        <Cta
          fullWidth
          disabled={hasPlayers && !scorer}
          onClick={() => {
            onConfirm(scorer ?? "", assist ?? undefined);
            onClose();
          }}
        >
          Registar golo
        </Cta>
      </div>
    </BottomSheet>
  );
}
