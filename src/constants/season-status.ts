export const SEASON_STATUS = {
  ACTIVE: "active",
  FINISHED: "finished",
} as const;

export type SeasonStatusValue = (typeof SEASON_STATUS)[keyof typeof SEASON_STATUS];
