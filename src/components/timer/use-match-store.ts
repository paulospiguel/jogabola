"use client";

import { useCallback, useEffect, useState } from "react";
import { cueGoal, cuePeriodEnd } from "./feedback";
import { uid } from "./format";
import type {
  CardColor,
  Match,
  MatchConfig,
  MatchEvent,
  MatchType,
  Player,
  SavedTeam,
  Team,
  TeamSide,
} from "./types";

const K_MATCHES = "jb_timer_matches";
const K_TEAMS = "jb_timer_teams";

// ---------------------------------------------------------------- storage io

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function loadMatches(): Match[] {
  return read<Match[]>(K_MATCHES, []).sort((a, b) => b.createdAt - a.createdAt);
}

export function loadMatch(id: string): Match | null {
  return read<Match[]>(K_MATCHES, []).find(m => m.id === id) ?? null;
}

export function upsertMatch(match: Match): void {
  const all = read<Match[]>(K_MATCHES, []);
  const idx = all.findIndex(m => m.id === match.id);
  if (idx >= 0) all[idx] = match;
  else all.push(match);
  write(K_MATCHES, all);
}

export function deleteMatch(id: string): void {
  write(
    K_MATCHES,
    read<Match[]>(K_MATCHES, []).filter(m => m.id !== id),
  );
}

export function loadTeams(): SavedTeam[] {
  return read<SavedTeam[]>(K_TEAMS, []);
}

export function saveTeam(team: SavedTeam): void {
  const all = loadTeams();
  const idx = all.findIndex(t => t.id === team.id);
  if (idx >= 0) all[idx] = team;
  else all.push(team);
  write(K_TEAMS, all);
}

export function deleteTeam(id: string): void {
  write(
    K_TEAMS,
    loadTeams().filter(t => t.id !== id),
  );
}

// ---------------------------------------------------------------- factory

export function createMatch(
  type: MatchType,
  teamA: Team,
  teamB: Team,
  config: MatchConfig,
): Match {
  return {
    id: uid(),
    type,
    createdAt: Date.now(),
    teams: { A: teamA, B: teamB },
    config,
    state: {
      status: "idle",
      period: 1,
      accumulatedSec: 0,
      startedAt: null,
      inStoppage: false,
    },
    events: [],
  };
}

// ---------------------------------------------------------------- derivations

export function liveElapsed(
  state: Match["state"],
  now: number = Date.now(),
): number {
  return (
    state.accumulatedSec +
    (state.startedAt ? Math.max(0, (now - state.startedAt) / 1000) : 0)
  );
}

export interface DerivedClock {
  /** Seconds elapsed in the current period (uncapped). */
  elapsed: number;
  /** Main display value: counts down (regressivo) or up (cronológico), capped at period length. */
  mainSec: number;
  /** Stoppage seconds counting up once the target is reached. */
  stoppageSec: number;
  inStoppage: boolean;
  /** 0..1 progress of the current period. */
  progress: number;
  /** Absolute match second for event timestamps. */
  matchSec: number;
}

export function deriveClock(match: Match, now: number): DerivedClock {
  const len = match.config.periodLenSec;
  const elapsed = liveElapsed(match.state, now);
  const inStoppage = elapsed >= len;
  const stoppageSec = inStoppage ? elapsed - len : 0;
  const mainSec =
    match.config.mode === "down"
      ? Math.max(0, len - elapsed)
      : Math.min(elapsed, len);
  const progress = len > 0 ? Math.min(1, elapsed / len) : 0;
  const matchSec =
    (match.state.period - 1) * len + Math.min(elapsed, len) + stoppageSec;
  return { elapsed, mainSec, stoppageSec, inStoppage, progress, matchSec };
}

export function score(match: Match): Record<TeamSide, number> {
  const acc: Record<TeamSide, number> = { A: 0, B: 0 };
  for (const e of match.events) if (e.type === "goal") acc[e.team] += 1;
  return acc;
}

// ---------------------------------------------------------------- live hook

