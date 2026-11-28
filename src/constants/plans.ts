export type PlanTier = "free" | "basic" | "amateur" | "pro" | "champion";

export const PLAN_ORDER: readonly PlanTier[] = [
  "free",
  "basic",
  "amateur",
  "pro",
  "champion",
] as const;

export interface PlanLimits {
  maxTeams: number;
  maxPlayersPerTeam: number;
  maxEventsPerMonth: number;
  maxEmailsPerMonth: number;
  includesVirtualStaff: boolean;
}

export interface PlanPricing {
  monthlyEur: number | null;
  annualMonthlyEur: number | null;
  isFeatured: boolean;
  isContactOnly: boolean;
}

export const PLAN_LIMITS = {
  free: {
    maxTeams: 3,
    maxPlayersPerTeam: 25,
    maxEventsPerMonth: 10,
    maxEmailsPerMonth: 3,
    includesVirtualStaff: false,
  },
  basic: {
    maxTeams: 5,
    maxPlayersPerTeam: 35,
    maxEventsPerMonth: 30,
    maxEmailsPerMonth: 10,
    includesVirtualStaff: false,
  },
  amateur: {
    maxTeams: 10,
    maxPlayersPerTeam: 50,
    maxEventsPerMonth: 100,
    maxEmailsPerMonth: 25,
    includesVirtualStaff: true,
  },
  pro: {
    maxTeams: 25,
    maxPlayersPerTeam: 100,
    maxEventsPerMonth: 300,
    maxEmailsPerMonth: 100,
    includesVirtualStaff: true,
  },
  champion: {
    maxTeams: 999,
    maxPlayersPerTeam: 999,
    maxEventsPerMonth: 9999,
    maxEmailsPerMonth: 9999,
    includesVirtualStaff: true,
  },
} as const satisfies Record<PlanTier, PlanLimits>;

export const PLAN_PRICING = {
  free: {
    monthlyEur: 0,
    annualMonthlyEur: 0,
    isFeatured: false,
    isContactOnly: false,
  },
  basic: {
    monthlyEur: 4.99,
    annualMonthlyEur: 3.99,
    isFeatured: false,
    isContactOnly: false,
  },
  amateur: {
    monthlyEur: 9.99,
    annualMonthlyEur: 7.99,
    isFeatured: true,
    isContactOnly: false,
  },
  pro: {
    monthlyEur: 24.99,
    annualMonthlyEur: 19.99,
    isFeatured: false,
    isContactOnly: false,
  },
  champion: {
    monthlyEur: null,
    annualMonthlyEur: null,
    isFeatured: false,
    isContactOnly: true,
  },
} as const satisfies Record<PlanTier, PlanPricing>;

export const FREE_PLAN_LIMITS = PLAN_LIMITS.free;
