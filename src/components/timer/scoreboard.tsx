"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { onColor } from "./team-color";
import type { Team } from "./types";

function FlipScore({ value }: { value: number }) {
  const reduce = useReducedMotion();
  return (
    <div
      className="relative h-[52px] w-[44px] overflow-hidden"
      style={{ perspective: 500 }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={reduce ? { opacity: 0 } : { rotateX: -90, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { rotateX: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 flex items-center justify-center font-sora text-[44px] font-extrabold tabular-nums text-arena-text"
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function TeamSide({
  team,
  value,
  align,
}: {
  team: Team;
  value: number;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex flex-1 flex-col items-center gap-1.5 ${align === "left" ? "items-start" : "items-end"}`}
    >
      <div
        className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}
      >
        <span
          className="grid size-7 place-items-center rounded-lg text-xs font-extrabold"
          style={{ background: team.color, color: onColor(team.color) }}
        >
          {team.name.slice(0, 1).toUpperCase()}
        </span>
        <span className="max-w-[92px] truncate text-sm font-bold text-arena-text">
          {team.name}
        </span>
      </div>
      <FlipScore value={value} />
    </div>
  );
}

export function Scoreboard({
  teamA,
  teamB,
  scoreA,
  scoreB,
  period,
  periods,
}: {
  teamA: Team;
  teamB: Team;
  scoreA: number;
  scoreB: number;
  period: number;
  periods: number;
}) {
  return (
    <div className="flex items-center rounded-[18px] border border-arena-border bg-arena-surface px-4 py-3">
      <TeamSide team={teamA} value={scoreA} align="left" />
      <div className="flex flex-col items-center px-2">
        <span className="text-base font-bold text-arena-text-muted">vs</span>
        <span className="mt-1 rounded-full bg-arena-surface-el px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-arena-text-sec">
          {periods > 1 ? `Parte ${period}/${periods}` : "Único"}
        </span>
      </div>
      <TeamSide team={teamB} value={scoreB} align="right" />
    </div>
  );
}
