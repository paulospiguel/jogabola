import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  settingsFindFirst: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  can: vi.fn(),
  canViewTeam: vi.fn(),
  isTeamOwner: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  db: {
    insert: mocks.insert,
    update: mocks.update,
    query: { teamPaymentSettings: { findFirst: mocks.settingsFindFirst } },
  },
}));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("@/lib/team-authz", () => ({
  can: mocks.can,
  canViewTeam: mocks.canViewTeam,
  isTeamOwner: mocks.isTeamOwner,
}));

const { getPublicTeamPaymentSettings } =
  await import("@/actions/team-payment-settings.actions");

const storedSettings = {
  id: 3,
  teamId: 7,
  stripeEnabled: false,
  stripeAccountId: "acct_hidden",
  mbwayEnabled: true,
  mbwayPhone: "912345678",
  mbwayName: "Capitão",
  cashEnabled: true,
  cashInstructions: "Paga no campo.",
  transferEnabled: false,
  transferIban: "PT50000000000000000000000",
  transferName: "Capitão",
  payoutReconfigureRequiredAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getPublicTeamPaymentSettings", () => {
  it("exposes only enabled payment details and no internal fields", async () => {
    mocks.getSession.mockResolvedValue(null);
    mocks.settingsFindFirst.mockResolvedValue(storedSettings);

    const result = await getPublicTeamPaymentSettings({ teamId: 7 });

    expect(result).toEqual({
      success: true,
      data: {
        payoutReconfigureRequired: false,
        stripeEnabled: false,
        stripeAccountId: null,
        mbwayEnabled: true,
        mbwayPhone: "912345678",
        mbwayName: "Capitão",
        cashEnabled: true,
        cashInstructions: "Paga no campo.",
        transferEnabled: false,
        transferIban: null,
        transferName: null,
      },
    });
  });

  it("exposes nothing while the team must reconfigure its payouts", async () => {
    mocks.getSession.mockResolvedValue(null);
    mocks.settingsFindFirst.mockResolvedValue({
      ...storedSettings,
      payoutReconfigureRequiredAt: new Date("2026-11-27T10:00:00Z"),
    });

    const result = await getPublicTeamPaymentSettings({ teamId: 7 });

    expect(result).toMatchObject({
      success: true,
      data: {
        payoutReconfigureRequired: true,
        mbwayEnabled: false,
        mbwayPhone: null,
        transferEnabled: false,
        transferIban: null,
        stripeAccountId: null,
      },
    });
    expect(JSON.stringify(result)).not.toMatch(/912345678|acct_hidden|PT50/);
  });

  it("returns null when the team has no settings", async () => {
    mocks.getSession.mockResolvedValue(null);
    mocks.settingsFindFirst.mockResolvedValue(undefined);

    await expect(getPublicTeamPaymentSettings({ teamId: 7 })).resolves.toEqual({
      success: true,
      data: null,
    });
  });
});
