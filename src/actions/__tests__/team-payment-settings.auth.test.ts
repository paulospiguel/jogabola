import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  settingsFindFirst: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  userCanAccessTeam: vi.fn(),
  userIsTeamOwner: vi.fn(),
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
vi.mock("@/lib/team-access", () => ({
  userCanAccessTeam: mocks.userCanAccessTeam,
  userIsTeamOwner: mocks.userIsTeamOwner,
}));

const { getPublicTeamPaymentSettings, upsertTeamPaymentSettings } =
  await import("@/actions/team-payment-settings.actions");

function signIn(id: string) {
  mocks.getSession.mockResolvedValue({
    session: {},
    user: { id, name: "User", email: `${id}@example.test` },
  });
}

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
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("upsertTeamPaymentSettings authorization", () => {
  const input = {
    teamId: 7,
    transferEnabled: true,
    transferIban: "PT50999999999999999999999",
    transferName: "Atacante",
  };

  it("rejects a roster member who is not the team owner", async () => {
    signIn("player-1");
    mocks.userCanAccessTeam.mockResolvedValue(true);
    mocks.userIsTeamOwner.mockResolvedValue(false);

    await expect(
      upsertTeamPaymentSettings(input as never),
    ).resolves.toMatchObject({
      success: false,
      error: { code: "FORBIDDEN" },
    });
    expect(mocks.insert).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("rejects calls without a session", async () => {
    mocks.getSession.mockResolvedValue(null);

    await expect(
      upsertTeamPaymentSettings(input as never),
    ).resolves.toMatchObject({
      success: false,
      error: { code: "UNAUTHORIZED" },
    });
    expect(mocks.insert).not.toHaveBeenCalled();
  });
});

describe("getPublicTeamPaymentSettings", () => {
  it("exposes only enabled payment details and no internal fields", async () => {
    mocks.getSession.mockResolvedValue(null);
    mocks.settingsFindFirst.mockResolvedValue(storedSettings);

    const result = await getPublicTeamPaymentSettings({ teamId: 7 });

    expect(result).toEqual({
      success: true,
      data: {
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

  it("returns null when the team has no settings", async () => {
    mocks.getSession.mockResolvedValue(null);
    mocks.settingsFindFirst.mockResolvedValue(undefined);

    await expect(getPublicTeamPaymentSettings({ teamId: 7 })).resolves.toEqual({
      success: true,
      data: null,
    });
  });
});
