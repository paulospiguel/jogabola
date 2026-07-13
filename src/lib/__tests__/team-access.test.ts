import { beforeEach, describe, expect, it, vi } from "vitest";
import { canManageTeam } from "@/lib/team-access";

const { membershipFindFirst, teamFindFirst } = vi.hoisted(() => ({
  membershipFindFirst: vi.fn(),
  teamFindFirst: vi.fn(),
}));

vi.mock("@/db/client", () => ({
  db: {
    query: {
      teamMembers: { findFirst: membershipFindFirst },
      teams: { findFirst: teamFindFirst },
    },
  },
}));

beforeEach(() => {
  teamFindFirst.mockReset();
  membershipFindFirst.mockReset();
});

describe("canManageTeam", () => {
  it("allows the team owner without querying membership", async () => {
    teamFindFirst.mockResolvedValue({ id: 1 });

    await expect(canManageTeam("owner-1", 1)).resolves.toBe(true);
    expect(membershipFindFirst).not.toHaveBeenCalled();
  });

  it("allows a non-owner with manager membership", async () => {
    teamFindFirst.mockResolvedValue(undefined);
    membershipFindFirst.mockResolvedValue({ id: 2 });

    await expect(canManageTeam("manager-1", 1)).resolves.toBe(true);
  });

  it("denies a user who is neither owner nor manager", async () => {
    teamFindFirst.mockResolvedValue(undefined);
    membershipFindFirst.mockResolvedValue(undefined);

    await expect(canManageTeam("player-1", 1)).resolves.toBe(false);
  });
});
