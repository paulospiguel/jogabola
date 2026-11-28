import { describe, expect, it, vi } from "vitest";
import { STAFF_PERMISSIONS } from "@/lib/staff-permissions";

vi.mock("@/db/client", () => ({ db: {} }));

const { buildTeamSummaries } = await import("@/lib/team-summaries");

const team = (id: number, name: string, ownerId = "someone-else") => ({
  id,
  name,
  ownerId,
});

describe("buildTeamSummaries", () => {
  it("marks owned teams as owner with full presentation permissions", () => {
    const [summary] = buildTeamSummaries("me", [team(1, "A", "me")], {
      staff: [],
      rosterTeamIds: [],
    });

    expect(summary).toMatchObject({
      id: 1,
      isOwner: true,
      isAthlete: false,
      staffTitle: null,
      permissions: [...STAFF_PERMISSIONS],
      canManage: true,
      membershipRole: "owner",
    });
  });

  it("marks staff teams with title and permissions", () => {
    const [summary] = buildTeamSummaries("me", [team(2, "B")], {
      staff: [
        { teamId: 2, title: "finance", permissions: ["payments.manage"] },
      ],
      rosterTeamIds: [2],
    });

    expect(summary).toMatchObject({
      isOwner: false,
      isAthlete: true,
      staffTitle: "finance",
      permissions: ["payments.manage"],
      canManage: true,
      membershipRole: "staff",
    });
  });

  it("marks roster-only teams as player without management", () => {
    const [summary] = buildTeamSummaries("me", [team(3, "C")], {
      staff: [],
      rosterTeamIds: [3],
    });

    expect(summary).toMatchObject({
      isOwner: false,
      isAthlete: true,
      staffTitle: null,
      permissions: [],
      canManage: false,
      membershipRole: "player",
    });
  });

  it("drops unknown permissions and sorts by name", () => {
    const summaries = buildTeamSummaries(
      "me",
      [team(5, "Zeta"), team(4, "Alfa")],
      {
        staff: [
          { teamId: 5, title: "weird", permissions: ["nope", "events.manage"] },
        ],
        rosterTeamIds: [4],
      },
    );

    expect(summaries.map(s => s.name)).toEqual(["Alfa", "Zeta"]);
    expect(summaries[1]).toMatchObject({
      staffTitle: "other",
      permissions: ["events.manage"],
    });
  });
});
