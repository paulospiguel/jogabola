import { beforeEach, describe, expect, it, vi } from "vitest";
import { STAFF_PERMISSIONS } from "@/lib/staff-permissions";

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  rows: [] as unknown[],
}));

vi.mock("@/db/client", () => {
  // `where` resolves directly (getAccessibleTeamIds) or via `.limit()` (getTeamAccess).
  const where = vi.fn(() =>
    Object.assign(Promise.resolve(mocks.rows), {
      limit: vi.fn(() => Promise.resolve(mocks.rows)),
    }),
  );
  const chain = { from: vi.fn(), leftJoin: vi.fn(), where };
  chain.from.mockReturnValue(chain);
  chain.leftJoin.mockReturnValue(chain);
  mocks.select.mockImplementation(() => chain);
  return { db: { select: mocks.select } };
});

const { accessCan, accessCanView, getTeamAccess, isStaffOrOwner } =
  await import("@/lib/team-authz");
type TeamAccess = Awaited<ReturnType<typeof getTeamAccess>>;

const owner: TeamAccess = {
  teamExists: true,
  isOwner: true,
  isAthlete: false,
  staff: null,
};
const eventsStaff: TeamAccess = {
  teamExists: true,
  isOwner: false,
  isAthlete: false,
  staff: { title: "coach", permissions: ["events.manage"] },
};
const athlete: TeamAccess = {
  teamExists: true,
  isOwner: false,
  isAthlete: true,
  staff: null,
};
const missing: TeamAccess = {
  teamExists: false,
  isOwner: true,
  isAthlete: true,
  staff: { title: "director", permissions: [...STAFF_PERMISSIONS] },
};

beforeEach(() => {
  mocks.rows = [];
  mocks.select.mockClear();
});

describe("pure access checks", () => {
  it("owner can do everything", () => {
    expect(accessCan(owner, "payments.manage")).toBe(true);
    expect(accessCanView(owner)).toBe(true);
    expect(isStaffOrOwner(owner)).toBe(true);
  });

  it("staff can only do what their permissions allow", () => {
    expect(accessCan(eventsStaff, "payments.manage")).toBe(false);
    expect(accessCan(eventsStaff, "events.manage")).toBe(true);
    expect(accessCanView(eventsStaff)).toBe(true);
    expect(isStaffOrOwner(eventsStaff)).toBe(true);
  });

  it("athlete can view but not manage", () => {
    expect(accessCanView(athlete)).toBe(true);
    expect(isStaffOrOwner(athlete)).toBe(false);
    for (const permission of STAFF_PERMISSIONS) {
      expect(accessCan(athlete, permission)).toBe(false);
    }
  });

  it("nonexistent team denies everything", () => {
    expect(accessCanView(missing)).toBe(false);
    expect(isStaffOrOwner(missing)).toBe(false);
    for (const permission of STAFF_PERMISSIONS) {
      expect(accessCan(missing, permission)).toBe(false);
    }
  });
});

describe("getTeamAccess", () => {
  it("resolves an owner without a roster row", async () => {
    mocks.rows = [
      {
        ownerId: "user-1",
        staffTitle: null,
        staffPermissions: null,
        memberId: null,
      },
    ];

    await expect(getTeamAccess("user-1", 3)).resolves.toEqual({
      teamExists: true,
      isOwner: true,
      isAthlete: false,
      staff: null,
    });
  });

  it("reports a nonexistent team", async () => {
    mocks.rows = [];

    await expect(getTeamAccess("user-1", 99)).resolves.toEqual({
      teamExists: false,
      isOwner: false,
      isAthlete: false,
      staff: null,
    });
  });

  it("resolves staff who is also an athlete and drops unknown permissions", async () => {
    mocks.rows = [
      {
        ownerId: "owner-1",
        staffTitle: "finance",
        staffPermissions: ["payments.manage", "billing.manage"],
        memberId: 12,
      },
    ];

    await expect(getTeamAccess("user-2", 3)).resolves.toEqual({
      teamExists: true,
      isOwner: false,
      isAthlete: true,
      staff: { title: "finance", permissions: ["payments.manage"] },
    });
  });
});

describe("getAccessibleTeamIds", () => {
  it("merges owned, staff and roster teams without duplicates", async () => {
    const { getAccessibleTeamIds } = await import("@/lib/team-authz");
    mocks.rows = [{ id: 3 }, { id: 5 }];

    await expect(getAccessibleTeamIds("user-1")).resolves.toEqual([3, 5]);
    expect(mocks.select).toHaveBeenCalledTimes(3);
  });
});
