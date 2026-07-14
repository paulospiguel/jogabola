"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { onColor } from "@/components/timer/team-color";
import type { Team, TeamSide } from "@/components/timer/types";
import type { DecisionMethod } from "@/components/tournament/types";
import { cn } from "@/lib/utils";

interface TournamentDecisionSheetProps {
  teamA: Team;
  teamB: Team;
  onChoose: (winner: TeamSide, method: DecisionMethod) => void;
  error?: string | null;
  disabled?: boolean;
}

export function TournamentDecisionSheet({
  teamA,
  teamB,
  onChoose,
  error,
  disabled = false,
}: TournamentDecisionSheetProps) {
  const t = useTranslations("Tournament.match.decision");
  const [method, setMethod] = useState<DecisionMethod | null>(null);

  return (
    <BottomSheet onClose={() => {}} title={t("title")} hideClose>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-arena-text-sec">{t("description")}</p>
        <div className="flex gap-2">
          {(["coin", "penalties"] as const).map(option => (
            <button
              key={option}
              type="button"
              aria-pressed={method === option}
              disabled={disabled}
              onClick={() => setMethod(option)}
              className={cn(
                "btn-press flex-1 rounded-[10px] border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50",
                method === option
                  ? "border-arena-primary text-arena-primary"
                  : "border-arena-border text-arena-text-sec",
              )}
            >
              {t(`methods.${option}`)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["A", teamA],
              ["B", teamB],
            ] as const
          ).map(([side, team]) => (
            <button
              key={side}
              type="button"
              disabled={!method || disabled}
              onClick={() => method && onChoose(side, method)}
              className="btn-press flex flex-col items-center gap-2 rounded-[16px] border border-arena-border bg-arena-surface p-4 transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span
                className="grid size-10 place-items-center rounded-xl text-base font-extrabold"
                style={{ background: team.color, color: onColor(team.color) }}
              >
                {team.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="text-sm font-bold text-arena-text">
                {team.name}
              </span>
            </button>
          ))}
        </div>
        {!method && (
          <p className="text-center text-xs text-arena-text-muted">
            {t("selectMethod")}
          </p>
        )}
        {error && (
          <p role="alert" className="text-center text-xs text-arena-danger">
            {error}
          </p>
        )}
      </div>
    </BottomSheet>
  );
}
