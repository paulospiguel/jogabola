export const EVENT_STATUS = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
} as const;

export type EventStatusValue = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];
