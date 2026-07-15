"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { formatMinute } from "./format";
import {
  buildTimelineItems,
  type GoalGroupItem,
  type TimelineItem,
} from "./timeline-items";
import type { Match, MatchEvent } from "./types";

function cardName(match: Match, ev: MatchEvent): string {
  const p = match.teams[ev.team].players.find(x => x.id === ev.playerId);
  if (p?.name) return p.name;
  return `Cartão · ${match.teams[ev.team].name}`;
}

function goalGroupName(match: Match, item: GoalGroupItem): string {
  const p = match.teams[item.team].players.find(x => x.id === item.playerId);
  if (p?.name) return p.name;
  return `Golo · ${match.teams[item.team].name}`;
}

function GoalIcon() {
  return (
    <span className="grid size-7 place-items-center rounded-full bg-arena-primary/15 text-base">
      ⚽
    </span>
  );
}

function CardIcon({ ev }: { ev: MatchEvent }) {
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

function TimelineRow({
  match,
  item,
  onRemove,
}: {
  match: Match;
  item: TimelineItem;
  onRemove: (id: string) => void;
}) {
  const team = match.teams[item.kind === "card" ? item.event.team : item.team];
  const isGroup = item.kind === "goals" && item.atSecs.length > 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, rotateX: -45, y: -8 }}
      animate={{ opacity: 1, rotateX: 0, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.28 }}
      style={{ transformOrigin: "top" }}
      className="group flex items-center gap-3 rounded-[14px] border border-arena-border bg-arena-surface px-3 py-2.5"
    >
      <span className="w-9 shrink-0 font-mono text-sm font-bold text-arena-text-muted">
        {formatMinute(item.latestAtSec)}
      </span>
      {item.kind === "card" ? <CardIcon ev={item.event} /> : <GoalIcon />}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-arena-text">
          {item.kind === "card"
            ? cardName(match, item.event)
            : goalGroupName(match, item)}
          {isGroup && (
            <span className="ml-1.5 font-bold text-arena-primary">
              ×{item.atSecs.length}
            </span>
          )}
        </span>
        {isGroup && (
          <span className="truncate text-xs text-arena-text-muted">
            {item.atSecs.map(atSec => formatMinute(atSec)).join(" · ")}
          </span>
        )}
      </div>
      <span
        className="max-w-[72px] shrink-0 truncate rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase"
        style={{ background: `${team.color}22`, color: team.color }}
      >
        {team.name}
      </span>
      <button
        type="button"
        aria-label={
          item.kind === "goals" && item.atSecs.length > 1
            ? "Remover o último golo desta linha"
            : "Remover lance"
        }
        onClick={() =>
          onRemove(item.kind === "card" ? item.event.id : item.latestEventId)
        }
        className="shrink-0 rounded-md p-1.5 text-arena-text-muted opacity-40 transition hover:text-arena-danger hover:opacity-100 active:text-arena-danger active:opacity-100 focus-visible:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}

export function EventTimeline({
  match,
  onRemove,
}: {
  match: Match;
  onRemove: (id: string) => void;
}) {
  const items = buildTimelineItems(match.events);

  if (items.length === 0) {
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
        {items.map(item => (
          <TimelineRow
            key={item.key}
            match={match}
            item={item}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
