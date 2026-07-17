export const ATTENDANCE_STATUS = {
  CONFIRMED: "confirmed",
  PENDING: "pending",
  RESERVE: "reserve",
  CANCELLED: "cancelled",
  REJECTED: "rejected",
} as const;

export type AttendanceStatusValue =
  (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export function isCancelledStatus(status: string): boolean {
  return status === ATTENDANCE_STATUS.CANCELLED || status === "canceled";
}
