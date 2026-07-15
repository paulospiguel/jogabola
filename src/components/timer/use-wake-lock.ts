"use client";

import { useEffect } from "react";
import { createWakeLockController } from "./wake-lock-controller";

export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (
      !active ||
      typeof navigator === "undefined" ||
      !("wakeLock" in navigator)
    ) {
      return;
    }

    const controller = createWakeLockController({
      request: () => navigator.wakeLock.request("screen"),
      getVisibilityState: () => document.visibilityState,
      addVisibilityListener: listener =>
        document.addEventListener("visibilitychange", listener),
      removeVisibilityListener: listener =>
        document.removeEventListener("visibilitychange", listener),
    });

    controller.start();
    return () => controller.stop();
  }, [active]);
}
