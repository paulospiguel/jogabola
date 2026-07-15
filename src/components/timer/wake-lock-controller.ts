interface WakeLockSentinelLike {
  readonly released: boolean;
  release(): Promise<void>;
  addEventListener?(type: "release", listener: () => void): void;
  removeEventListener?(type: "release", listener: () => void): void;
}

interface WakeLockControllerDependencies {
  request?: () => Promise<WakeLockSentinelLike>;
  getVisibilityState: () => DocumentVisibilityState;
  addVisibilityListener: (listener: () => void) => void;
  removeVisibilityListener: (listener: () => void) => void;
}

interface AcquisitionToken {
  generation: number;
}

interface HeldLock {
  sentinel: WakeLockSentinelLike;
  onRelease: () => void;
}

export interface WakeLockController {
  start(): void;
  stop(): void;
}

export function createWakeLockController({
  request,
  getVisibilityState,
  addVisibilityListener,
  removeVisibilityListener,
}: WakeLockControllerDependencies): WakeLockController {
  let active = false;
  let generation = 0;
  let lock: HeldLock | null = null;
  let pending: AcquisitionToken | null = null;

  const releaseSilently = (sentinel: WakeLockSentinelLike) => {
    void sentinel.release().catch(() => undefined);
  };

  const requestLock = () => {
    if (
      !active ||
      !request ||
      getVisibilityState() !== "visible" ||
      pending ||
      (lock && !lock.sentinel.released)
    ) {
      return;
    }

    const token: AcquisitionToken = { generation };
    pending = token;

    let acquisition: Promise<WakeLockSentinelLike>;
    try {
      acquisition = request();
    } catch {
      if (pending === token) pending = null;
      return;
    }

    void acquisition
      .then(sentinel => {
        if (pending === token) pending = null;
        if (!active || generation !== token.generation) {
          releaseSilently(sentinel);
          return;
        }

        const onRelease = () => {
          if (lock?.sentinel !== sentinel) return;
          lock = null;
          if (active && getVisibilityState() === "visible") requestLock();
        };
        lock = { sentinel, onRelease };
        sentinel.addEventListener?.("release", onRelease);
      })
      .catch(() => undefined)
      .finally(() => {
        if (pending === token) pending = null;
      });
  };

  const onVisibilityChange = () => {
    if (getVisibilityState() === "visible") requestLock();
  };

  return {
    start() {
      if (active || !request) return;
      active = true;
      generation += 1;
      addVisibilityListener(onVisibilityChange);
      requestLock();
    },
    stop() {
      if (!active) return;
      active = false;
      generation += 1;
      pending = null;
      removeVisibilityListener(onVisibilityChange);

      if (lock) {
        const currentLock = lock;
        lock = null;
        currentLock.sentinel.removeEventListener?.(
          "release",
          currentLock.onRelease,
        );
        releaseSilently(currentLock.sentinel);
      }
    },
  };
}
