import { describe, expect, it, vi } from "vitest";
import {
  AnalyticsLifecycleController,
  transitionAnalyticsClient,
} from "@/lib/analytics-lifecycle";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>(done => {
    resolve = done;
  });
  return { promise, resolve };
}

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

describe("AnalyticsLifecycleController", () => {
  it("never updates identity after consent is revoked during initialization", async () => {
    const initialization = deferred();
    const client = createClient();
    client.initializeAsync.mockImplementationOnce(() => initialization.promise);
    const controller = new AnalyticsLifecycleController(client);

    const enable = controller.transition({
      enabled: true,
      userID: "anonymous",
    });
    await vi.waitFor(() =>
      expect(client.initializeAsync).toHaveBeenCalledOnce(),
    );
    const revoke = controller.transition({
      enabled: false,
      userID: "anonymous",
    });
    initialization.resolve();

    await Promise.all([enable, revoke]);
    expect(client.updateUserAsync).not.toHaveBeenCalled();
    expect(client.shutdown).toHaveBeenCalledOnce();
    expect(controller.currentState.enabled).toBe(false);
  });

  it("reenables logging when consent returns during initialization", async () => {
    const initialization = deferred();
    const client = createClient();
    client.initializeAsync.mockImplementationOnce(() => initialization.promise);
    const controller = new AnalyticsLifecycleController(client);

    const enable = controller.transition({
      enabled: true,
      userID: "anonymous",
    });
    await vi.waitFor(() =>
      expect(client.initializeAsync).toHaveBeenCalledOnce(),
    );
    const revoke = controller.transition({
      enabled: false,
      userID: "anonymous",
    });
    const reactivate = controller.transition({
      enabled: true,
      userID: "anonymous",
    });
    initialization.resolve();

    await Promise.all([enable, revoke, reactivate]);
    expect(client.updateRuntimeOptions).toHaveBeenLastCalledWith({
      loggingEnabled: "browser-only",
    });
    expect(controller.currentState.enabled).toBe(true);
  });

  it("does not lose a synchronous disabled no-op followed by enable", async () => {
    const client = createClient();
    const controller = new AnalyticsLifecycleController(client);

    const noOp = controller.transition({ enabled: false, userID: "anonymous" });
    const enable = controller.transition({ enabled: true, userID: "user-1" });

    await Promise.all([noOp, enable]);
    expect(client.initializeAsync).toHaveBeenCalledOnce();
    expect(client.updateUserAsync).toHaveBeenCalledWith({ userID: "user-1" });
    expect(controller.currentState).toEqual({
      enabled: true,
      userID: "user-1",
    });
  });

  it("does not lose a synchronous enabled no-op followed by revoke", async () => {
    const client = createClient();
    const controller = new AnalyticsLifecycleController(client, {
      enabled: true,
      userID: "user-1",
    });

    const noOp = controller.transition({ enabled: true, userID: "user-1" });
    const revoke = controller.transition({ enabled: false, userID: "user-1" });

    await Promise.all([noOp, revoke]);
    expect(client.shutdown).toHaveBeenCalledOnce();
    expect(controller.currentState.enabled).toBe(false);
  });

  it("coalesces hydration from anonymous to the authenticated user", async () => {
    const firstIdentity = deferred();
    const client = createClient();
    client.updateUserAsync
      .mockImplementationOnce(() => firstIdentity.promise)
      .mockResolvedValue(undefined);
    const controller = new AnalyticsLifecycleController(client);

    const hydrate = controller.transition({
      enabled: true,
      userID: "anonymous",
    });
    await vi.waitFor(() =>
      expect(client.updateUserAsync).toHaveBeenCalledOnce(),
    );
    const login = controller.transition({ enabled: true, userID: "user-1" });
    firstIdentity.resolve();

    await Promise.all([hydrate, login]);
    expect(client.updateUserAsync).toHaveBeenNthCalledWith(2, {
      userID: "user-1",
    });
    expect(controller.currentState).toEqual({
      enabled: true,
      userID: "user-1",
    });
  });

  it("serializes revoke then reactivate without stale shutdown", async () => {
    const shutdown = deferred();
    const client = createClient();
    client.shutdown.mockImplementationOnce(() => shutdown.promise);
    const controller = new AnalyticsLifecycleController(client, {
      enabled: true,
      userID: "anonymous",
    });

    const revoke = controller.transition({
      enabled: false,
      userID: "anonymous",
    });
    await vi.waitFor(() => expect(client.shutdown).toHaveBeenCalledOnce());
    const reactivate = controller.transition({
      enabled: true,
      userID: "user-1",
    });

    expect(client.updateRuntimeOptions).toHaveBeenCalledWith({
      loggingEnabled: "disabled",
    });
    expect(client.initializeAsync).not.toHaveBeenCalled();

    shutdown.resolve();
    await Promise.all([revoke, reactivate]);

    expect(client.initializeAsync).toHaveBeenCalledOnce();
    expect(client.updateUserAsync).toHaveBeenLastCalledWith({
      userID: "user-1",
    });
    expect(controller.currentState).toEqual({
      enabled: true,
      userID: "user-1",
    });
  });

  it("applies logout after an in-flight authenticated identity update", async () => {
    const loginIdentity = deferred();
    const client = createClient();
    client.updateUserAsync
      .mockImplementationOnce(() => loginIdentity.promise)
      .mockResolvedValue(undefined);
    const controller = new AnalyticsLifecycleController(client, {
      enabled: true,
      userID: "anonymous",
    });

    const login = controller.transition({ enabled: true, userID: "user-1" });
    await vi.waitFor(() =>
      expect(client.updateUserAsync).toHaveBeenCalledOnce(),
    );
    const logout = controller.transition({
      enabled: true,
      userID: "anonymous",
    });
    loginIdentity.resolve();

    await Promise.all([login, logout]);
    expect(client.updateUserAsync).toHaveBeenNthCalledWith(2, {
      userID: "anonymous",
    });
    expect(controller.currentState).toEqual({
      enabled: true,
      userID: "anonymous",
    });
  });

  it("fails closed after a concurrent identity update rejects", async () => {
    const client = createClient();
    client.updateUserAsync.mockRejectedValueOnce(new Error("unavailable"));
    const controller = new AnalyticsLifecycleController(client, {
      enabled: true,
      userID: "anonymous",
    });

    const userOne = controller.transition({ enabled: true, userID: "user-1" });
    controller.transition({ enabled: true, userID: "user-2" });

    await expect(userOne).rejects.toThrow("unavailable");
    expect(client.updateRuntimeOptions).toHaveBeenLastCalledWith({
      loggingEnabled: "disabled",
    });
    expect(controller.currentState).toEqual({
      enabled: false,
      userID: "anonymous",
    });

    await controller.transition({ enabled: true, userID: "user-2" });
    expect(client.initializeAsync).toHaveBeenCalledOnce();
    expect(client.updateUserAsync).toHaveBeenLastCalledWith({
      userID: "user-2",
    });
  });
});
