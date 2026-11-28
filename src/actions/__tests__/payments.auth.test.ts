import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const returning = vi.fn();
  const updateWhere = vi.fn().mockResolvedValue(undefined);
  const set = vi.fn(() => ({ where: updateWhere }));
  const values = vi.fn(() => ({ returning }));
  return {
    getSession: vi.fn(),
    insert: vi.fn(() => ({ values })),
    paymentFindFirst: vi.fn(),
    reservationFindFirst: vi.fn(),
    returning,
    set,
    selectResults: [] as unknown[][],
    update: vi.fn(() => ({ set })),
    values,
  };
});

vi.mock("@/db/client", () => ({
  db: {
    insert: mocks.insert,
    query: {
      matchReservations: { findFirst: mocks.reservationFindFirst },
      payments: { findFirst: mocks.paymentFindFirst },
    },
    select: vi.fn(() => {
      const chain = {
        innerJoin: vi.fn(() => chain),
        where: vi.fn(() => ({
          limit: vi.fn(async () => mocks.selectResults.shift() ?? []),
        })),
      };
      return { from: vi.fn(() => chain) };
    }),
    update: mocks.update,
  },
}));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers(),
}));
vi.mock("@/lib/notifications", () => ({
  notifyPaymentValidationRequired: vi.fn(),
}));
vi.mock("@/lib/email", () => ({ sendPaymentProofRequest: vi.fn() }));
vi.mock("@/lib/analytics-server", () => ({ trackServerEvent: vi.fn() }));
vi.mock("@/lib/s3", () => ({
  getPresignedUploadUrl: vi.fn(),
  getR2PublicUrl: vi.fn(),
}));

const { createPayment, submitPaymentProof } = await import(
  "@/actions/payments/payments.actions"
);
const { verifyPaymentProof } = await import(
  "@/actions/payments/payment-verification.actions"
);

const paymentInput = {
  matchReservationId: 7,
  method: "cash" as const,
};

const pricedSession = {
  priceCents: 1000,
  currency: "EUR",
  transferRequiresProof: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.selectResults.length = 0;
  mocks.returning.mockResolvedValue([{ id: 9 }]);
});

describe("payment reservation authorization", () => {
  it("rejects an anonymous createPayment without a valid guest token", async () => {
    mocks.getSession.mockResolvedValue(null);
    mocks.reservationFindFirst.mockResolvedValue({
      playerId: "guest-user",
      guestAccessToken: "valid-token",
    });

    const result = await createPayment(paymentInput);

    expect(result).toEqual({
      success: false,
      error: { code: "FORBIDDEN" },
    });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("allows createPayment with the reservation guest token", async () => {
    mocks.getSession.mockResolvedValue(null);
    mocks.reservationFindFirst.mockResolvedValue({
      playerId: "guest-user",
      guestAccessToken: "valid-token",
    });

    mocks.selectResults.push([pricedSession]);
    const result = await createPayment({
      ...paymentInput,
      guestAccessToken: "valid-token",
    });

    expect(result.success).toBe(true);
    expect(mocks.reservationFindFirst).toHaveBeenCalled();
  });

  it("allows createPayment for the authenticated reservation owner", async () => {
    mocks.getSession.mockResolvedValue({
      session: {},
      user: { id: "user-1", name: "User", email: "user@example.com" },
    });
    mocks.reservationFindFirst.mockResolvedValue({
      playerId: "user-1",
      guestAccessToken: null,
    });
    mocks.selectResults.push([pricedSession]);

    const result = await createPayment(paymentInput);

    expect(result.success).toBe(true);
    expect(mocks.reservationFindFirst).toHaveBeenCalled();
  });

  it("uses the callup price and ignores a client-supplied amount", async () => {
    mocks.getSession.mockResolvedValue({
      session: {},
      user: { id: "user-1", name: "User", email: "user@example.com" },
    });
    mocks.reservationFindFirst.mockResolvedValue({
      playerId: "user-1",
      guestAccessToken: null,
    });
    mocks.selectResults.push([pricedSession]);

    const result = await createPayment({
      ...paymentInput,
      amountCents: 1,
      currency: "USD",
    } as typeof paymentInput);

    expect(result.success).toBe(true);
    expect(mocks.values).toHaveBeenCalledWith(
      expect.objectContaining({ amountCents: 1000, currency: "EUR" }),
    );
  });

  it("refuses a payment for a free callup", async () => {
    mocks.getSession.mockResolvedValue({
      session: {},
      user: { id: "user-1", name: "User", email: "user@example.com" },
    });
    mocks.reservationFindFirst.mockResolvedValue({
      playerId: "user-1",
      guestAccessToken: null,
    });
    mocks.selectResults.push([{ ...pricedSession, priceCents: 0 }]);

    const result = await createPayment(paymentInput);

    expect(result).toEqual({
      success: false,
      error: { code: "PAYMENT_NOT_REQUIRED" },
    });
    expect(mocks.insert).not.toHaveBeenCalled();
  });

  it("rejects submitPaymentProof from a different authenticated user", async () => {
    mocks.getSession.mockResolvedValue({
      session: {},
      user: { id: "stranger", name: "Other", email: "other@example.com" },
    });
    mocks.paymentFindFirst.mockResolvedValue({ matchReservationId: 7 });
    mocks.reservationFindFirst.mockResolvedValue({
      playerId: "owner",
      guestAccessToken: null,
    });

    const result = await submitPaymentProof({
      paymentId: 9,
      fileUrl: "https://example.com/proof.png",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "FORBIDDEN" },
    });
  });

  it("rejects verifyPaymentProof from a different authenticated user", async () => {
    mocks.getSession.mockResolvedValue({
      session: {},
      user: { id: "stranger", name: "Other", email: "other@example.com" },
    });
    mocks.selectResults.push([{ id: 3, paymentId: 9 }]);
    mocks.paymentFindFirst.mockResolvedValue({ matchReservationId: 7 });
    mocks.reservationFindFirst.mockResolvedValue({
      playerId: "owner",
      guestAccessToken: null,
    });

    const result = await verifyPaymentProof({
      paymentProofId: 3,
      aiCheck: {
        decision: "needs_review",
        confidence: 0.5,
        riskFlags: [],
      },
    });

    expect(result).toEqual({
      success: false,
      error: { code: "FORBIDDEN" },
    });
  });

  it("requires manual review despite a likely-valid client AI precheck", async () => {
    mocks.getSession.mockResolvedValue({
      session: {},
      user: { id: "owner", name: "Owner", email: "owner@example.com" },
    });
    mocks.selectResults.push([{ id: 3, paymentId: 9 }]);
    mocks.paymentFindFirst.mockResolvedValue({ matchReservationId: 7 });
    mocks.reservationFindFirst.mockResolvedValue({
      playerId: "owner",
      guestAccessToken: null,
    });

    const result = await verifyPaymentProof({
      paymentProofId: 3,
      aiCheck: {
        decision: "likely_valid",
        confidence: 0.99,
        riskFlags: [],
      },
    });

    expect(result.success).toBe(true);
    expect(mocks.values).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: "likely_valid",
        confidence: 99,
      }),
    );
    expect(mocks.set).toHaveBeenCalledWith(
      expect.objectContaining({ status: "review_required" }),
    );
  });
});
