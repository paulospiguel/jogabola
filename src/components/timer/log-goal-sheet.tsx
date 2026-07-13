"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { onColor } from "./team-color";
import type { Team } from "./types";

interface LogGoalSheetProps {
  team: Team;
  onConfirm: (playerId: string, assistId?: string) => void;
  onClose: () => void;
}

function PlayerPill({
  name,
  active,
  color,
  onClick,
}: {
  name: string;
  active: boolean;
  color?: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex items-center gap-2 rounded-[12px] border px-3 py-2.5 text-left text-sm font-semibold transition-colors"
      style={{
        borderColor: active
          ? (color ?? "var(--color-arena-primary)")
          : "var(--color-arena-border)",
        background: active
          ? `${color ?? "#7CFF4F"}1f`
          : "var(--color-arena-surface)",
        color: "var(--color-arena-text)",
      }}
    >
      <span
        className="grid size-6 place-items-center rounded-md text-[10px] font-extrabold"
        style={{
          background: color ?? "#7CFF4F",
          color: onColor(color ?? "#7CFF4F"),
        }}
      >
        {name.slice(0, 1).toUpperCase()}
      </span>
      <span className="truncate">{name}</span>
    </motion.button>
  );
}

export function LogGoalSheet({ team, onConfirm, onClose }: LogGoalSheetProps) {
  const [scorer, setScorer] = useState<string | null>(
    team.players.length === 1 ? team.players[0].id : null,
  );
  const [assist, setAssist] = useState<string | null>(null);
  const hasPlayers = team.players.length > 0;

  return (
    <BottomSheet onClose={onClose} title={`Golo · ${team.name}`}>
      <div className="flex flex-col gap-4 overflow-y-auto">
        {!hasPlayers ? (
          <p className="text-sm text-arena-text-sec">
            Esta equipa não tem jogadores. O golo será registado sem marcador.
          </p>
        ) : (
          <>
            <section className="flex flex-col gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-arena-text-muted">
                Marcador
              </span>
              <div className="grid grid-cols-2 gap-2">
                {team.players.map(p => (
                  <PlayerPill
                    key={p.id}
                    name={p.name}
                    color={team.color}
                    active={scorer === p.id}
                    onClick={() => {
                      setScorer(p.id);
                      if (assist === p.id) setAssist(null);
                    }}
                  />
                ))}
              </div>
            </section>

            {scorer && team.players.length > 1 && (
              <section className="flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-arena-text-muted">
                  Assistência (opcional)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {team.players
                    .filter(p => p.id !== scorer)
                    .map(p => (
                      <PlayerPill
                        key={p.id}
                        name={p.name}
                        color="#38BDF8"
                        active={assist === p.id}
                        onClick={() =>
                          setAssist(a => (a === p.id ? null : p.id))
                        }
                      />
                    ))}
                </div>
              </section>
            )}
          </>
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
