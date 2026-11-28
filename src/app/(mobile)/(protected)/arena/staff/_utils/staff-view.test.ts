import { describe, expect, it } from "vitest";
import type { TeamStaffEntry } from "@/actions/team-staff.actions";
import { STAFF_PERMISSIONS } from "@/lib/staff-permissions";
import { canManagePayments } from "@/lib/staff-ui";
import { toStaffRows } from "./staff-view";

const owner: TeamStaffEntry = {
  userId: "owner",
  name: "Dono",
  image: null,
  title: "owner",
  permissions: [...STAFF_PERMISSIONS],
  isAthlete: true,
};

const coach: TeamStaffEntry = {
  userId: "coach",
  name: "Treinador",
  image: null,
  title: "coach",
  permissions: ["match.manage", "events.manage", "attendance.manage"],
  isAthlete: false,
};

const finance: TeamStaffEntry = {
  userId: "finance",
  name: "Tesoureiro",
  image: "https://example.com/a.png",
  title: "finance",
  permissions: ["payments.manage"],
  isAthlete: true,
};

describe("toStaffRows", () => {
  it("puts the owner first and never makes it editable", () => {
    const rows = toStaffRows([coach, owner, finance], true);

    expect(rows[0].userId).toBe("owner");
    expect(rows[0].isOwner).toBe(true);
    expect(rows[0].editable).toBe(false);
    expect(rows.map(row => row.userId)).toEqual(["owner", "coach", "finance"]);
  });

  it("makes staff rows editable only for an owner viewer", () => {
    const asOwner = toStaffRows([owner, coach, finance], true);
    expect(asOwner.filter(row => row.editable).map(row => row.userId)).toEqual([
      "coach",
      "finance",
    ]);

    const asStaff = toStaffRows([owner, coach, finance], false);
    expect(asStaff.some(row => row.editable)).toBe(false);
  });

  it("orders permissions as STAFF_PERMISSIONS and drops unknown keys", () => {
    const [, coachRow] = toStaffRows(
      [
        owner,
        {
          ...coach,
          permissions: [
            "match.manage",
            "bogus.manage" as never,
            "events.manage",
            "attendance.manage",
          ],
        },
      ],
      true,
    );

    expect(coachRow.permissions).toEqual([
      "events.manage",
      "attendance.manage",
      "match.manage",
    ]);
    expect(toStaffRows([owner], true)[0].permissions).toEqual([
      ...STAFF_PERMISSIONS,
    ]);
  });

  it("reports staff count excluding the owner via rows length", () => {
    expect(toStaffRows([owner], true)).toHaveLength(1);
    expect(toStaffRows([], true)).toEqual([]);
  });
});

describe("canManagePayments", () => {
  it("allows the owner and staff with payments.manage only", () => {
    expect(canManagePayments(null)).toBe(false);
    expect(canManagePayments({ isOwner: true, permissions: [] })).toBe(true);
    expect(
      canManagePayments({ isOwner: false, permissions: ["payments.manage"] }),
    ).toBe(true);
    expect(
      canManagePayments({ isOwner: false, permissions: ["events.manage"] }),
    ).toBe(false);
  });
});
