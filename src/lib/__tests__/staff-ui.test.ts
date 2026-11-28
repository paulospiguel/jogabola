import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { STAFF_PERMISSIONS, STAFF_TITLES } from "@/lib/staff-permissions";
import {
  addPlayerErrorKey,
  canDo,
  canRemoveFromRoster,
  getStaffAction,
  invalidateRosterQueries,
  invalidateStaffChange,
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

describe("canDo", () => {
  it("denies without a team", () => {
    expect(canDo(null, "events.manage")).toBe(false);
    expect(canDo(undefined, "roster.manage")).toBe(false);
  });

  it("allows the owner every permission", () => {
    for (const permission of STAFF_PERMISSIONS) {
      expect(canDo({ isOwner: true, permissions: [] }, permission)).toBe(true);
    }
  });

  it("allows staff only the permissions they hold", () => {
    const finance = {
      isOwner: false,
      permissions: ["payments.manage" as const],
    };
    expect(canDo(finance, "payments.manage")).toBe(true);
    expect(canDo(finance, "events.manage")).toBe(false);
    expect(canDo(finance, "roster.manage")).toBe(false);
  });
});

describe("addPlayerErrorKey", () => {
  it("maps known codes and falls back to UNKNOWN_ERROR", () => {
    expect(addPlayerErrorKey("FORBIDDEN")).toBe("errors.FORBIDDEN");
    expect(addPlayerErrorKey("SOMETHING")).toBe("errors.UNKNOWN_ERROR");
    expect(addPlayerErrorKey(undefined)).toBe("errors.UNKNOWN_ERROR");
  });
});

describe("canRemoveFromRoster", () => {
  const plain = { isTeamOwner: false, staffTitle: null };
  it("never offers removing the owner", () => {
    expect(
      canRemoveFromRoster(
        { isOwner: true, permissions: [] },
        { isTeamOwner: true, staffTitle: null },
      ),
    ).toBe(false);
  });
  it("requires roster.manage", () => {
    expect(canRemoveFromRoster(null, plain)).toBe(false);
    expect(
      canRemoveFromRoster(
        { isOwner: false, permissions: ["events.manage"] },
        plain,
      ),
    ).toBe(false);
    expect(
      canRemoveFromRoster(
        { isOwner: false, permissions: ["roster.manage"] },
        plain,
      ),
    ).toBe(true);
  });
  it("lets only the owner remove a staff member from the roster", () => {
    const staff = { isTeamOwner: false, staffTitle: "coach" as const };
    expect(
      canRemoveFromRoster(
        { isOwner: false, permissions: ["roster.manage"] },
        staff,
      ),
    ).toBe(false);
    expect(canRemoveFromRoster({ isOwner: true, permissions: [] }, staff)).toBe(
      true,
    );
  });
});

describe("invalidateStaffChange", () => {
  it("refreshes the team staff list, athlete profile and roster", async () => {
    const calls: unknown[] = [];
    await invalidateStaffChange(
      { invalidateQueries: filters => calls.push(filters.queryKey) },
      7,
    );
    expect(calls).toEqual([
      ["team-staff", 7],
      ["athlete-profile"],
      ["squad"],
      ["dashboard", "squad"],
    ]);
  });
});
