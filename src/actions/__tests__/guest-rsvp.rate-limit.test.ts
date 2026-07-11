import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const returning = vi.fn();
  const onConflictDoUpdate = vi.fn(() => ({ returning }));
  const values = vi.fn(() => ({ onConflictDoUpdate, returning }));
  return {
    attendanceFindMany: vi.fn().mockResolvedValue([]),
    deleteWhere: vi.fn().mockResolvedValue(undefined),
    guestOtpFindFirst: vi.fn(),
    insert: vi.fn(() => ({ values })),
    matchSessionFindFirst: vi.fn(),
    returning,
    sendGuestRsvpOtp: vi.fn(),
    updateSet: vi.fn(),
    userFindFirst: vi.fn(),
    values,
  };
});

vi.mock("@/db/client", () => ({
  db: {
    delete: vi.fn(() => ({ where: mocks.deleteWhere })),
    insert: mocks.insert,
    query: {
      attendance: { findMany: mocks.attendanceFindMany },
      guestEventOtp: { findFirst: mocks.guestOtpFindFirst },
      matchSessions: { findFirst: mocks.matchSessionFindFirst },
      user: { findFirst: mocks.userFindFirst },
    },
    update: vi.fn(() => ({
      set: mocks.updateSet.mockImplementation(() => ({
        where: vi.fn().mockResolvedValue(undefined),
      })),
    })),
  },
}));
vi.mock("@/lib/email", () => ({
  getEmailDeliveryErrorCode: vi.fn(),
  sendAttendanceConfirmed: vi.fn().mockResolvedValue({ success: true }),
  sendGuestRsvpOtp: mocks.sendGuestRsvpOtp,
}));
vi.mock("@/lib/event-roster-access", () => ({
  emailBelongsToTeamRoster: vi.fn().mockResolvedValue(true),
  normalizeRosterEmail: (email: string) => email.trim().toLowerCase(),
}));
vi.mock("@/lib/fines", () => ({
  hasPendingFines: vi.fn().mockResolvedValue(false),
}));
vi.mock("@/lib/posthog-server", () => ({ trackServerEvent: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { requestGuestOTP, verifyGuestOTP } = await import(
  "@/actions/guest-rsvp.actions"
);

const now = new Date("2026-07-11T20:00:00.000Z");
const event = {
  id: 4,
  title: "Treino",
  startsAt: new Date("2026-07-12T20:00:00.000Z"),
  location: "Campo",
  capacity: 14,
  status: "scheduled",
  rosterOnly: false,
  rosterPriorityHours: 0,
  teamId: 2,
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
  vi.clearAllMocks();
  mocks.matchSessionFindFirst.mockResolvedValue(event);
  mocks.userFindFirst.mockResolvedValue({
    id: "guest-user",
    email: "guest@example.com",
    name: "Guest",
  });
  mocks.returning
    .mockResolvedValueOnce([{ id: 11 }])
    .mockResolvedValueOnce([{ id: 7 }]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("guest OTP rate limiting", () => {
  it("locks the OTP on the fifth wrong attempt without revealing the limit", async () => {
    mocks.guestOtpFindFirst.mockResolvedValue({
      id: 1,
      otp: "123456",
      attempts: 4,
      lockedUntil: null,
      expiresAt: new Date(now.getTime() + 60_000),
    });

    const result = await verifyGuestOTP(
      4,
      "guest@example.com",
      "000000",
      "Guest",
    );

    expect(result.error).toBe("Código inválido ou expirado");
    expect(mocks.updateSet).toHaveBeenCalledWith(
      expect.objectContaining({
        attempts: 5,
        lockedUntil: new Date(now.getTime() + 15 * 60_000),
      }),
    );
  });

  it("rejects a locked OTP without updating attempts", async () => {
    mocks.guestOtpFindFirst.mockResolvedValue({
      id: 1,
      otp: "123456",
      attempts: 5,
      lockedUntil: new Date(now.getTime() + 60_000),
      expiresAt: new Date(now.getTime() + 60_000),
    });

    const result = await verifyGuestOTP(
      4,
      "guest@example.com",
      "123456",
      "Guest",
    );

    expect(result.error).toBe("OTP_LOCKED");
    expect(mocks.updateSet).not.toHaveBeenCalled();
  });

  it("accepts the correct OTP after previous failures when not locked", async () => {
    mocks.guestOtpFindFirst.mockResolvedValue({
      id: 1,
      otp: "123456",
      attempts: 3,
      lockedUntil: null,
      expiresAt: new Date(now.getTime() + 60_000),
    });

    const result = await verifyGuestOTP(
      4,
      "guest@example.com",
      "123456",
      "Guest",
    );

    expect(result.success).toBe(true);
  });

  it("enforces a sixty-second resend cooldown", async () => {
    mocks.guestOtpFindFirst.mockResolvedValue({
      createdAt: new Date(now.getTime() - 30_000),
      lockedUntil: null,
    });

    const result = await requestGuestOTP(4, "Guest", "guest@example.com");

    expect(result.error).toBe("OTP_COOLDOWN");
    expect(mocks.sendGuestRsvpOtp).not.toHaveBeenCalled();
  });

  it("does not let requesting a new OTP reset an active lock", async () => {
    mocks.guestOtpFindFirst.mockResolvedValue({
      createdAt: new Date(now.getTime() - 120_000),
      lockedUntil: new Date(now.getTime() + 60_000),
    });

    const result = await requestGuestOTP(4, "Guest", "guest@example.com");

    expect(result.error).toBe("OTP_LOCKED");
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});
