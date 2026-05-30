export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  PAID_UNVERIFIED: "paid_unverified",
  REVIEW_REQUIRED: "review_required",
  APPROVED: "approved",
  FAILED: "failed",
  REJECTED: "rejected",
  REFUNDED: "refunded",
  CREDITED: "credited",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const PAYMENT_REVIEW_STATUS = {
  APPROVED: PAYMENT_STATUS.APPROVED,
  REJECTED: PAYMENT_STATUS.REJECTED,
} as const;

export type PaymentReviewStatus =
  (typeof PAYMENT_REVIEW_STATUS)[keyof typeof PAYMENT_REVIEW_STATUS];

export const PAYMENT_OVERVIEW_STATUS = {
  PENDING: "pending",
  VALIDATING: "validating",
  CONFIRMED: "confirmed",
  REFUSED: "refused",
  REFUNDED: "refunded",
  CREDITED: "credited",
} as const;

export type PaymentOverviewStatus =
  (typeof PAYMENT_OVERVIEW_STATUS)[keyof typeof PAYMENT_OVERVIEW_STATUS];

export const PAYMENT_OVERVIEW_STATUSES = [
  PAYMENT_OVERVIEW_STATUS.PENDING,
  PAYMENT_OVERVIEW_STATUS.VALIDATING,
  PAYMENT_OVERVIEW_STATUS.CONFIRMED,
  PAYMENT_OVERVIEW_STATUS.REFUSED,
  PAYMENT_OVERVIEW_STATUS.REFUNDED,
  PAYMENT_OVERVIEW_STATUS.CREDITED,
] as const;