export function useLiveMatch(id: string) {
  const [match, setMatch] = useState<Match | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setMatch(loadMatch(id));
  }, [id]);

  // Tick only while running; timestamps are the source of truth so refreshes
  // recompute the clock correctly.
  useEffect(() => {
    if (match?.state.status !== "running") return;
    const i = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(i);
  }, [match?.state.status]);

  const persist = useCallback((m: Match) => {
    setMatch(m);
    upsertMatch(m);
  }, []);

  // Fire the period-end cue once when the clock crosses the target.
  useEffect(() => {
    if (!match || match.state.status !== "running" || match.state.inStoppage)
      return;
    if (liveElapsed(match.state, now) >= match.config.periodLenSec) {
      cuePeriodEnd(match.config.sound);
      persist({ ...match, state: { ...match.state, inStoppage: true } });
    }
  }, [now, match, persist]);

  const start = useCallback(() => {
    setMatch(prev => {
      if (!prev || prev.state.status === "running") return prev;
      const next: Match = {
        ...prev,
        state: { ...prev.state, status: "running", startedAt: Date.now() },
      };
      upsertMatch(next);
      return next;
    });
    setNow(Date.now());
  }, []);

  const pause = useCallback(() => {
    setMatch(prev => {
      if (!prev || prev.state.status !== "running") return prev;
      const acc = liveElapsed(prev.state);
      const next: Match = {
        ...prev,
        state: {
          ...prev.state,
          status: "paused",
          accumulatedSec: acc,
          startedAt: null,
        },
      };
      upsertMatch(next);
      return next;
    });
  }, []);

  const toggle = useCallback(() => {
    if (match?.state.status === "running") pause();
    else start();
  }, [match?.state.status, pause, start]);

  const nextPeriod = useCallback(() => {
    setMatch(prev => {
      if (!prev) return prev;
      const last = prev.state.period >= prev.config.periods;
      const next: Match = {
        ...prev,
        state: last
          ? {
              ...prev.state,
              status: "ended",
              accumulatedSec: liveElapsed(prev.state),
              startedAt: null,
            }
          : {
              status: "paused",
              period: prev.state.period + 1,
              accumulatedSec: 0,
              startedAt: null,
              inStoppage: false,
            },
      };
      upsertMatch(next);
      return next;
    });
  }, []);

  const restart = useCallback(() => {
    setMatch(prev => {
      if (!prev) return prev;
      const next: Match = {
        ...prev,
        state: {
          status: "idle",
          period: 1,
          accumulatedSec: 0,
          startedAt: null,
          inStoppage: false,
        },
        events: [],
      };
      upsertMatch(next);
      return next;
    });
  }, []);

  const endMatch = useCallback(() => {
    setMatch(prev => {
      if (!prev) return prev;
      const next: Match = {
        ...prev,
        state: {
          ...prev.state,
          status: "ended",
          accumulatedSec: liveElapsed(prev.state),
          startedAt: null,
        },
      };
      upsertMatch(next);
      return next;
    });
  }, []);

  const addGoal = useCallback(
    (team: TeamSide, playerId: string, assistId?: string) => {
      setMatch(prev => {
        if (!prev) return prev;
        const atSec = Math.round(deriveClock(prev, Date.now()).matchSec);
        const ev: MatchEvent = {
          id: uid(),
          atSec,
          period: prev.state.period,
          type: "goal",
          team,
          playerId,
          ...(assistId ? { assistId } : {}),
        };
        cueGoal(prev.config.sound);
        const next = { ...prev, events: [...prev.events, ev] };
        upsertMatch(next);
        return next;
      });
    },
    [],
  );

  const addCard = useCallback(
    (team: TeamSide, playerId: string, card: CardColor) => {
      setMatch(prev => {
        if (!prev) return prev;
        const atSec = Math.round(deriveClock(prev, Date.now()).matchSec);
        const ev: MatchEvent = {
          id: uid(),
          atSec,
          period: prev.state.period,
          type: "card",
          team,
          playerId,
          card,
        };
        const next = { ...prev, events: [...prev.events, ev] };
        upsertMatch(next);
        return next;
      });
    },
    [],
  );

  const removeEvent = useCallback((eventId: string) => {
    setMatch(prev => {
      if (!prev) return prev;
      const next = {
        ...prev,
        events: prev.events.filter(e => e.id !== eventId),
      };
      upsertMatch(next);
      return next;
    });
  }, []);

  const addPlayerToTeam = useCallback(
    (side: TeamSide, player: Player) => {
      setMatch(prev => {
        if (!prev) return prev;
        const team = prev.teams[side];
        // Avoid duplicates (same id) in case of concurrent calls.
        if (team.players.some(p => p.id === player.id)) return prev;
        const next: Match = {
          ...prev,
          teams: {
            ...prev.teams,
            [side]: { ...team, players: [...team.players, player] },
          },
        };
        upsertMatch(next);
        return next;
      });
    },
    [],
  );

  return {
    match,
    now,
    actions: {
      start,
      pause,
      toggle,
      nextPeriod,
      restart,
      endMatch,
      addGoal,
      addCard,
      removeEvent,
      addPlayerToTeam,
    },
  };
}
