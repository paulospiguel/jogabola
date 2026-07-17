import { describe, expect, it, vi } from "vitest";
import type { Payment } from "@/hooks/use-payments";
import {
  derivePaymentsPageQueryState,
  type RawQuerySnapshot,
} from "./use-payments-page-state";

function makeSnapshot<T>(
  overrides: Partial<RawQuerySnapshot<T>> = {},
): RawQuerySnapshot<T> {
  return {
    data: undefined,
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
}

const samplePayment: Payment = {
  id: "1",
  amount: "10,00 €",
  method: "mbway",
  status: "confirmed",
  score: "low",
  date: "2026-07-10T10:00:00.000Z",
  player: {
    id: "p1",
    name: "Ana",
    isVerified: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  },
  event: {
    id: 1,
    title: "Jogo semanal",
    status: "scheduled",
  },
};

interface SampleSettings {
  mbwayEnabled: boolean;
}

const sampleSettings: SampleSettings = { mbwayEnabled: true };

describe("derivePaymentsPageQueryState", () => {
  it("keeps settings visible and unaffected when the payments query errors", () => {
    const result = derivePaymentsPageQueryState<SampleSettings>({
      payments: makeSnapshot<Payment[]>({ error: new Error("boom") }),
      settings: makeSnapshot<SampleSettings>({ data: sampleSettings }),
    });

    expect(result.paymentsState.error).toBeInstanceOf(Error);
    expect(result.paymentsState.payments).toEqual([]);
    expect(result.settingsState.error).toBeNull();
    expect(result.settingsState.settings).toEqual(sampleSettings);
  });

  it("keeps payments visible and unaffected when the settings query errors", () => {
    const payments = [samplePayment];
    const result = derivePaymentsPageQueryState<SampleSettings>({
      payments: makeSnapshot<Payment[]>({ data: payments }),
      settings: makeSnapshot<SampleSettings>({ error: new Error("boom") }),
    });

    expect(result.settingsState.error).toBeInstanceOf(Error);
    expect(result.settingsState.settings).toBeUndefined();
    expect(result.paymentsState.error).toBeNull();
    expect(result.paymentsState.payments).toEqual(payments);
  });

  it("produces two independent local errors when both queries fail", () => {
    const paymentsError = new Error("payments failed");
    const settingsError = new Error("settings failed");

    const result = derivePaymentsPageQueryState<SampleSettings>({
      payments: makeSnapshot<Payment[]>({ error: paymentsError }),
      settings: makeSnapshot<SampleSettings>({ error: settingsError }),
    });

    expect(result.paymentsState.error).toBe(paymentsError);
    expect(result.settingsState.error).toBe(settingsError);
  });

  it("keeps each section's retry wired to the correct query's refetch callback", () => {
    const paymentsRefetch = vi.fn();
    const settingsRefetch = vi.fn();

    const result = derivePaymentsPageQueryState<SampleSettings>({
      payments: makeSnapshot<Payment[]>({ refetch: paymentsRefetch }),
      settings: makeSnapshot<SampleSettings>({ refetch: settingsRefetch }),
    });

    expect(result.paymentsState.refetch).toBe(paymentsRefetch);
    expect(result.settingsState.refetch).toBe(settingsRefetch);
    expect(result.paymentsState.refetch).not.toBe(result.settingsState.refetch);

    result.paymentsState.refetch();
    expect(paymentsRefetch).toHaveBeenCalledTimes(1);
    expect(settingsRefetch).not.toHaveBeenCalled();
  });

  it("preserves previous payments while a refetch is in flight", () => {
    const payments = [samplePayment];

    const result = derivePaymentsPageQueryState<SampleSettings>({
      payments: makeSnapshot<Payment[]>({ data: payments, isFetching: true }),
      settings: makeSnapshot<SampleSettings>({}),
    });

    expect(result.paymentsState.payments).toEqual(payments);
    expect(result.paymentsState.isFetching).toBe(true);
  });

  it("treats an empty payments array after a successful fetch as empty, never as an error", () => {
    const result = derivePaymentsPageQueryState<SampleSettings>({
      payments: makeSnapshot<Payment[]>({ data: [] }),
      settings: makeSnapshot<SampleSettings>({ data: sampleSettings }),
    });

    expect(result.paymentsState.payments).toEqual([]);
    expect(result.paymentsState.error).toBeNull();
  });

  it("defaults missing payments data to an empty array, and missing settings to undefined", () => {
    const result = derivePaymentsPageQueryState<SampleSettings>({
      payments: makeSnapshot<Payment[]>({ isLoading: true }),
      settings: makeSnapshot<SampleSettings>({ isLoading: true }),
    });

    expect(result.paymentsState.payments).toEqual([]);
    expect(result.paymentsState.isInitialLoading).toBe(true);
    expect(result.settingsState.settings).toBeUndefined();
    expect(result.settingsState.isInitialLoading).toBe(true);
  });
});
