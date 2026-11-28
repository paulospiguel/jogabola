import { beforeEach, describe, expect, it, vi } from "vitest";
import { matchSessions, teams } from "@/db/schema";

const mocks = vi.hoisted(() => ({
  can: vi.fn(),
  getAccessibleTeamIds: vi.fn(),
  getSession: vi.fn(),
  insert: vi.fn(),
  values: vi.fn(),
  isTeamOwner: vi.fn(),
  settingsFindFirst: vi.fn(),
  eventFindFirst: vi.fn(),
  update: vi.fn(),
  upsertTeamPaymentSettings: vi.fn(async () => ({ success: true })),
  getTeamPaymentSettings: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  db: {
    insert: mocks.insert,
    update: mocks.update,
    query: {
      teamPaymentSettings: { findFirst: mocks.settingsFindFirst },
      matchSessions: { findFirst: mocks.eventFindFirst },
    },
  },
}));
vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => (key: string) =>
    `${namespace}.${key}`,
}));
vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/team-authz", () => ({
  can: mocks.can,
  canViewTeam: vi.fn(),
  isTeamOwner: mocks.isTeamOwner,
  getAccessibleTeamIds: mocks.getAccessibleTeamIds,
}));
vi.mock("@/lib/analytics-server", () => ({ trackServerEvent: vi.fn() }));
vi.mock("@/actions/team-payment-settings.actions", () => ({
  upsertTeamPaymentSettings: mocks.upsertTeamPaymentSettings,
  getTeamPaymentSettings: mocks.getTeamPaymentSettings,
}));

const mod = await import("@/actions/match-sessions.actions");
const { createEvent, updateEvent } = mod;

const startDate = new Date("2026-12-01T20:00:00Z");

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({
    session: {},
    user: { id: "user-1", name: "User", email: "user@example.com" },
  });
  mocks.insert.mockImplementation((table: unknown) => ({
    values: (v: Record<string, unknown>) => {
      mocks.values(table, v);
      return {
        returning: async () =>
          table === teams
            ? [{ id: 99 }]
            : [
                {
                  id: 1,
                  slug: "jogo",
                  teamId: v.teamId,
                  title: "Jogo",
                  location: "Campo",
                  startsAt: startDate,
                  endsAt: null,
                  capacity: null,
                  priceCents: 0,
                  currency: "EUR",
                  paymentRequired: false,
                  paymentDeadlineHours: null,
                  rosterOnly: false,
                  rosterPriorityHours: 0,
                  status: "scheduled",
                  recurrence: "once",
                  recurrenceGroupId: null,
                  transferRequiresProof: true,
                  createdAt: startDate,
                  updatedAt: startDate,
                },
              ],
      };
    },
  }));
});

const input = {
  title: "Jogo",
  type: "game" as const,
  location: "Campo",
  startDate,
};

describe("createEvent team fallback", () => {
  it("skips roster-only teams and uses the first team with events.manage", async () => {
    mocks.getAccessibleTeamIds.mockResolvedValue([3, 5]);
    mocks.can.mockImplementation(
      async (_userId: string, teamId: number) => teamId === 5,
    );

    const result = await createEvent(input);

    expect(result.success).toBe(true);
    expect(mocks.values).toHaveBeenCalledWith(
      matchSessions,
      expect.objectContaining({ teamId: 5 }),
    );
    expect(mocks.values).not.toHaveBeenCalledWith(teams, expect.anything());
  });

  it("auto-creates a team when no accessible team allows events.manage", async () => {
    mocks.getAccessibleTeamIds.mockResolvedValue([3]);
    mocks.can.mockResolvedValue(false);

    const result = await createEvent(input);

    expect(result.success).toBe(true);
    expect(mocks.values).toHaveBeenCalledWith(
      teams,
      expect.objectContaining({
        name: "arenaCreateTeam.defaultTeamName",
        ownerId: "user-1",
      }),
    );
    expect(mocks.values).toHaveBeenCalledWith(
      matchSessions,
      expect.objectContaining({ teamId: 99 }),
    );
  });
});

describe("createEvent auto-created team slug", () => {
  it("adds a random suffix so a reused user prefix never collides", async () => {
    mocks.getAccessibleTeamIds.mockResolvedValue([]);
    mocks.can.mockResolvedValue(false);

    await createEvent(input);
    await createEvent(input);

    const slugs = mocks.values.mock.calls
      .filter(([table]) => table === teams)
      .map(([, v]) => (v as { slug: string }).slug);
    expect(slugs).toHaveLength(2);
    for (const slug of slugs) expect(slug).toMatch(/^team-user-1-[a-z0-9]{6}$/);
    expect(slugs[0]).not.toBe(slugs[1]);
  });
});

