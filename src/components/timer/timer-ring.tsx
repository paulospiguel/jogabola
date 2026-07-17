"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatClock } from "./format";
import type { TimerMode } from "./types";

interface TimerRingProps {
  mainSec: number;
  stoppageSec: number;
  inStoppage: boolean;
  progress: number;
  mode: TimerMode;
  running: boolean;
  /** Pulse the ring in the last minute of the period. */
  urgent: boolean;
}

const SIZE = 260;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export function TimerRing({
  mainSec,
  stoppageSec,
  inStoppage,
  progress,
  mode,
  running,
  urgent,
}: TimerRingProps) {
  const reduce = useReducedMotion();
  const accent = inStoppage
    ? "var(--color-arena-warning)"
    : "var(--color-arena-primary)";
  const dash = CIRC * (1 - (mode === "down" ? 1 - progress : progress));

  return (
    <div
      className="relative mx-auto"
      style={{ width: SIZE, height: SIZE, perspective: 800 }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={
          reduce
            ? undefined
            : {
                rotateX: [6, -4, 6],
                rotateY: [-5, 6, -5],
              }
        }
        transition={{
          duration: 9,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        <svg
          aria-hidden
          height={SIZE}
          width={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="absolute inset-0"
          style={{
            filter: `drop-shadow(0 0 26px ${inStoppage ? "rgba(245,158,11,.35)" : "rgba(124,255,79,.28)"})`,
          }}
        >
          <title>Cronómetro</title>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke="var(--color-arena-surface-el)"
            strokeWidth={STROKE}
          />
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={accent}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            animate={{ strokeDashoffset: dash }}
            transition={{ duration: 0.3, ease: "linear" }}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </svg>

        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: "translateZ(40px)" }}
        >
          <motion.div
            className="font-sora font-extrabold tabular-nums tracking-tight text-arena-text"
            style={{ fontSize: 58, lineHeight: 1 }}
            animate={
              urgent && running && !reduce
                ? {
                    scale: [1, 1.06, 1],
                    color: ["#F5F7FA", "#F59E0B", "#F5F7FA"],
                  }
                : undefined
            }
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          >
            {formatClock(mainSec)}
          </motion.div>
          {inStoppage && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 rounded-full bg-arena-warning/15 px-3 py-1 font-mono text-xs font-bold text-arena-warning"
            >
              +{formatClock(stoppageSec)}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
