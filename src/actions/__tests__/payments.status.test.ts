import { describe, expect, it } from "vitest";
import { PAYMENT_OVERVIEW_STATUS, PAYMENT_STATUS } from "@/constants/payments";
import { toUiPaymentStatus } from "@/lib/payment-status";

describe("toUiPaymentStatus", () => {
  it("maps paid unverified payments to validating", () => {
    expect(toUiPaymentStatus(PAYMENT_STATUS.PAID_UNVERIFIED)).toBe(
      PAYMENT_OVERVIEW_STATUS.VALIDATING,
    );
  });

  it("maps approved payments to confirmed", () => {
    expect(toUiPaymentStatus(PAYMENT_STATUS.APPROVED)).toBe(
      PAYMENT_OVERVIEW_STATUS.CONFIRMED,
    );
  });

  it("maps rejected payments to refused", () => {
    expect(toUiPaymentStatus(PAYMENT_STATUS.REJECTED)).toBe(
      PAYMENT_OVERVIEW_STATUS.REFUSED,
    );
  });

  it("passes through an unknown status", () => {
    const unknownStatus = "processing";

    expect(toUiPaymentStatus(unknownStatus)).toBe(unknownStatus);
  });
});
