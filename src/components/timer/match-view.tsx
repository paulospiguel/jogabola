"use client";

import { useStatsigClient } from "@statsig/react-bindings";
import { ChevronLeft, Flag } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { TournamentDecisionSheet } from "@/components/tournament/tournament-decision-sheet";
import { finalizeTournamentMatch } from "@/components/tournament/tournament-match-bridge";
import type { DecisionMethod } from "@/components/tournament/types";
import { EventTimeline } from "./event-timeline";
import { uid } from "./format";
import { LogCardSheet } from "./log-card-sheet";
import { LogGoalSheet } from "./log-goal-sheet";
import { MatchControls } from "./match-controls";
import { NEW_MATCH_SETUP_HREF } from "./navigation";
import { Scoreboard } from "./scoreboard";
import { SummaryModal } from "./summary-modal";
import { TimerRing } from "./timer-ring";
import type { Player, TeamSide } from "./types";
import { deriveClock, score, useLiveMatch } from "./use-match-store";
import { useWakeLock } from "./use-wake-lock";

export function MatchView({ id }: { id: string }) {
  const router = useRouter();
  const tournamentId = useSearchParams().get("tournament");
  const t = useTranslations("Tournament.match");
  const { logEvent } = useStatsigClient();
  const { match, now, actions } = useLiveMatch(id);
  useWakeLock(match?.state.status === "running");
  const [goalSide, setGoalSide] = useState<TeamSide | null>(null);
  const [cardSide, setCardSide] = useState<TeamSide | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  const finalizeLockRef = useRef(false);
  const autoOpenedKeyRef = useRef<string | null>(null);

  const scoreA = match ? score(match).A : 0;
  const scoreB = match ? score(match).B : 0;

  // Each ended match opens its appropriate completion UI only once.
  useEffect(() => {
    if (match?.state.status !== "ended") return;
    const endedKey = `${tournamentId ?? "standalone"}:${match.id}`;
    if (autoOpenedKeyRef.current === endedKey) return;
    autoOpenedKeyRef.current = endedKey;

    if (!tournamentId) {
      setSummaryOpen(true);
    } else if (scoreA === scoreB) {
      setDecisionOpen(true);
    }
  }, [match?.id, match?.state.status, scoreA, scoreB, tournamentId]);

  async function finalizeAndReturn(
    winnerSide: TeamSide,
    decisionMethod?: DecisionMethod,
  ) {
    if (!match || !tournamentId || finalizeLockRef.current) return;

    finalizeLockRef.current = true;
    setNavigating(true);
    setFinalizeError(null);
    try {
      const nextId = await finalizeTournamentMatch(
        tournamentId,
        match,
        winnerSide,
        decisionMethod,
      );
      router.push(`/timer/tournament/${nextId}`);
    } catch {
      setFinalizeError(t("finalizeError"));
    } finally {
      finalizeLockRef.current = false;
      setNavigating(false);
    }
  }

  if (match === null) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-center gap-3 px-4">
        <p className="text-sm text-arena-text-sec">Jogo não encontrado.</p>
        <button
          type="button"
          onClick={() => router.push("/timer")}
          className="rounded-[10px] bg-arena-primary px-4 py-2 text-sm font-bold text-arena-bg"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  const clock = deriveClock(match, now);
  const s = score(match);
  const running = match.state.status === "running";
  const urgent =
    running &&
    !clock.inStoppage &&
    match.config.periodLenSec - clock.elapsed <= 60;
  const isLastPeriod = match.state.period >= match.config.periods;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col gap-4 px-4 pb-8">
      <header className="flex items-center justify-between pt-5">
        <button
          type="button"
          aria-label="Voltar"
          onClick={() =>
            router.push(
              tournamentId ? `/timer/tournament/${tournamentId}` : "/timer",
            )
          }
          className="grid size-9 place-items-center rounded-lg border border-arena-border bg-arena-surface text-arena-text-sec"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="rounded-full bg-arena-surface px-3 py-1 text-xs font-bold capitalize text-arena-text-sec">
          {match.type}
        </span>
        <span className="w-9" />
      </header>

      <TimerRing
        mainSec={clock.mainSec}
        stoppageSec={clock.stoppageSec}
        inStoppage={clock.inStoppage}
        progress={clock.progress}
        mode={match.config.mode}
        running={running}
        urgent={urgent}
      />

      <Scoreboard
        teamA={match.teams.A}
        teamB={match.teams.B}
        scoreA={s.A}
        scoreB={s.B}
        period={match.state.period}
        periods={match.config.periods}
      />

      {match.state.status === "ended" && !summaryOpen && !decisionOpen && (
        <div className="flex flex-col items-center gap-2 rounded-[16px] border border-arena-border bg-arena-surface/60 px-4 py-5 text-center">
          <span className="grid size-10 place-items-center rounded-full bg-arena-primary/15">
            <Flag size={18} className="text-arena-primary" />
          </span>
          <p className="text-sm font-extrabold text-arena-text">
            {t("endedTitle")}
          </p>
          <p className="text-xs text-arena-text-muted">
            {t("endedDescription")}
          </p>
          {tournamentId ? (
            <button
              type="button"
              disabled={navigating}
              onClick={() => finalizeAndReturn(s.A > s.B ? "A" : "B")}
              className="btn-press mt-1 rounded-[10px] bg-arena-primary px-4 py-2 text-xs font-bold text-arena-bg disabled:opacity-50"
            >
              {navigating ? t("continuing") : t("continueTournament")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setSummaryOpen(true)}
              className="btn-press mt-1 rounded-[10px] bg-arena-primary px-4 py-2 text-xs font-bold text-arena-bg"
            >
              {t("viewSummary")}
            </button>
          )}
          {finalizeError && (
            <p role="alert" className="text-xs text-arena-danger">
              {finalizeError}
            </p>
          )}
        </div>
      )}

      <MatchControls
        status={match.state.status}
        isLastPeriod={isLastPeriod}
        teamA={match.teams.A}
        teamB={match.teams.B}
        onToggle={actions.toggle}
        onNext={actions.nextPeriod}
        onRestart={actions.restart}
        onEnd={() => {
          logEvent("timer_match_ended", undefined, { type: match.type });
          actions.endMatch();
        }}
        onGoal={setGoalSide}
        onCard={setCardSide}
      />

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-bold uppercase tracking-wide text-arena-text-muted">
          Lances
        </h2>
        <EventTimeline match={match} onRemove={actions.removeEvent} />
      </section>

      {goalSide && (
        <LogGoalSheet
          team={match.teams[goalSide]}
          onConfirm={(playerId, assistId) =>
            actions.addGoal(goalSide, playerId, assistId)
          }
          onAddPlayer={name => {
            const p: Player = { id: uid(), name };
            actions.addPlayerToTeam(goalSide, p);
            return p;
          }}
          onClose={() => setGoalSide(null)}
        />
      )}
      {cardSide && (
        <LogCardSheet
          team={match.teams[cardSide]}
          onConfirm={(playerId, card) =>
            actions.addCard(cardSide, playerId, card)
          }
          onAddPlayer={name => {
            const p: Player = { id: uid(), name };
            actions.addPlayerToTeam(cardSide, p);
            return p;
          }}
          onClose={() => setCardSide(null)}
        />
      )}
      {summaryOpen && (
        <SummaryModal
          match={match}
          onClose={() => setSummaryOpen(false)}
          onHome={() => router.push("/timer")}
          onNewGame={() => router.push(NEW_MATCH_SETUP_HREF)}
        />
      )}
      {decisionOpen && tournamentId && (
        <TournamentDecisionSheet
          teamA={match.teams.A}
          teamB={match.teams.B}
          disabled={navigating}
          error={finalizeError}
          onChoose={finalizeAndReturn}
        />
      )}
    </div>
  );
}
