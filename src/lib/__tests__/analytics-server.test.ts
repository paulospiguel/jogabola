import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookieValue: undefined as string | undefined,
  flushEvents: vi.fn().mockResolvedValue(undefined),
  initialize: vi.fn().mockResolvedValue(undefined),
  logEvent: vi.fn(),
  statsigConstructor: vi.fn(),
  userConstructor: vi.fn(),
}));

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, reject, resolve };
}

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
    flushEvents = mocks.flushEvents;
    initialize = mocks.initialize;
    logEvent = mocks.logEvent;

    constructor(key: string, options?: { initTimeoutMs?: number }) {
      mocks.statsigConstructor(key, options);
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
  mocks.flushEvents.mockResolvedValue(undefined);
  mocks.initialize.mockResolvedValue(undefined);
  mocks.logEvent.mockReturnValue(undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.useRealTimers();
});

afterEach(() => {
  delete process.env.STATSIG_SERVER_SECRET_KEY;
  vi.restoreAllMocks();
});

describe("hasAnalyticsConsent", () => {
  const consentRecord = (analytics = true) =>
    JSON.stringify({
      status: analytics ? "accepted" : "declined",
      settings: { functional: analytics, analytics, marketing: analytics },
      version: 2,
      timestamp: new Date().toISOString(),
    });

  it.each([
    ["an absent cookie", undefined],
    ["an invalid cookie", "not-json"],
    ["an explicit refusal", consentRecord(false)],
    [
      "an incompatible version",
      consentRecord(true).replace('"version":2', '"version":1'),
    ],
  ])("denies analytics for %s", async (_label, cookieValue) => {
    mocks.cookieValue = cookieValue;
    const { hasAnalyticsConsent } = await import("@/lib/analytics-server");

    await expect(hasAnalyticsConsent()).resolves.toBe(false);
  });

  it("allows analytics for an explicit preference", async () => {
    mocks.cookieValue = consentRecord();
    const { hasAnalyticsConsent } = await import("@/lib/analytics-server");

    await expect(hasAnalyticsConsent()).resolves.toBe(true);
  });
});

