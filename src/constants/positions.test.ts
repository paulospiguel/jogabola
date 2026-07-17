import { describe, expect, it } from "vitest";
import * as positionsModule from "./positions";
import { getPositionIcon, POSITIONS } from "./positions";

function isLucideIconComponent(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  // lucide-react icons are React.forwardRef objects: { $$typeof, render }
  return (
    "render" in value &&
    typeof (value as { render: unknown }).render === "function"
  );
}

describe("POSITIONS", () => {
  it("exposes a Lucide icon component for every position", () => {
    const positions = Object.values(POSITIONS);
    expect(positions.length).toBeGreaterThan(0);
    for (const config of positions) {
      expect(isLucideIconComponent(config.icon)).toBe(true);
    }
  });

  it("does not expose an emoji field on any position config (runtime keys)", () => {
    for (const config of Object.values(POSITIONS)) {
      expect(Object.keys(config)).not.toContain("emoji");
      expect(config).not.toHaveProperty("emoji");
    }
  });
});

describe("getPositionIcon", () => {
  it("returns the Lucide icon for a known position", () => {
    const icon = getPositionIcon("goalkeeper");
    expect(isLucideIconComponent(icon)).toBe(true);
  });

  it("has a predictable fallback for an unknown position", () => {
    expect(getPositionIcon("nao-existe")).toBeNull();
  });

  it("has a predictable fallback for an undefined position", () => {
    expect(getPositionIcon(undefined)).toBeNull();
  });
});

describe("public API surface", () => {
  it("does not export getPositionEmoji", () => {
    expect(Object.keys(positionsModule)).not.toContain("getPositionEmoji");
    expect(
      (positionsModule as Record<string, unknown>).getPositionEmoji,
    ).toBeUndefined();
  });
});
