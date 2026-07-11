import { beforeAll, describe, expect, it, vi } from "vitest";
import { PAYMENT_OVERVIEW_STATUS, PAYMENT_STATUS } from "@/constants/payments";

vi.mock("@/db/client", () => ({ db: {} }));
vi.mock("@/lib/auth", () => ({ auth: { api: { getSession: vi.fn() } } }));
vi.mock("@/lib/email", () => ({ sendPaymentProofRequest: vi.fn() }));
vi.mock("@/lib/posthog-server", () => ({ trackServerEvent: vi.fn() }));

let toUiPaymentStatus: (status: string) => string;

beforeAll(async () => {
  const paymentsActions = await import("@/actions/payments.actions");
  toUiPaymentStatus = paymentsActions.toUiPaymentStatus;
});

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