describe("trackServerEvent", () => {
  const consentRecord = () =>
    JSON.stringify({
      status: "accepted",
      settings: { functional: true, analytics: true, marketing: true },
      version: 2,
      timestamp: new Date().toISOString(),
    });

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
    mocks.cookieValue = consentRecord();
    const { trackServerEvent } = await import("@/lib/analytics-server");

    await expect(
      trackServerEvent("user-1", "event_name"),
    ).resolves.toBeUndefined();
    expect(mocks.statsigConstructor).not.toHaveBeenCalled();
  });

  it("logs the event with the distinct user id when consented", async () => {
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = consentRecord();
    const { trackServerEvent } = await import("@/lib/analytics-server");

    await trackServerEvent("user-1", "event_name", { team_id: 2 });

    expect(mocks.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({ userID: "user-1" }),
      "event_name",
      null,
      { team_id: 2 },
    );
    expect(mocks.flushEvents).toHaveBeenCalledOnce();
    expect(mocks.statsigConstructor).toHaveBeenCalledWith("secret-key", {
      initTimeoutMs: 250,
    });
    expect(mocks.logEvent.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.flushEvents.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it("keeps Statsig initialization failures non-blocking", async () => {
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = consentRecord();
    mocks.initialize.mockRejectedValueOnce(new Error("unavailable"));
    const { trackServerEvent } = await import("@/lib/analytics-server");

    await expect(
      trackServerEvent("user-1", "event_name"),
    ).resolves.toBeUndefined();
    expect(mocks.logEvent).not.toHaveBeenCalled();
  });

  it("keeps synchronous initialization failures non-blocking", async () => {
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = consentRecord();
    mocks.initialize.mockImplementationOnce(() => {
      throw new Error("unavailable");
    });
    const { trackServerEvent } = await import("@/lib/analytics-server");

    await expect(
      trackServerEvent("user-1", "event_name"),
    ).resolves.toBeUndefined();
    expect(mocks.logEvent).not.toHaveBeenCalled();
  });

  it("stops waiting when the first Statsig initialization is pending", async () => {
    vi.useFakeTimers();
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = consentRecord();
    mocks.initialize.mockImplementationOnce(() => new Promise(() => undefined));
    const { trackServerEvent } = await import("@/lib/analytics-server");

    let settled = false;
    void trackServerEvent("user-1", "event_name").then(() => {
      settled = true;
    });
    await vi.advanceTimersByTimeAsync(1_000);
    await Promise.resolve();

    expect(settled).toBe(true);
    expect(mocks.logEvent).not.toHaveBeenCalled();
    expect(mocks.flushEvents).not.toHaveBeenCalled();
  });

  it("coalesces repeated requests while the real initialization is pending", async () => {
    vi.useFakeTimers();
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = consentRecord();
    mocks.initialize.mockImplementation(() => new Promise(() => undefined));
    const { trackServerEvent } = await import("@/lib/analytics-server");

    const first = trackServerEvent("user-1", "first_event");
    await vi.advanceTimersByTimeAsync(1_000);
    await first;
    const second = trackServerEvent("user-1", "second_event");
    await vi.advanceTimersByTimeAsync(1_000);
    await second;

    expect(mocks.statsigConstructor).toHaveBeenCalledOnce();
    expect(mocks.initialize).toHaveBeenCalledOnce();
    expect(mocks.logEvent).not.toHaveBeenCalled();
  });

  it("uses cooldown and a new generation after initialization times out", async () => {
    vi.useFakeTimers();
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = consentRecord();
    const staleInitialization = deferred();
    mocks.initialize
      .mockImplementationOnce(() => staleInitialization.promise)
      .mockResolvedValueOnce(undefined);
    const { trackServerEvent } = await import("@/lib/analytics-server");

    const timedOut = trackServerEvent("user-1", "timed_out");
    await vi.advanceTimersByTimeAsync(250);
    await timedOut;

    await trackServerEvent("user-1", "during_cooldown");
    expect(mocks.initialize).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(30_000);
    await trackServerEvent("user-1", "retry");
    expect(mocks.initialize).toHaveBeenCalledTimes(2);

    staleInitialization.resolve();
    await Promise.resolve();
    await trackServerEvent("user-1", "after_late_resolution");

    expect(mocks.initialize).toHaveBeenCalledTimes(2);
    expect(mocks.logEvent).toHaveBeenCalledTimes(2);
  });

  it("keeps event logging failures non-blocking", async () => {
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = consentRecord();
    mocks.logEvent.mockImplementationOnce(() => {
      throw new Error("unavailable");
    });
    const { trackServerEvent } = await import("@/lib/analytics-server");

    await expect(
      trackServerEvent("user-1", "event_name"),
    ).resolves.toBeUndefined();
  });

  it("keeps flush failures non-blocking", async () => {
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = consentRecord();
    mocks.flushEvents.mockRejectedValueOnce(new Error("unavailable"));
    const { trackServerEvent } = await import("@/lib/analytics-server");

    await expect(
      trackServerEvent("user-1", "event_name"),
    ).resolves.toBeUndefined();
  });

  it("recovers through cooldown after a synchronous flush failure", async () => {
    vi.useFakeTimers();
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = consentRecord();
    mocks.flushEvents
      .mockImplementationOnce(() => {
        throw new Error("unavailable");
      })
      .mockResolvedValueOnce(undefined);
    const { trackServerEvent } = await import("@/lib/analytics-server");

    await trackServerEvent("user-1", "sync_flush_failure");
    await trackServerEvent("user-1", "during_flush_cooldown");
    expect(mocks.flushEvents).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(30_000);
    await trackServerEvent("user-1", "flush_retry");
    expect(mocks.flushEvents).toHaveBeenCalledTimes(2);
  });

  it("stops waiting when event flushing times out", async () => {
    vi.useFakeTimers();
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = consentRecord();
    mocks.flushEvents.mockImplementationOnce(
      () => new Promise(() => undefined),
    );
    const { trackServerEvent } = await import("@/lib/analytics-server");

    const tracking = trackServerEvent("user-1", "event_name");
    await vi.advanceTimersByTimeAsync(1_000);

    await expect(tracking).resolves.toBeUndefined();
  });

  it("coalesces repeated requests while the real flush is pending", async () => {
    vi.useFakeTimers();
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = consentRecord();
    mocks.flushEvents.mockImplementation(() => new Promise(() => undefined));
    const { trackServerEvent } = await import("@/lib/analytics-server");

    const first = trackServerEvent("user-1", "first_event");
    await vi.advanceTimersByTimeAsync(1_000);
    await first;
    const second = trackServerEvent("user-1", "second_event");
    await vi.advanceTimersByTimeAsync(1_000);
    await second;

    expect(mocks.logEvent).toHaveBeenCalledTimes(2);
    expect(mocks.flushEvents).toHaveBeenCalledOnce();
  });

  it("uses cooldown and ignores a stale flush resolution after timeout", async () => {
    vi.useFakeTimers();
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    mocks.cookieValue = consentRecord();
    const staleFlush = deferred();
    const retryFlush = deferred();
    mocks.flushEvents
      .mockImplementationOnce(() => staleFlush.promise)
      .mockImplementationOnce(() => retryFlush.promise);
    const { trackServerEvent } = await import("@/lib/analytics-server");

    const timedOut = trackServerEvent("user-1", "timed_out_flush");
    await vi.advanceTimersByTimeAsync(250);
    await timedOut;

    await trackServerEvent("user-1", "flush_cooldown");
    expect(mocks.flushEvents).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(30_000);
    const retry = trackServerEvent("user-1", "flush_retry");
    await vi.waitFor(() => expect(mocks.flushEvents).toHaveBeenCalledTimes(2));

    staleFlush.resolve();
    await Promise.resolve();
    const joinsRetry = trackServerEvent("user-1", "joins_retry");
    expect(mocks.flushEvents).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(250);
    await Promise.all([retry, joinsRetry]);
    retryFlush.resolve();
  });

  it("does not flush without consent", async () => {
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    const { trackServerEvent } = await import("@/lib/analytics-server");

    await trackServerEvent("user-1", "event_name");

    expect(mocks.flushEvents).not.toHaveBeenCalled();
  });
});
