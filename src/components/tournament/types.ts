import type { Player } from "@/components/timer/types";

export interface TournamentTeam {
  id: string;
  name: string;
  color: string;
  players: Player[];
}

export type WinnerStaysMode = "always" | "maxTwoInARow";

export interface TournamentConfig {
  mode: WinnerStaysMode;
  matchLenSec: number;
  timerMode: "down" | "up";
  sound: boolean;
}

export type MatchOutcome = "regA" | "regB" | "decisionA" | "decisionB";

export type DecisionMethod = "coin" | "penalties";

export interface TournamentGoal {
  playerId: string;
  teamId: string;
  atSec: number;
}

export interface TournamentMatch {
  id: string;
  teamAId: string;
  teamBId: string;
  scoreA: number;
  scoreB: number;
  outcome: MatchOutcome;
  decisionMethod?: DecisionMethod;
  goals: TournamentGoal[];
  endedAt: number;
}

export type TournamentStatus = "setup" | "running" | "ended";

export interface Tournament {
  id: string;
  name?: string;
  createdAt: number;
  teams: TournamentTeam[];
  config: TournamentConfig;
  matches: TournamentMatch[];
  queue: string[];
  currentPair: [string, string] | null;
  status: TournamentStatus;
}
