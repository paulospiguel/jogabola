"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { PlayerPicker } from "./player-picker";
import type { CardColor, Player, Team } from "./types";

interface LogCardSheetProps {
  team: Team;
  onConfirm: (playerId: string, card: CardColor) => void;
  onAddPlayer: (name: string) => Player;
  onClose: () => void;
}

export function LogCardSheet({
  team,
  onConfirm,
  onAddPlayer,
  onClose,
}: LogCardSheetProps) {
  const [player, setPlayer] = useState<string | null>(
    team.players.length === 1 ? team.players[0].id : null,
  );
  const [card, setCard] = useState<CardColor>("yellow");

  // Mirror the live list so newly-added players appear without re-mounting.
  const [players, setPlayers] = useState<Player[]>(team.players);

  function handleAddPlayer(name: string): Player {
    const p = onAddPlayer(name);
    setPlayers(prev => (prev.some(x => x.id === p.id) ? prev : [...prev, p]));
    return p;
  }

  const hasPlayers = players.length > 0;
  const cardHex = card === "yellow" ? "#FACC15" : "#EF4444";

  return (
    <BottomSheet onClose={onClose} title={`Cartão · ${team.name}`}>
      <div className="flex flex-col gap-4 overflow-y-auto">
        {/* Card colour selector */}
        <section className="flex gap-2">
          {(["yellow", "red"] as const).map(c => {
            const hex = c === "yellow" ? "#FACC15" : "#EF4444";
            const active = card === c;
            return (
              <motion.button
                key={c}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setCard(c)}
                className="flex flex-1 items-center justify-center gap-2 rounded-[12px] border py-3 font-bold transition-colors"
                style={{
                  borderColor: active ? hex : "var(--color-arena-border)",
                  background: active
                    ? `${hex}22`
                    : "var(--color-arena-surface)",
                  color: active ? hex : "var(--color-arena-text-sec)",
                }}
              >
                <span
                  className="h-5 w-3.5 rounded-[3px]"
                  style={{ background: hex }}
                />
                {c === "yellow" ? "Amarelo" : "Vermelho"}
              </motion.button>
            );
          })}
        </section>

        <PlayerPicker
          players={players}
          selectedId={player}
          teamColor={cardHex}
          onSelect={setPlayer}
          onAddPlayer={handleAddPlayer}
          label="Jogador"
        />

        <Cta
          fullWidth
          disabled={hasPlayers && !player}
          onClick={() => {
            onConfirm(player ?? "", card);
            onClose();
          }}
        >
          Registar cartão
        </Cta>
      </div>
    </BottomSheet>
  );
}
