import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  initialize: vi.fn().mockResolvedValue(undefined),
  logEvent: vi.fn(),
  statsigConstructor: vi.fn(),
  userConstructor: vi.fn(),
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
});

afterEach(() => {
  delete process.env.STATSIG_SERVER_SECRET_KEY;
});

describe("trackServerEvent", () => {
  it("does not initialize or throw when the server key is missing", async () => {
    const { trackServerEvent } = await import("@/lib/analytics-server");

    expect(() => trackServerEvent("user-1", "event_name")).not.toThrow();
    expect(mocks.statsigConstructor).not.toHaveBeenCalled();
  });

  it("logs the event with the distinct user id", async () => {
    process.env.STATSIG_SERVER_SECRET_KEY = "secret-key";
    const { trackServerEvent } = await import("@/lib/analytics-server");

    trackServerEvent("user-1", "event_name", { team_id: 2 });

    await vi.waitFor(() => {
      expect(mocks.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({ userID: "user-1" }),
        "event_name",
        null,
        { team_id: 2 },
      );
    });
  });
});
