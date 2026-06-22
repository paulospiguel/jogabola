export type TeamSide = "A" | "B";
export type CardColor = "yellow" | "red";
export type MatchType = "jogo" | "treino";
export type TimerMode = "up" | "down";
export type MatchStatus = "idle" | "running" | "paused" | "ended";

export interface Player {
  id: string;
  name: string;
}

export interface Team {
  name: string;
  color: string;
  players: Player[];
}

export interface MatchConfig {
  mode: TimerMode;
  periodLenSec: number;
  periods: number;
  sound: boolean;
}

export interface MatchEvent {
  id: string;
  atSec: number;
  period: number;
  type: "goal" | "card";
  team: TeamSide;
  playerId: string;
  assistId?: string;
  card?: CardColor;
}

export interface MatchState {
  status: MatchStatus;
  period: number;
  /** Accumulated seconds in current period while paused. */
  accumulatedSec: number;
  /** Timestamp (ms) of last start; null when paused/idle. */
  startedAt: number | null;
  /** True once the period clock passed its target (regressivo at 0 / cronológico at periodLen). */
  inStoppage: boolean;
}

export interface Match {
  id: string;
  type: MatchType;
  createdAt: number;
  teams: Record<TeamSide, Team>;
  config: MatchConfig;
  state: MatchState;
  events: MatchEvent[];
}

/** Lightweight saved team for reuse across matches. */
export interface SavedTeam {
  id: string;
  name: string;
  color: string;
  players: Player[];
}
