import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  can: vi.fn(),
  canViewTeam: vi.fn(),
  isTeamOwner: vi.fn(),
  getSession: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  settingsFindFirst: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  db: {
    insert: mocks.insert,
    update: mocks.update,
    query: {
      teamPaymentSettings: { findFirst: mocks.settingsFindFirst },
    },
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

const {
  upsertTeamPaymentSettings,
  getTeamPaymentSettings,
  getPublicTeamPaymentSettings,
  resolveTeamPaymentConfig,
} = await import("@/actions/team-payment-settings.actions");

const flaggedRow = {
  id: 1,
  teamId: 7,
  stripeEnabled: false,
  stripeAccountId: "acct_old",
  mbwayEnabled: false,
  mbwayPhone: "912345678",
  mbwayName: "Antigo Dono",
  cashEnabled: true,
  cashInstructions: null,
  transferEnabled: false,
  transferIban: "PT50000201231234567890154",
  transferName: "Antigo Dono",
  payoutReconfigureRequiredAt: new Date("2026-11-27T10:00:00Z"),
  createdAt: null,
  updatedAt: null,
};

function mockUpdate() {
  const returning = vi.fn().mockResolvedValue([{ id: 1, teamId: 7 }]);
  const where = vi.fn(() => ({ returning }));
  const set = vi.fn(() => ({ where }));
  mocks.update.mockReturnValue({ set });
  return set;
}

const input = { teamId: 7, cashEnabled: true };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({
    session: {},
    user: { id: "user-1", name: "User", email: "user@example.com" },
  });
});

