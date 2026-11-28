import { describe, expect, it } from "vitest";
import {
  isStaffPermission,
  LEGACY_MANAGER_PERMISSIONS,
  STAFF_PERMISSIONS,
  STAFF_TITLES,
  TITLE_PRESETS,
} from "@/lib/staff-permissions";

describe("staff permission catalog", () => {
  it("director preset grants every permission", () => {
    expect([...TITLE_PRESETS.director].sort()).toEqual(
      [...STAFF_PERMISSIONS].sort(),
    );
  });

  it("other preset grants nothing", () => {
    expect(TITLE_PRESETS.other).toEqual([]);
  });

  it("has a preset for every title", () => {
    for (const title of STAFF_TITLES) {
      expect(TITLE_PRESETS[title]).toBeDefined();
    }
  });

  it("presets follow the spec", () => {
    expect([...TITLE_PRESETS.coach].sort()).toEqual(
      ["attendance.manage", "events.manage", "match.manage"].sort(),
    );
    expect(TITLE_PRESETS.finance).toEqual(["payments.manage"]);
    expect([...TITLE_PRESETS.secretary].sort()).toEqual(
      ["attendance.manage", "communication.manage", "events.manage"].sort(),
    );
  });

  it("legacy manager permissions are exactly the co-captain powers", () => {
    expect([...LEGACY_MANAGER_PERMISSIONS].sort()).toEqual(
      [
        "attendance.manage",
        "communication.manage",
        "events.manage",
        "payments.manage",
        "roster.manage",
      ].sort(),
    );
  });

  it("rejects unknown permission keys", () => {
    expect(isStaffPermission("billing.manage")).toBe(false);
    expect(isStaffPermission("events.manage")).toBe(true);
  });
});
