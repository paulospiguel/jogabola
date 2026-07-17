"use client";

import { ChevronRight, Radio } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { formatClock } from "@/components/timer/format";
import type { Match } from "@/components/timer/types";
import { deriveClock, score } from "@/components/timer/use-match-store";

interface TournamentLiveMatchBarProps {
  tournamentId: string;
  match: Match;
}

/**
 * Compact live-match strip shown on tournament screens while a timer match
 * is in progress. The clock is derived from persisted timestamps, so this
 * only re-renders locally — no match state is owned here.
 */
export function TournamentLiveMatchBar({
  tournamentId,
  match,
}: TournamentLiveMatchBarProps) {
  const t = useTranslations("Tournament.liveBar");
  const router = useRouter();
  const running = match.state.status === "running";
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, [running]);

  const clock = deriveClock(match, now);
  const s = score(match);
  const statusLabel =
    match.state.status === "running"
      ? formatClock(clock.mainSec)
      : match.state.status === "paused"
        ? t("paused")
        : match.state.status === "ended"
          ? t("pendingFinish")
          : t("notStarted");

  return (
    <button
      type="button"
      onClick={() =>
        router.push(`/timer/jogo/${match.id}?tournament=${tournamentId}`)
      }
      aria-label={t("backToMatch")}
      className="press flex w-full flex-col gap-2 rounded-[14px] border border-arena-primary/40 bg-arena-primary/10 px-3.5 py-2.5 text-left transition-colors hover:bg-arena-primary/15"
    >
      <span className="flex items-center gap-2">
        <Radio
          size={14}
          className={
            running
              ? "animate-pulse text-arena-primary"
              : "text-arena-text-muted"
          }
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 truncate text-xs font-bold text-arena-text">
          {match.teams.A.name}{" "}
          <span className="font-sora tabular-nums text-arena-primary">
            {s.A}-{s.B}
          </span>{" "}
          {match.teams.B.name}
        </span>
        <span className="shrink-0 font-mono text-xs font-bold tabular-nums text-arena-text-sec">
          {statusLabel}
        </span>
        <ChevronRight
          size={14}
          className="shrink-0 text-arena-text-muted"
          aria-hidden="true"
        />
      </span>
      <span
        className="h-1 w-full overflow-hidden rounded-full bg-arena-border"
        aria-hidden="true"
      >
        <span
          className="block h-full rounded-full bg-arena-primary transition-[width] duration-500 ease-linear"
          style={{ width: `${Math.round(clock.progress * 100)}%` }}
        />
      </span>
    </button>
  );
}