describe("team payment settings authorization", () => {
  it("rejects upsert without payments.manage", async () => {
    mocks.can.mockResolvedValue(false);

    const result = await upsertTeamPaymentSettings(input);

    expect(result).toEqual({ success: false, error: { code: "FORBIDDEN" } });
    expect(mocks.can).toHaveBeenCalledWith("user-1", 7, "payments.manage");
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("writes settings with payments.manage", async () => {
    mocks.can.mockResolvedValue(true);
    mocks.settingsFindFirst.mockResolvedValue(undefined);
    const returning = vi.fn().mockResolvedValue([{ id: 1, teamId: 7 }]);
    const values = vi.fn(() => ({ returning }));
    mocks.insert.mockReturnValue({ values });

    const result = await upsertTeamPaymentSettings(input);

    expect(result.success).toBe(true);
    expect(mocks.insert).toHaveBeenCalledTimes(1);
    expect(values).toHaveBeenCalledWith(expect.objectContaining({ teamId: 7 }));
  });

  it("reads settings for any user who can view the team", async () => {
    mocks.canViewTeam.mockResolvedValue(true);
    mocks.settingsFindFirst.mockResolvedValue({ id: 1, teamId: 7 });

    const result = await getTeamPaymentSettings({ teamId: 7 });

    expect(result.success).toBe(true);
    expect(mocks.canViewTeam).toHaveBeenCalledWith("user-1", 7);
  });
});

describe("payout reconfiguration after a transfer", () => {
  it("masks payout details on every read while flagged", async () => {
    mocks.canViewTeam.mockResolvedValue(true);
    mocks.settingsFindFirst.mockResolvedValue(flaggedRow);

    const authed = await getTeamPaymentSettings({ teamId: 7 });
    const pub = await getPublicTeamPaymentSettings({ teamId: 7 });
    const config = await resolveTeamPaymentConfig(7);

    for (const result of [authed, pub]) {
      expect(result.success).toBe(true);
      if (!result.success) continue;
      expect(result.data).toMatchObject({
        payoutReconfigureRequired: true,
        mbwayPhone: null,
        mbwayName: null,
        transferIban: null,
        transferName: null,
        stripeAccountId: null,
        mbwayEnabled: false,
        transferEnabled: false,
        stripeEnabled: false,
      });
    }
    expect(JSON.stringify([authed, pub, config])).not.toMatch(
      /912345678|PT50000201231234567890154|acct_old|Antigo Dono/,
    );
    expect(config.mbway.enabled).toBe(false);
    expect(config.transfer.enabled).toBe(false);
    expect(config.stripe.enabled).toBe(false);
  });

  it("refuses staff re-enabling MB WAY while flagged", async () => {
    mocks.can.mockResolvedValue(true);
    mocks.isTeamOwner.mockResolvedValue(false);
    mocks.settingsFindFirst.mockResolvedValue(flaggedRow);

    const result = await upsertTeamPaymentSettings({
      teamId: 7,
      mbwayEnabled: true,
      mbwayPhone: "912345678",
      mbwayName: "Antigo Dono",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "PAYOUT_RECONFIGURE_REQUIRED" },
    });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("refuses the owner re-enabling without fresh details", async () => {
    mocks.can.mockResolvedValue(true);
    mocks.isTeamOwner.mockResolvedValue(true);
    mocks.settingsFindFirst.mockResolvedValue(flaggedRow);

    const result = await upsertTeamPaymentSettings({
      teamId: 7,
      transferEnabled: true,
    });

    expect(result).toEqual({
      success: false,
      error: { code: "PAYOUT_RECONFIGURE_REQUIRED" },
    });
  });

  it("lets the owner save fresh details and clears the flag", async () => {
    mocks.can.mockResolvedValue(true);
    mocks.isTeamOwner.mockResolvedValue(true);
    mocks.settingsFindFirst.mockResolvedValue(flaggedRow);
    const set = mockUpdate();

    const result = await upsertTeamPaymentSettings({
      teamId: 7,
      mbwayEnabled: true,
      mbwayPhone: "911111111",
      mbwayName: "Novo Dono",
    });

    expect(result.success).toBe(true);
    expect(set).toHaveBeenCalledWith(
      expect.objectContaining({
        mbwayEnabled: true,
        mbwayPhone: "911111111",
        mbwayName: "Novo Dono",
        payoutReconfigureRequiredAt: null,
        transferEnabled: false,
        transferIban: null,
        transferName: null,
        stripeEnabled: false,
        stripeAccountId: null,
      }),
    );
    expect(mocks.isTeamOwner).toHaveBeenCalledWith("user-1", 7);
  });

  it("reads no stale IBAN or Stripe account after the owner's MB WAY save", async () => {
    mocks.can.mockResolvedValue(true);
    mocks.isTeamOwner.mockResolvedValue(true);
    mocks.canViewTeam.mockResolvedValue(true);
    // Simulated row store: the update applies `set` onto the flagged row.
    let row: Record<string, unknown> = { ...flaggedRow };
    mocks.settingsFindFirst.mockImplementation(async () => row);
    mocks.update.mockReturnValue({
      set: (values: Record<string, unknown>) => ({
        where: () => ({
          returning: async () => {
            row = { ...row, ...values };
            return [row];
          },
        }),
      }),
    });

    const saved = await upsertTeamPaymentSettings({
      teamId: 7,
      mbwayEnabled: true,
      mbwayPhone: "911111111",
      mbwayName: "Novo Dono",
    });
    const read = await getTeamPaymentSettings({ teamId: 7 });

    expect(saved.success).toBe(true);
    expect(read.success).toBe(true);
    if (!read.success) return;
    expect(read.data).toMatchObject({
      payoutReconfigureRequired: false,
      mbwayPhone: "911111111",
      transferIban: null,
      transferName: null,
      stripeAccountId: null,
    });
    expect(JSON.stringify(read)).not.toMatch(
      /PT50000201231234567890154|acct_old|Antigo Dono/,
    );
  });

  it("keeps the flag and stale details on a staff cash-only save", async () => {
    mocks.can.mockResolvedValue(true);
    mocks.isTeamOwner.mockResolvedValue(false);
    mocks.settingsFindFirst.mockResolvedValue(flaggedRow);
    const set = mockUpdate();

    const result = await upsertTeamPaymentSettings({
      teamId: 7,
      cashEnabled: false,
      mbwayPhone: "",
      transferIban: "",
    });

    expect(result.success).toBe(true);
    const written = (set.mock.calls[0] as unknown[])[0] as Record<
      string,
      unknown
    >;
    expect(written).not.toHaveProperty("mbwayPhone");
    expect(written).not.toHaveProperty("transferIban");
    expect(written).not.toHaveProperty("payoutReconfigureRequiredAt");
  });
});
