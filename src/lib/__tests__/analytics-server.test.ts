import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieValue: undefined as string | undefined,
  initialize: vi.fn().mockResolvedValue(undefined),
  logEvent: vi.fn(),
  statsigConstructor: vi.fn(),
  userConstructor: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() =>
      mocks.cookieValue === undefined
        ? undefined
        : { value: mocks.cookieValue },
    ),
  })),
}));

vi.mock("@statsig/statsig-node-core", () => ({
  Statsig: class {
    initialize = mocks.initialize;
    logEvent = mocks.logEvent;

    constructor(key: string) {
      mocks.statsigConstructor(key);
    }
  },
  StatsigUser: class {
    userID: string;

    constructor(args: { userID: string }) {
      this.userID = args.userID;
      mocks.userConstructor(args);
    }
  },
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  mocks.cookieValue = undefined;
  mocks.initialize.mockResolvedValue(undefined);
  mocks.logEvent.mockReturnValue(undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
});

afterEach(() => {
  delete process.env.STATSIG_SERVER_SECRET_KEY;
  vi.restoreAllMocks();
});

describe("hasAnalyticsConsent", () => {
  it.each([
    ["an absent cookie", undefined],
    ["an invalid cookie", "not-json"],
    ["an explicit refusal", '{"analytics":false}'],
  ])("denies analytics for %s", async (_label, cookieValue) => {
    mocks.cookieValue = cookieValue;
    const { hasAnalyticsConsent } = await import("@/lib/analytics-server");

    await expect(hasAnalyticsConsent()).resolves.toBe(false);
  });

  it("allows analytics for an explicit preference", async () => {
    mocks.cookieValue = '{"analytics":true}';
    const { hasAnalyticsConsent } = await import("@/lib/analytics-server");

    await expect(hasAnalyticsConsent()).resolves.toBe(true);
  });
});

describe("trackServerEvent", () => {
  it("does not initialize Statsig without analytics consent", async () => {
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    const { trackServerEvent } = await import("@/lib/analytics-server");

    await expect(
      trackServerEvent("user-1", "event_name"),
    ).resolves.toBeUndefined();
    expect(mocks.statsigConstructor).not.toHaveBeenCalled();
    expect(mocks.logEvent).not.toHaveBeenCalled();
  });

  it("does not initialize or throw when the server key is missing", async () => {
    mocks.cookieValue = '{"analytics":true}';
    const { trackServerEvent } = await import("@/lib/analytics-server");

    await expect(
      trackServerEvent("user-1", "event_name"),
    ).resolves.toBeUndefined();
    expect(mocks.statsigConstructor).not.toHaveBeenCalled();
  });

  it("logs the event with the distinct user id when consented", async () => {
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = '{"analytics":true}';
    const { trackServerEvent } = await import("@/lib/analytics-server");

    await trackServerEvent("user-1", "event_name", { team_id: 2 });

    expect(mocks.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ userID: "user-1" }),
      "event_name",
      null,
      { team_id: 2 },
    );
  });

  it("keeps Statsig initialization failures non-blocking", async () => {
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = '{"analytics":true}';
    mocks.initialize.mockRejectedValueOnce(new Error("unavailable"));
    const { trackServerEvent } = await import("@/lib/analytics-server");

    await expect(
      trackServerEvent("user-1", "event_name"),
    ).resolves.toBeUndefined();
    expect(mocks.logEvent).not.toHaveBeenCalled();
  });

  it("keeps event logging failures non-blocking", async () => {
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = '{"analytics":true}';
    mocks.logEvent.mockImplementationOnce(() => {
      throw new Error("unavailable");
    });
    const { trackServerEvent } = await import("@/lib/analytics-server");

    await expect(
      trackServerEvent("user-1", "event_name"),
    ).resolves.toBeUndefined();
  });
});
