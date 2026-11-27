import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { STAFF_PERMISSIONS, STAFF_TITLES } from "@/lib/staff-permissions";
import {
  getStaffAction,
  invalidateRosterQueries,
  permissionLabelKey,
  staffErrorKey,
  togglePermission,
} from "@/lib/staff-ui";

const athlete = { isRegistered: true, isTeamOwner: false, staffTitle: null };

describe("getStaffAction", () => {
  it("offers promote to the owner on a registered non-staff athlete", () => {
    expect(getStaffAction(true, athlete)).toBe("promote");
  });

  it("offers demote to the owner on a staff member", () => {
    expect(getStaffAction(true, { ...athlete, staffTitle: "coach" })).toBe(
      "demote",
    );
  });

  it("hides both actions from non-owner viewers", () => {
    expect(getStaffAction(false, athlete)).toBeNull();
    expect(getStaffAction(false, { ...athlete, staffTitle: "coach" })).toBe(
      null,
    );
  });

  it("never targets the team owner", () => {
    expect(getStaffAction(true, { ...athlete, isTeamOwner: true })).toBeNull();
  });

  it("does not offer promote for an unregistered guest", () => {
    expect(getStaffAction(true, { ...athlete, isRegistered: false })).toBe(
      null,
    );
  });
});

describe("togglePermission", () => {
  it("adds and removes while keeping catalog order", () => {
    expect(togglePermission(["match.manage"], "events.manage")).toEqual([
      "events.manage",
      "match.manage",
    ]);
    expect(
      togglePermission(["events.manage", "match.manage"], "events.manage"),
    ).toEqual(["match.manage"]);
  });
});

describe("labels and errors", () => {
  it("derives the permission label key", () => {
    expect(permissionLabelKey("payments.manage")).toBe("payments");
  });

  it("maps known codes and falls back to UNKNOWN_ERROR", () => {
    expect(staffErrorKey("NOT_STAFF")).toBe("errors.NOT_STAFF");
    expect(staffErrorKey("BOOM")).toBe("errors.UNKNOWN_ERROR");
    expect(staffErrorKey(undefined)).toBe("errors.UNKNOWN_ERROR");
  });
});

describe("teamStaff locale coverage", () => {
  it.each([
    "pt",
    "en",
    "es",
    "fr",
  ])("%s has every title and permission label", locale => {
    const messages = JSON.parse(
      readFileSync(resolve(__dirname, `../../locales/${locale}.json`), "utf8"),
    );
    for (const title of STAFF_TITLES) {
      expect(messages.teamStaff.titles[title]).toBeTypeOf("string");
    }
    for (const permission of STAFF_PERMISSIONS) {
      expect(
        messages.teamStaff.permissions[permissionLabelKey(permission)],
      ).toBeTypeOf("string");
    }
  });
});

describe("invalidateRosterQueries", () => {
  it("invalidates the squad and dashboard squad queries", async () => {
    const calls: unknown[] = [];
    await invalidateRosterQueries({
      invalidateQueries: filters => calls.push(filters.queryKey),
    });
    expect(calls).toEqual([["squad"], ["dashboard", "squad"]]);
  });
});
