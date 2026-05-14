"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type ScoreLevel = "low" | "medium" | "high";

interface JbScoreBarProps {
  score: ScoreLevel;
  className?: string;
}

const SCORE_CONFIG: Record<
  ScoreLevel,
  { position: number; color: string }
> = {
  high:   { position: 10, color: "#EF4444" },
  medium: { position: 50, color: "#F59E0B" },
  low:    { position: 90, color: "#22C55E" },
};

const TOOLTIP_TRANSLATE: Record<ScoreLevel, string> = {
  high:   "translateX(0%)",
  medium: "translateX(-50%)",
  low:    "translateX(-100%)",
};

const ARROW_LEFT: Record<ScoreLevel, string> = {
  high:   "16px",
  medium: "50%",
  low:    "calc(100% - 16px)",
};

const BAR_SEGMENTS = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#14B8A6",
  "#22C55E",
];

export function JbScoreBar({ score, className }: JbScoreBarProps) {
  const t = useTranslations("arenaBadges");
  const cfg = SCORE_CONFIG[score] ?? SCORE_CONFIG.medium;
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative w-full", className)}>
      {/* Tooltip spacer — always reserves height to avoid layout shift */}
      <div className="h-[52px]" />

      {/* Tooltip */}
      <div
        className={cn(
          "absolute top-0 transition-all duration-200",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
        style={{ left: `${cfg.position}%` }}
      >
        <div
          className="relative rounded-[8px] px-3 py-2 text-center"
          style={{
            backgroundColor: cfg.color,
            transform: TOOLTIP_TRANSLATE[score],
            minWidth: "68px",
          }}
        >
          <p
            className="text-[8px] font-bold uppercase leading-none tracking-widest"
            style={{ color: "rgba(11,15,20,0.6)" }}
          >
            {t("scoreIs")}
          </p>
          <p
            className="mt-0.5 text-[13px] font-black leading-none"
            style={{ color: "#0B0F14" }}
          >
            {t(score)}
          </p>
          {/* Arrow */}
          <div
            className="absolute top-full -translate-x-1/2"
            style={{
              left: ARROW_LEFT[score],
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: `7px solid ${cfg.color}`,
            }}
          />
        </div>
      </div>

      {/* Bar — click toggles tooltip */}
      <button
        type="button"
        aria-label={t("scoreIs")}
        onClick={() => setOpen(v => !v)}
        className="w-full"
      >
        <div className="flex h-[10px] gap-[2px] overflow-hidden rounded-full">
          {BAR_SEGMENTS.map((color, i) => (
            <div
              key={i}
              className="h-full flex-1 transition-opacity duration-150 hover:opacity-80"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </button>

      {/* Dot indicator */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
        style={{ left: `${cfg.position}%`, bottom: 0 }}
      >
        <div
          className={cn(
            "size-3 rounded-full border-2 border-[#0B0F14] shadow-md transition-transform duration-200",
            open && "scale-125",
          )}
          style={{ backgroundColor: cfg.color }}
        />
      </div>
    </div>
  );
}
