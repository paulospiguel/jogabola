import { describe, expect, it, vi } from "vitest";
import { transitionAnalyticsClient } from "@/lib/analytics-lifecycle";

function createClient() {
  return {
    initializeAsync: vi.fn().mockResolvedValue(undefined),
    updateRuntimeOptions: vi.fn(),
    updateUserAsync: vi.fn().mockResolvedValue(undefined),
    shutdown: vi.fn().mockResolvedValue(undefined),
  };
}

describe("transitionAnalyticsClient", () => {
  it("updates Statsig identity from anonymous to login and back to logout", async () => {
    const client = createClient();
    const anonymous = { enabled: true, userID: "anonymous" };
    const loggedIn = { enabled: true, userID: "user-1" };

    await transitionAnalyticsClient(client, anonymous, loggedIn);
    await transitionAnalyticsClient(client, loggedIn, anonymous);

    expect(client.initializeAsync).not.toHaveBeenCalled();
    expect(client.updateUserAsync).toHaveBeenNthCalledWith(1, {
      userID: "user-1",
    });
    expect(client.updateUserAsync).toHaveBeenNthCalledWith(2, {
      userID: "anonymous",
    });
  });

  it("initializes, shuts down and safely initializes again across consent changes", async () => {
    const client = createClient();
    const disabled = { enabled: false, userID: "anonymous" };
    const enabled = { enabled: true, userID: "anonymous" };

    await transitionAnalyticsClient(client, disabled, enabled);
    await transitionAnalyticsClient(client, enabled, disabled);
    await transitionAnalyticsClient(client, disabled, enabled);

    expect(client.initializeAsync).toHaveBeenCalledTimes(2);
    expect(client.shutdown).toHaveBeenCalledTimes(1);
    expect(client.updateUserAsync).toHaveBeenCalledTimes(2);
    expect(client.updateRuntimeOptions).toHaveBeenNthCalledWith(1, {
      loggingEnabled: "browser-only",
    });
    expect(client.updateRuntimeOptions).toHaveBeenNthCalledWith(2, {
      loggingEnabled: "disabled",
    });
    expect(client.updateRuntimeOptions).toHaveBeenNthCalledWith(3, {
      loggingEnabled: "browser-only",
    });
  });
});
