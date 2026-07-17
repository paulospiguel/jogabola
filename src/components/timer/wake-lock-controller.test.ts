import { describe, expect, it, type Mock, vi } from "vitest";
import { createWakeLockController } from "./wake-lock-controller";

interface TestSentinel {
  released: boolean;
  release: Mock<() => Promise<void>>;
  addEventListener: Mock<(type: "release", listener: () => void) => void>;
  removeEventListener: Mock<(type: "release", listener: () => void) => void>;
  emitRelease(): void;
}

function sentinel(): TestSentinel {
  let releaseListener: (() => void) | undefined;
  const value: TestSentinel = {
    released: false,
    release: vi.fn(async () => {
      value.released = true;
    }),
    addEventListener: vi.fn((_type: "release", listener: () => void) => {
      releaseListener = listener;
    }),
    removeEventListener: vi.fn((_type: "release", listener: () => void) => {
      if (releaseListener === listener) releaseListener = undefined;
    }),
    emitRelease() {
      value.released = true;
      releaseListener?.();
    },
  };
  return value;
}

function harness(request?: () => Promise<TestSentinel>) {
  let visibilityState: DocumentVisibilityState = "visible";
  let visibilityListener: (() => void) | undefined;
  const addVisibilityListener = vi.fn((listener: () => void) => {
    visibilityListener = listener;
  });
  const removeVisibilityListener = vi.fn((listener: () => void) => {
    if (visibilityListener === listener) visibilityListener = undefined;
  });
  const controller = createWakeLockController({
    request,
    getVisibilityState: () => visibilityState,
    addVisibilityListener,
    removeVisibilityListener,
  });

  return {
    controller,
    addVisibilityListener,
    removeVisibilityListener,
    setVisibility(next: DocumentVisibilityState) {
      visibilityState = next;
      visibilityListener?.();
    },
  };
}

describe("createWakeLockController", () => {
  it("does not start when wake lock is unsupported", () => {
    const test = harness();

    test.controller.start();

    expect(test.addVisibilityListener).not.toHaveBeenCalled();
  });

  it("requests a screen wake lock when started", async () => {
    const lock = sentinel();
    const request = vi.fn(async () => lock);
    const test = harness(request);

    test.controller.start();
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));

    expect(test.addVisibilityListener).toHaveBeenCalledTimes(1);
  });

  it("automatically reacquires once when the current lock is released", async () => {
    const first = sentinel();
    const second = sentinel();
    const request = vi
      .fn<() => Promise<TestSentinel>>()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second);
    const test = harness(request);

    test.controller.start();
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    first.emitRelease();
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(2));

    first.emitRelease();
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("starts a new request while an acquisition from a previous start is pending", async () => {
    const oldLock = sentinel();
    const newLock = sentinel();
    let resolveOld: ((value: TestSentinel) => void) | undefined;
    let resolveNew: ((value: TestSentinel) => void) | undefined;
    const request = vi
      .fn<() => Promise<TestSentinel>>()
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolveOld = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise(resolve => {
            resolveNew = resolve;
          }),
      );
    const test = harness(request);

    test.controller.start();
    test.controller.stop();
    test.controller.start();

    expect(request).toHaveBeenCalledTimes(2);
    resolveOld?.(oldLock);
    resolveNew?.(newLock);
    await vi.waitFor(() => expect(oldLock.release).toHaveBeenCalledTimes(1));
    await vi.waitFor(() => expect(newLock.addEventListener).toHaveBeenCalled());

    test.controller.stop();
    expect(newLock.release).toHaveBeenCalledTimes(1);
  });

  it("releases the current lock and listener on stop", async () => {
    const lock = sentinel();
    const test = harness(async () => lock);

    test.controller.start();
    await vi.waitFor(() => expect(lock.addEventListener).toHaveBeenCalled());
    test.controller.stop();

    expect(lock.release).toHaveBeenCalledTimes(1);
    expect(test.removeVisibilityListener).toHaveBeenCalledTimes(1);
  });

  it("releases a lock that resolves after stop", async () => {
    const lock = sentinel();
    let resolveRequest: ((value: TestSentinel) => void) | undefined;
    const pending = new Promise<TestSentinel>(resolve => {
      resolveRequest = resolve;
    });
    const test = harness(() => pending);

    test.controller.start();
    test.controller.stop();
    resolveRequest?.(lock);

    await vi.waitFor(() => expect(lock.release).toHaveBeenCalledTimes(1));
  });

  it("silently handles a refused wake lock request", async () => {
    const request = vi.fn(() => Promise.reject(new Error("Not allowed")));
    const test = harness(request);

    expect(() => test.controller.start()).not.toThrow();
    await vi.waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    test.controller.stop();
  });
});
