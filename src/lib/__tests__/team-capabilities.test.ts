import { describe, expect, it } from "vitest";
import {
  buildAccessibleTeamSummaries,
  isManagementRole,
  MANAGEMENT_ROLES,
} from "../team-capabilities";

describe("isManagementRole", () => {
  it("treats owner and manager as management roles", () => {
    expect(isManagementRole("owner")).toBe(true);
    expect(isManagementRole("manager")).toBe(true);
  });

  it("does not treat coach or player as management roles", () => {
    expect(isManagementRole("coach")).toBe(false);
    expect(isManagementRole("player")).toBe(false);
  });

  it("matches the MANAGEMENT_ROLES allowlist used by canManageTeam", () => {
    expect(MANAGEMENT_ROLES).toEqual(["owner", "manager"]);
  });
});

describe("buildAccessibleTeamSummaries", () => {
  it("marks owned teams as owner/canManage", () => {
    const owned = [{ id: 1, name: "Owned FC" }];

    expect(buildAccessibleTeamSummaries(owned, [])).toEqual([
      { id: 1, name: "Owned FC", membershipRole: "owner", canManage: true },
    ]);
  });

  it("marks manager memberships as canManage", () => {
    const member = [{ id: 2, name: "Managed FC", role: "manager" }];

    expect(buildAccessibleTeamSummaries([], member)).toEqual([
      {
        id: 2,
        name: "Managed FC",
        membershipRole: "manager",
        canManage: true,
      },
    ]);
  });

  it("marks coach memberships as not canManage", () => {
    const member = [{ id: 3, name: "Coached FC", role: "coach" }];

    expect(buildAccessibleTeamSummaries([], member)).toEqual([
      { id: 3, name: "Coached FC", membershipRole: "coach", canManage: false },
    ]);
  });

  it("marks player memberships as not canManage", () => {
    const member = [{ id: 4, name: "Player FC", role: "player" }];

    expect(buildAccessibleTeamSummaries([], member)).toEqual([
      { id: 4, name: "Player FC", membershipRole: "player", canManage: false },
    ]);
  });

  it("prefers ownership over membership when a team appears in both lists", () => {
    const owned = [{ id: 5, name: "Dual FC" }];
    const member = [{ id: 5, name: "Dual FC", role: "coach" }];

    expect(buildAccessibleTeamSummaries(owned, member)).toEqual([
      { id: 5, name: "Dual FC", membershipRole: "owner", canManage: true },
    ]);
  });

  it("returns an empty list when there are no owned or member teams", () => {
    expect(buildAccessibleTeamSummaries([], [])).toEqual([]);
  });
});
