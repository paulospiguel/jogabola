export type PlanTier = "free" | "pro" | "elite";

type PlanLimits = {
  maxTeams: number;
  maxPlayersPerTeam: number;
  maxEventsPerMonth: number;
};

export const PLAN_LIMITS = {
  free: {
    maxTeams: 3,
    maxPlayersPerTeam: 25,
    maxEventsPerMonth: 10,
  },
  pro: {
    maxTeams: 10,
    maxPlayersPerTeam: 50,
    maxEventsPerMonth: 100,
  },
  elite: {
    maxTeams: 999,
    maxPlayersPerTeam: 999,
    maxEventsPerMonth: 9999,
  },
} as const satisfies Record<PlanTier, PlanLimits>;

export const FREE_PLAN_LIMITS = PLAN_LIMITS.free;
