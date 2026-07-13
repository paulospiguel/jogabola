"use client";

import { motion } from "framer-motion";
import { Pause, Play, RotateCcw, SkipForward, Square } from "lucide-react";
import { useState } from "react";
import { cueTap } from "./feedback";
import { onColor } from "./team-color";
import type { MatchStatus, Team, TeamSide } from "./types";

interface MatchControlsProps {
  status: MatchStatus;
  isLastPeriod: boolean;
  teamA: Team;
  teamB: Team;
  onToggle: () => void;
  onNext: () => void;
  onRestart: () => void;
  onEnd: () => void;
  onGoal: (side: TeamSide) => void;
  onCard: (side: TeamSide) => void;
}

function TeamActions({
  side,
  team,
  disabled,
  onGoal,
  onCard,
}: {
  side: TeamSide;
  team: Team;
  disabled: boolean;
  onGoal: (s: TeamSide) => void;
  onCard: (s: TeamSide) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        disabled={disabled}
        onClick={() => {
          cueTap();
          onGoal(side);
        }}
        className="flex items-center justify-center gap-1.5 rounded-[12px] py-3 text-sm font-extrabold disabled:opacity-40"
        style={{ background: team.color, color: onColor(team.color) }}
      >
        <span className="text-base">⚽</span> Golo
      </motion.button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        disabled={disabled}
        onClick={() => {
          cueTap();
          onCard(side);
        }}
        className="flex items-center justify-center gap-1.5 rounded-[12px] border border-arena-border bg-arena-surface py-2.5 text-xs font-bold text-arena-text-sec disabled:opacity-40"
      >
        <span className="h-4 w-2.5 rounded-[2px] bg-arena-highlight" /> Cartão
      </motion.button>
    </div>
  );
}

export function MatchControls({
  status,
  isLastPeriod,
  teamA,
  teamB,
  onToggle,
  onNext,
  onRestart,
  onEnd,
  onGoal,
  onCard,
}: MatchControlsProps) {
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const running = status === "running";
  const ended = status === "ended";
  const logDisabled = ended;

  function armEnd() {
    setConfirmEnd(true);
    setConfirmRestart(false);
  }
  function cancelEnd() {
    setConfirmEnd(false);
  }
  function commitEnd(action: () => void) {
    setConfirmEnd(false);
    action();
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Per-team scoring */}
      <div className="flex items-stretch gap-3">
        <TeamActions
          side="A"
          team={teamA}
          disabled={logDisabled}
          onGoal={onGoal}
          onCard={onCard}
        />
        <TeamActions
          side="B"
          team={teamB}
          disabled={logDisabled}
          onGoal={onGoal}
          onCard={onCard}
        />
      </div>

      {/* Transport */}
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          disabled={ended}
          onClick={() => {
            cueTap();
            onToggle();
          }}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-[14px] bg-arena-primary font-extrabold text-arena-bg disabled:opacity-40"
        >
          {running ? <Pause size={20} /> : <Play size={20} />}
          {running ? "Pausa" : status === "idle" ? "Começar" : "Continuar"}
        </motion.button>

        {/* Skip / End-match button — requires second tap when on last period */}
        {isLastPeriod && !ended ? (
          confirmEnd ? (
            <motion.button
              type="button"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.94 }}
              aria-label="Confirmar fim do jogo"
              onClick={() => commitEnd(onNext)}
              onBlur={cancelEnd}
              className="grid h-14 w-14 place-items-center rounded-[14px] bg-arena-danger text-[10px] font-bold text-white"
            >
              Sim?
            </motion.button>
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              aria-label="Terminar jogo"
              onClick={() => {
                cueTap();
                armEnd();
              }}
              className="grid h-14 w-14 place-items-center rounded-[14px] border border-arena-border bg-arena-surface text-arena-text-sec"
            >
              <Square size={18} />
            </motion.button>
          )
        ) : (
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            disabled={ended}
            aria-label="Próxima parte"
            onClick={() => {
              cueTap();
              onNext();
            }}
            className="grid h-14 w-14 place-items-center rounded-[14px] border border-arena-border bg-arena-surface text-arena-text-sec disabled:opacity-40"
          >
            <SkipForward size={20} />
          </motion.button>
        )}

        {!confirmRestart ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            aria-label="Reiniciar"
            onClick={() => setConfirmRestart(true)}
            className="grid h-14 w-14 place-items-center rounded-[14px] border border-arena-border bg-arena-surface text-arena-text-muted"
          >
            <RotateCcw size={18} />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              setConfirmRestart(false);
              onRestart();
            }}
            onBlur={() => setConfirmRestart(false)}
            className="grid h-14 w-14 place-items-center rounded-[14px] bg-arena-danger text-[10px] font-bold text-white"
          >
            Sim?
          </motion.button>
        )}
      </div>

      {/* "Terminar jogo agora" link — also requires second tap */}
      {!ended && status !== "idle" && (
        confirmEnd ? (
          <button
            type="button"
            onClick={() => commitEnd(onEnd)}
            onBlur={cancelEnd}
            className="self-center text-xs font-bold text-arena-danger underline-offset-2 hover:underline"
          >
            Confirmas? Terminar
          </button>
        ) : (
          <button
            type="button"
            onClick={armEnd}
            className="self-center text-xs font-semibold text-arena-text-muted underline-offset-2 hover:text-arena-text-sec hover:underline"
          >
            Terminar jogo agora
          </button>
        )
      )}
    </div>
  );
}
