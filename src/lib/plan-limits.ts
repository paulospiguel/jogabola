import {
  PLAN_LIMITS as CANONICAL_PLAN_LIMITS,
  type PlanTier,
} from "@/constants/plans";

export type { PlanTier };

type LegacyPlanTier = "BASE" | "PRO" | "ELITE";
type RawPlanTier = PlanTier | LegacyPlanTier | string | null | undefined;

const PLAN_TIER_ALIASES: Record<string, PlanTier> = {
  BASE: "free",
  FREE: "free",
  ELITE: "elite",
  PRO: "pro",
  base: "free",
  elite: "elite",
  free: "free",
  pro: "pro",
};

export function normalizePlanTier(planTier: RawPlanTier): PlanTier {
  return PLAN_TIER_ALIASES[String(planTier ?? "free")] ?? "free";
}

export function canCreateTeam(
  planTier: RawPlanTier,
  currentTeamCount: number,
): boolean {
  const normalizedPlanTier = normalizePlanTier(planTier);

  return currentTeamCount < CANONICAL_PLAN_LIMITS[normalizedPlanTier].maxTeams;
}
