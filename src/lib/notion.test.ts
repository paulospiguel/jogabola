import { describe, expect, it, vi } from "vitest";
import { createTesterChecker } from "./notion";

describe("createTesterChecker", () => {
  it("resolves tester emails case- and whitespace-insensitively", async () => {
    const fetcher = vi.fn(async () => new Set(["a@b.com"]));
    const isTester = createTesterChecker(fetcher);

    await expect(isTester(" A@B.com ")).resolves.toBe(true);
    await expect(isTester("other@b.com")).resolves.toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("dedupes concurrent cold fetches", async () => {
    const fetcher = vi.fn(async () => new Set(["a@b.com"]));
    const isTester = createTesterChecker(fetcher);

    await Promise.all([isTester("a@b.com"), isTester("a@b.com")]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("serves stale value without blocking after ttl expiry", async () => {
    vi.useFakeTimers();
    try {
      let call = 0;
      const fetcher = vi.fn(async () => {
        call += 1;
        return call === 1 ? new Set(["old@x.com"]) : new Set(["new@x.com"]);
      });
      const isTester = createTesterChecker(fetcher, 1000);

      await isTester("old@x.com");
      vi.advanceTimersByTime(2000);

      // stale answer returns immediately, refresh kicks off in background
      await expect(isTester("old@x.com")).resolves.toBe(true);
      expect(fetcher).toHaveBeenCalledTimes(2);

      await vi.runAllTimersAsync();
      await expect(isTester("new@x.com")).resolves.toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