describe("createEvent payout reconfiguration", () => {
  const flagged = {
    teamId: 5,
    payoutReconfigureRequiredAt: new Date("2026-11-27T10:00:00Z"),
  };

  it("refuses enabling MB WAY from the event form while flagged", async () => {
    mocks.can.mockResolvedValue(true);
    mocks.isTeamOwner.mockResolvedValue(false);
    mocks.settingsFindFirst.mockResolvedValue(flagged);

    const result = await createEvent({
      ...input,
      teamId: 5,
      priceCents: 500,
      mbwayEnabled: true,
      mbwayPhone: "912345678",
    });

    expect(result).toEqual({
      success: false,
      error: { code: "PAYOUT_RECONFIGURE_REQUIRED" },
    });
    expect(mocks.values).not.toHaveBeenCalledWith(
      matchSessions,
      expect.anything(),
    );
  });
});

describe("event form payment settings", () => {
  const existing = {
    teamId: 5,
    stripeEnabled: false,
    stripeAccountId: "acct_should_not_be_copied",
    mbwayEnabled: true,
    mbwayPhone: "912345678",
    mbwayName: "Dono",
    cashEnabled: true,
    cashInstructions: "No campo",
    transferEnabled: true,
    transferIban: "PT50000201231234567890154",
    transferName: "Dono",
    payoutReconfigureRequired: false,
  };

  beforeEach(() => {
    mocks.can.mockResolvedValue(true);
    mocks.settingsFindFirst.mockResolvedValue({
      teamId: 5,
      payoutReconfigureRequiredAt: null,
    });
    mocks.getTeamPaymentSettings.mockResolvedValue({
      success: true,
      data: existing,
    });
  });

  function lastUpsert() {
    const calls = mocks.upsertTeamPaymentSettings.mock.calls as unknown[][];
    return calls[calls.length - 1][0] as Record<string, unknown>;
  }

  function expectPreserved(payload: Record<string, unknown>) {
    expect(payload).toMatchObject({
      teamId: 5,
      mbwayEnabled: true,
      transferEnabled: true,
      cashEnabled: true,
      stripeEnabled: false,
    });
    // Unsupplied details are left out so stored values are kept.
    for (const field of [
      "mbwayPhone",
      "mbwayName",
      "transferIban",
      "transferName",
      "cashInstructions",
      "stripeAccountId",
    ]) {
      expect(payload[field]).toBeUndefined();
    }
  }

  it("createEvent keeps bank transfer on and MB WAY details", async () => {
    await createEvent({
      ...input,
      teamId: 5,
      priceCents: 500,
      mbwayEnabled: true,
    });
    expectPreserved(lastUpsert());
  });

  it("updateEvent keeps bank transfer on and MB WAY details", async () => {
    mocks.eventFindFirst.mockResolvedValue({ teamId: 5 });
    mocks.update.mockReturnValue({
      set: () => ({
        where: () => ({
          returning: async () => [
            {
              id: 1,
              slug: "jogo",
              teamId: 5,
              title: "Jogo",
              location: "Campo",
              startsAt: startDate,
              endsAt: null,
              capacity: null,
              priceCents: 500,
              currency: "EUR",
              paymentRequired: false,
              paymentDeadlineHours: null,
              rosterOnly: false,
              rosterPriorityHours: 0,
              status: "scheduled",
              recurrence: "once",
              recurrenceGroupId: null,
              transferRequiresProof: true,
              createdAt: startDate,
              updatedAt: startDate,
            },
          ],
        }),
      }),
    });

    const result = await updateEvent(1, {
      priceCents: 500,
      mbwayEnabled: true,
    });

    expect(result.success).toBe(true);
    expectPreserved(lastUpsert());
  });

  it("passes a phone typed in the form", async () => {
    await createEvent({
      ...input,
      teamId: 5,
      priceCents: 500,
      mbwayEnabled: true,
      mbwayPhone: "911111111",
    });
    expect(lastUpsert().mbwayPhone).toBe("911111111");
  });
});

describe("match-sessions.actions exports", () => {
  it("no longer exposes the unauthenticated create actions", () => {
    expect("createMatchSession" in mod).toBe(false);
    expect("createMatchReservation" in mod).toBe(false);
  });
});
