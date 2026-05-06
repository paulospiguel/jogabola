export type PlanTier = "BASE" | "PRO" | "ELITE";

export const PLAN_LIMITS: Record<PlanTier, { maxTeams: number }> = {
  BASE:  { maxTeams: 1 },
  PRO:   { maxTeams: 3 },
  ELITE: { maxTeams: 999 },
};

export function canCreateTeam(planTier: PlanTier, currentTeamCount: number): boolean {
  return currentTeamCount < PLAN_LIMITS[planTier].maxTeams;
}
