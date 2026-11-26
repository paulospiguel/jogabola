import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  can: vi.fn(),
  canViewTeam: vi.fn(),
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
}));

const { upsertTeamPaymentSettings, getTeamPaymentSettings } = await import(
  "@/actions/team-payment-settings.actions"
);

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
