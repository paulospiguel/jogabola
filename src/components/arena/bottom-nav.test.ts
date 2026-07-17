import { describe, expect, it } from "vitest";
import { BOTTOM_NAV_ITEMS, isBottomNavItemActive } from "./bottom-nav-items";

describe("BOTTOM_NAV_ITEMS", () => {
  it("has exactly five destinations", () => {
    expect(BOTTOM_NAV_ITEMS).toHaveLength(5);
  });

  it("keeps Equipa, Plantel, Eventos, Cobranças and Perfil", () => {
    expect(BOTTOM_NAV_ITEMS.map(item => item.href)).toEqual([
      "/arena",
      "/arena/squads",
      "/arena/events",
      "/arena/payments",
      "/arena/profile",
    ]);
  });

  it("never includes the Cronómetro destination", () => {
    expect(BOTTOM_NAV_ITEMS.some(item => item.href === "/timer")).toBe(false);
  });

  it("has a unique labelKey for every destination", () => {
    const labelKeys = BOTTOM_NAV_ITEMS.map(item => item.labelKey);
    expect(new Set(labelKeys).size).toBe(labelKeys.length);
  });
});

describe("isBottomNavItemActive", () => {
  it("matches the dashboard only on the exact path", () => {
    expect(isBottomNavItemActive("/arena", "/arena")).toBe(true);
    expect(isBottomNavItemActive("/arena", "/arena/events")).toBe(false);
  });

  it("matches subroutes of a non-dashboard destination", () => {
    expect(isBottomNavItemActive("/arena/events", "/arena/events")).toBe(true);
    expect(isBottomNavItemActive("/arena/events", "/arena/events/123")).toBe(
      true,
    );
  });

  it("does not match unrelated destinations", () => {
    expect(isBottomNavItemActive("/arena/events", "/arena/squads")).toBe(false);
  });
});
