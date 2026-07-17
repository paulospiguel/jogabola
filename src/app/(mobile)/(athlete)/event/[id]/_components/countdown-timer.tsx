"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownLabels {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

interface CountdownTimerProps {
  targetDate: Date | string;
  className?: string;
  forceZero?: boolean;
  /** Shown when the target date has passed (event already happened). */
  concludedLabel?: string;
  labels?: CountdownLabels;
}

const DEFAULT_LABELS: CountdownLabels = {
  days: "DIAS",
  hours: "HORAS",
  minutes: "MINS",
  seconds: "SEGS",
};

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

const ZERO_TIME: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isExpired: false,
};

export function CountdownTimer({
  targetDate,
  className,
  forceZero = false,
  concludedLabel,
  labels = DEFAULT_LABELS,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (forceZero) {
      setTimeLeft(ZERO_TIME);
      return;
    }

    const target = new Date(targetDate).getTime();
    if (Number.isNaN(target)) {
      console.warn(
        "Invalid targetDate provided to CountdownTimer:",
        targetDate,
      );
      setTimeLeft(prev => ({ ...prev, isExpired: true }));
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft(prev => ({ ...prev, isExpired: true }));
        return true;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      });
      return false;
    };

    updateCountdown();
    const interval = setInterval(() => {
      const isDone = updateCountdown();
      if (isDone) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, forceZero]);

  if (timeLeft.isExpired) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border border-arena-border bg-arena-surface-el/50 px-4 py-2",
          className,
        )}
      >
        <CheckCircle2
          size={16}
          className="text-arena-text-muted"
          strokeWidth={2.2}
        />
        <span className="text-[12px] font-bold uppercase tracking-wider text-arena-text-muted">
          {concludedLabel ?? "Já decorreu"}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <TimeUnit value={timeLeft.days} label={labels.days} />
      <TimeSeparator />
      <TimeUnit value={timeLeft.hours} label={labels.hours} />
      <TimeSeparator />
      <TimeUnit value={timeLeft.minutes} label={labels.minutes} />
      <TimeSeparator />
      <TimeUnit value={timeLeft.seconds} label={labels.seconds} />
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  const valStr = value.toString().padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex min-w-[54px] h-[54px] items-center justify-center rounded-[14px] border border-arena-primary/20 bg-arena-surface-el/40 backdrop-blur-md shadow-[0_0_20px_rgba(124,255,79,0.03)] overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-arena-primary/5 to-transparent pointer-events-none" />

        <AnimatePresence mode="popLayout">
          <motion.span
            key={valStr}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="text-[24px] font-black tabular-nums text-arena-primary drop-shadow-[0_0_10px_rgba(124,255,79,0.3)]"
          >
            {valStr}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-[9px] font-black tracking-[0.1em] text-arena-text-muted/60 uppercase">
        {label}
      </span>
    </div>
  );
}

function TimeSeparator() {
  return (
    <div className="flex flex-col gap-1.5 mt-[-14px]">
      <motion.div
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="size-1 rounded-full bg-arena-primary/40"
      />
      <motion.div
        animate={{ opacity: [0.2, 0.6, 0.2] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="size-1 rounded-full bg-arena-primary/40"
      />
    </div>
  );
}
