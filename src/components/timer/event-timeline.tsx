"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { formatMinute } from "./format";
import type { Match, MatchEvent } from "./types";

function playerName(match: Match, ev: MatchEvent): string {
  const p = match.teams[ev.team].players.find(x => x.id === ev.playerId);
  return p?.name ?? (ev.type === "goal" ? "Golo" : "Cartão");
}

function assistName(match: Match, ev: MatchEvent): string | null {
  if (!ev.assistId) return null;
  return (
    match.teams[ev.team].players.find(x => x.id === ev.assistId)?.name ?? null
  );
}

function EventIcon({ ev }: { ev: MatchEvent }) {
  if (ev.type === "goal") {
    return (
      <span className="grid size-7 place-items-center rounded-full bg-arena-primary/15 text-base">
        ⚽
      </span>
    );
  }
  const hex = ev.card === "yellow" ? "#FACC15" : "#EF4444";
  return (
    <span
      className="grid size-7 place-items-center rounded-full"
      style={{ background: `${hex}26` }}
    >
      <span className="h-3.5 w-2.5 rounded-[2px]" style={{ background: hex }} />
    </span>
  );
}

export function EventTimeline({
  match,
  onRemove,
}: {
  match: Match;
  onRemove: (id: string) => void;
}) {
  const events = [...match.events].sort((a, b) => b.atSec - a.atSec);

  if (events.length === 0) {
    return (
      <div className="rounded-[16px] border border-arena-border border-dashed bg-arena-surface/50 px-4 py-8 text-center">
        <p className="text-sm font-semibold text-arena-text-sec">
          Ainda sem lances
        </p>
        <p className="mt-1 text-xs text-arena-text-muted">
          Regista golos e cartões durante o jogo.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {events.map((ev, i) => {
          const team = match.teams[ev.team];
          const assist = assistName(match, ev);
          return (
            <motion.div
              key={ev.id}
              layout
              initial={{ opacity: 0, rotateX: -45, y: -8 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{
                duration: 0.28,
                delay: i === 0 ? 0 : Math.min(i * 0.02, 0.2),
              }}
              style={{ transformOrigin: "top" }}
              className="group flex items-center gap-3 rounded-[14px] border border-arena-border bg-arena-surface px-3 py-2.5"
            >
              <span className="w-9 shrink-0 font-mono text-sm font-bold text-arena-text-muted">
                {formatMinute(ev.atSec)}
              </span>
              <EventIcon ev={ev} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-arena-text">
                  {playerName(match, ev)}
                </span>
                {assist && (
                  <span className="truncate text-xs text-arena-info">
                    assist. {assist}
                  </span>
                )}
              </div>
              <span
                className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase"
                style={{ background: `${team.color}22`, color: team.color }}
              >
                {team.name.slice(0, 1)}
              </span>
              <button
                type="button"
                aria-label="Remover lance"
                onClick={() => onRemove(ev.id)}
                className="shrink-0 rounded-md p-1.5 text-arena-text-muted opacity-40 transition hover:text-arena-danger hover:opacity-100 active:text-arena-danger active:opacity-100 focus-visible:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
