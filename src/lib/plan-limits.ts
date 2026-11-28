import {
  PLAN_LIMITS as CANONICAL_PLAN_LIMITS,
  type PlanTier,
} from "@/constants/plans";

export type { PlanTier };

type LegacyPlanTier = "BASE" | "PRO" | "ELITE" | "elite";
type RawPlanTier = PlanTier | LegacyPlanTier | string | null | undefined;

const PLAN_TIER_ALIASES: Record<string, PlanTier> = {
  BASE: "free",
  FREE: "free",
  BASIC: "basic",
  AMATEUR: "amateur",
  PRO: "pro",
  ELITE: "champion",
  CHAMPION: "champion",
  base: "free",
  free: "free",
  basic: "basic",
  amateur: "amateur",
  pro: "pro",
  elite: "champion",
  champion: "champion",
};

export function normalizePlanTier(planTier: RawPlanTier): PlanTier {
  const key = String(planTier ?? "free").trim();
  return (
    PLAN_TIER_ALIASES[key] ?? PLAN_TIER_ALIASES[key.toLowerCase()] ?? "free"
  );
}

export function canCreateTeam(
  planTier: RawPlanTier,
  currentTeamCount: number,
): boolean {
  const normalizedPlanTier = normalizePlanTier(planTier);

  return currentTeamCount < CANONICAL_PLAN_LIMITS[normalizedPlanTier].maxTeams;
}
