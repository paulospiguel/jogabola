import { PAYMENT_OVERVIEW_STATUS, PAYMENT_STATUS } from "@/constants/payments";

export function toUiPaymentStatus(status: string) {
  if (status === PAYMENT_STATUS.PAID_UNVERIFIED) {
    return PAYMENT_OVERVIEW_STATUS.VALIDATING;
  }
  if (status === PAYMENT_STATUS.APPROVED) {
    return PAYMENT_OVERVIEW_STATUS.CONFIRMED;
  }
  if (status === PAYMENT_STATUS.REJECTED) {
    return PAYMENT_OVERVIEW_STATUS.REFUSED;
  }
  return status;
}
