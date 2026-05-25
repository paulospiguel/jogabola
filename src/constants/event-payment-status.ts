export const EVENT_PAYMENT_STATUS = {
  PAID: "PAID",
  REVIEW: "REVIEW",
  PENDING: "PENDING",
  RESERVE: "RESERVE",
} as const;

export type EventPaymentStatus =
  (typeof EVENT_PAYMENT_STATUS)[keyof typeof EVENT_PAYMENT_STATUS];
