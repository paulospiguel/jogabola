import { describe, expect, it } from "vitest";
import { PLAN_LIMITS, PLAN_ORDER, PLAN_PRICING } from "@/constants/plans";
import { canCreateTeam, normalizePlanTier } from "./plan-limits";

describe("plan-limits", () => {
  it("exposes the 5 progressive club plan tiers in order", () => {
    expect(PLAN_ORDER).toEqual(["free", "basic", "amateur", "pro", "champion"]);
  });

  it("normalizes canonical and legacy plan tiers safely", () => {
    expect(normalizePlanTier("free")).toBe("free");
    expect(normalizePlanTier("BASE")).toBe("free");
    expect(normalizePlanTier("basic")).toBe("basic");
    expect(normalizePlanTier("AMATEUR")).toBe("amateur");
    expect(normalizePlanTier("pro")).toBe("pro");
    expect(normalizePlanTier("ELITE")).toBe("champion");
    expect(normalizePlanTier("elite")).toBe("champion");
    expect(normalizePlanTier("champion")).toBe("champion");
    expect(normalizePlanTier("unknown-tier")).toBe("free");
    expect(normalizePlanTier(null)).toBe("free");
  });

  it("enforces monotonically increasing team limits across tiers", () => {
    expect(canCreateTeam("free", 2)).toBe(true);
    expect(canCreateTeam("free", 3)).toBe(false);
    expect(canCreateTeam("basic", 4)).toBe(true);
    expect(canCreateTeam("basic", 5)).toBe(false);
    expect(canCreateTeam("amateur", 9)).toBe(true);
    expect(canCreateTeam("amateur", 10)).toBe(false);
    expect(canCreateTeam("pro", 24)).toBe(true);
    expect(canCreateTeam("pro", 25)).toBe(false);
    expect(canCreateTeam("champion", 200)).toBe(true);
    expect(canCreateTeam("ELITE", 200)).toBe(true);
  });

  it("keeps virtual staff gated to amateur and above and marks champion contact-only", () => {
    expect(PLAN_LIMITS.free.includesVirtualStaff).toBe(false);
    expect(PLAN_LIMITS.basic.includesVirtualStaff).toBe(false);
    expect(PLAN_LIMITS.amateur.includesVirtualStaff).toBe(true);
    expect(PLAN_LIMITS.pro.includesVirtualStaff).toBe(true);
    expect(PLAN_LIMITS.champion.includesVirtualStaff).toBe(true);
    expect(PLAN_PRICING.champion.isContactOnly).toBe(true);
    expect(PLAN_PRICING.free.monthlyEur).toBe(0);
  });
});
