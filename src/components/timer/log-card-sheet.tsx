"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { onColor } from "./team-color";
import type { CardColor, Team } from "./types";

interface LogCardSheetProps {
  team: Team;
  onConfirm: (playerId: string, card: CardColor) => void;
  onClose: () => void;
}

export function LogCardSheet({ team, onConfirm, onClose }: LogCardSheetProps) {
  const [player, setPlayer] = useState<string | null>(
    team.players.length === 1 ? team.players[0].id : null,
  );
  const [card, setCard] = useState<CardColor>("yellow");
  const hasPlayers = team.players.length > 0;
  const cardHex = card === "yellow" ? "#FACC15" : "#EF4444";

  return (
    <BottomSheet onClose={onClose} title={`Cartão · ${team.name}`}>
      <div className="flex flex-col gap-4 overflow-y-auto">
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

        {hasPlayers ? (
          <section className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-arena-text-muted">
              Jogador
            </span>
            <div className="grid grid-cols-2 gap-2">
              {team.players.map(p => (
                <motion.button
                  key={p.id}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setPlayer(p.id)}
                  className="flex items-center gap-2 rounded-[12px] border px-3 py-2.5 text-left text-sm font-semibold"
                  style={{
                    borderColor:
                      player === p.id ? cardHex : "var(--color-arena-border)",
                    background:
                      player === p.id
                        ? `${cardHex}1f`
                        : "var(--color-arena-surface)",
                    color: "var(--color-arena-text)",
                  }}
                >
                  <span
                    className="grid size-6 place-items-center rounded-md text-[10px] font-extrabold"
                    style={{
                      background: team.color,
                      color: onColor(team.color),
                    }}
                  >
                    {p.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="truncate">{p.name}</span>
                </motion.button>
              ))}
            </div>
          </section>
        ) : (
          <p className="text-sm text-arena-text-sec">
            Sem jogadores nesta equipa — o cartão será registado sem nome.
          </p>
        )}

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
