export enum EventType {
  GOAL = "Goal",
  ASSIST = "Assist",
  YELLOW_CARD = "Yellow Card",
  RED_CARD = "Red Card",
  SUBSTITUTION = "Substitution",
}

export enum GamePart {
  FIRST_HALF = "1st Half",
  SECOND_HALF = "2nd Half",
  EXTRA_TIME = "Extra Time",
  TRAINING = "Training",
}

export interface GameEvent {
  id: string;
  type: EventType;
  timestamp: number; // Time in seconds when it happened
  gamePart: GamePart;
  formattedTime: string;
  playerId?: string;
  playerName?: string;
  playerTeam?: "A" | "B" | null;
}

export interface MatchStats {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

// --- New Types for Team Builder ---

export enum Position {
  GK = "GK",
  DEF = "DEF",
  MID = "MID",
  FWD = "FWD",
}

export enum GameType {
  FIVE = "5 vs 5",
  SEVEN = "7 vs 7",
  ELEVEN = "11 vs 11",
}

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
}

export interface Player {
  id: string;
  name: string;
  position: Position;
  skill: number; // 1-5
  team?: "A" | "B" | null; // Assigned team
  stats?: PlayerStats; // New detailed stats
  isSubstitute?: boolean; // New: Distinguish starters from bench
}

// --- Settings Types ---

export enum TimerMode {
  COUNT_UP = "Progressive",
  COUNT_DOWN = "Regressive",
  LOOP = "Loop",
}

export interface TeamConfig {
  name: string;
  color: string; // Hex color code
}

export interface AppSettings {
  timerMode: TimerMode;
  durations: Record<GamePart, number>; // Duration in seconds for each part
  gameType: GameType;
  teamA: TeamConfig;
  teamB: TeamConfig;
}
