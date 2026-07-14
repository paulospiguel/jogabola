"use client";

import { ArrowLeft, Flag, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import { loadMatch, upsertMatch } from "@/components/timer/use-match-store";
import { TournamentEndedView } from "./tournament-ended-view";
import {
  createTournamentTimerMatch,
  findTeamById,
  isPersistedTimerMatch,
  isTournamentEndedPersisted,
  markTournamentEnded,
  resolveTournamentViewState,
} from "./tournament-match";
import { TournamentPairing } from "./tournament-pairing";
import { TournamentQueue } from "./tournament-queue";
import { TournamentRecoveryState } from "./tournament-recovery-state";
import { tournamentRepository } from "./tournament-store";
import type { Tournament } from "./types";

export { StandingsTable } from "./tournament-standings-table";

import { StandingsTable } from "./tournament-standings-table";

interface TournamentViewProps {
  id: string;
}

export function TournamentView({ id }: TournamentViewProps) {
  const t = useTranslations("Tournament.view");
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [actionError, setActionError] = useState(false);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const startingRef = useRef(false);
  const endingRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: retryCount intentionally triggers a fresh repository read.
  useEffect(() => {
    let cancelled = false;

    async function loadTournament() {
      setLoading(true);
      setLoadError(false);
      try {
        const item = await tournamentRepository.get(id);
        if (!cancelled) setTournament(item);
      } catch {
        if (!cancelled) {
          setTournament(null);
          setLoadError(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadTournament();
    return () => {
      cancelled = true;
    };
  }, [id, retryCount]);

  function handleStartMatch() {
    if (startingRef.current || !tournament?.currentPair) return;
    const teamA = findTeamById(tournament, tournament.currentPair[0]);
    const teamB = findTeamById(tournament, tournament.currentPair[1]);
    if (!teamA || !teamB) {
      setActionError(true);
      return;
    }

    startingRef.current = true;
    setStarting(true);
    setActionError(false);
    let navigated = false;
    try {
      const match = createTournamentTimerMatch(tournament, teamA, teamB);
      upsertMatch(match);
      if (!isPersistedTimerMatch(match, loadMatch(match.id))) {
        throw new Error("Timer match persistence verification failed");
      }
      router.push(`/timer/jogo/${match.id}?tournament=${tournament.id}`);
      navigated = true;
    } catch {
      setActionError(true);
    } finally {
      if (!navigated) {
        startingRef.current = false;
        setStarting(false);
      }
    }
  }

  async function handleEndTournament() {
    if (endingRef.current || !tournament) return;
    endingRef.current = true;
    setEnding(true);
    setActionError(false);
    try {
      const ended = markTournamentEnded(tournament);
      await tournamentRepository.save(ended);
      const persisted = await tournamentRepository.get(ended.id);
      if (!isTournamentEndedPersisted(ended, persisted)) {
        throw new Error("Tournament persistence verification failed");
      }
      setTournament(persisted);
    } catch {
      setActionError(true);
    } finally {
      endingRef.current = false;
      setEnding(false);
    }
  }

  if (loading) {
    return (
      <main className="grid min-h-dvh place-items-center px-4" aria-busy="true">
        <div className="flex items-center gap-2 text-sm text-arena-text-sec">
          <LoaderCircle
            className="animate-spin text-arena-primary"
            size={20}
            aria-hidden="true"
          />
          <span>{t("loading")}</span>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <TournamentRecoveryState
        kind="loadError"
        onRetry={() => setRetryCount(count => count + 1)}
        onBack={() => router.push("/timer/tournament")}
      />
    );
  }

  if (!tournament)
    return (
      <TournamentRecoveryState
        kind="notFound"
        onBack={() => router.push("/timer/tournament")}
      />
    );

  const viewState = resolveTournamentViewState(tournament);
  if (viewState === "ended") {
    return (
      <TournamentEndedView
        tournament={tournament}
        onNewTournament={() => router.push("/timer/tournament")}
      />
    );
  }

  if (viewState === "invalid" || !tournament.currentPair) {
    return (
      <TournamentRecoveryState
        kind="invalid"
        onBack={() => router.push("/timer/tournament")}
      />
    );
  }

  const teamA = findTeamById(tournament, tournament.currentPair[0]);
  const teamB = findTeamById(tournament, tournament.currentPair[1]);
  if (!teamA || !teamB) {
    return (
      <TournamentRecoveryState
        kind="invalid"
        onBack={() => router.push("/timer/tournament")}
      />
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-[920px] flex-col px-4 pb-12 sm:px-6">
      <header className="flex items-center gap-3 py-5 sm:py-7">
        <button
          type="button"
          onClick={() => router.push("/timer/tournament")}
          aria-label={t("back")}
          className="press grid size-10 shrink-0 place-items-center rounded-xl border border-arena-border bg-arena-surface text-arena-text-sec transition-colors hover:text-arena-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-primary"
        >
          <ArrowLeft size={19} aria-hidden="true" />
        </button>
        <Logo variant="white" size="header" className="shrink-0" />
        <span
          className="h-7 w-px shrink-0 bg-arena-border"
          aria-hidden="true"
        />
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-arena-primary">
            {t("kicker")}
          </p>
          <h1 className="truncate font-sora text-xl font-extrabold text-arena-text">
            {tournament.name || t("fallbackName")}
          </h1>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(300px,.95fr)]">
        <div className="flex flex-col gap-6">
          {teamA && teamB ? (
            <TournamentPairing
              teamA={teamA}
              teamB={teamB}
              starting={starting}
              onStart={handleStartMatch}
            />
          ) : null}
          <TournamentQueue tournament={tournament} />
        </div>
        <div className="flex flex-col gap-6">
          <StandingsTable tournament={tournament} />
          {actionError ? (
            <p role="alert" className="text-sm text-arena-danger">
              {t("actionError")}
            </p>
          ) : null}
          {tournament.matches.length > 0 ? (
            <button
              type="button"
              onClick={handleEndTournament}
              disabled={ending}
              className="btn-press flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-arena-danger/35 text-sm font-bold text-arena-danger transition-colors hover:bg-arena-danger/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-arena-danger"
            >
              <Flag size={17} aria-hidden="true" />{" "}
              {ending ? t("ending") : t("endTournament")}
            </button>
          ) : null}
        </div>
      </div>
    </main>
  );
}
