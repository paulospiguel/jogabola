import type { TeamRole } from "@/types/teams";

/**
 * Roles that can manage a team operationally (create/edit events,
 * attendance, payment registration). Shared allowlist reused by
 * `canManageTeam` (server-trusted authorization, src/lib/team-access.ts)
 * and by the `getMyTeams` DTO mapper (presentation-only `canManage`).
 *
 * IMPORTANT: `canManage` derived from this constant is presentation-only.
 * Every actual mutation must keep calling `canManageTeam`/`userIsTeamOwner`
 * server-side — never trust this value from the client.
 */
export const MANAGEMENT_ROLES = ["owner", "manager"] as const;

export function isManagementRole(role: string): boolean {
  return (MANAGEMENT_ROLES as readonly string[]).includes(role);
}

export interface TeamCapabilitySummary {
  membershipRole: TeamRole;
  canManage: boolean;
}

/**
 * Merges a user's owned teams and team memberships into a single list of
 * accessible team summaries, each annotated with the user's role and a
 * presentation-only `canManage` flag. When a team appears in both lists
 * (owner who is also listed as a team member), ownership wins.
 *
 * `ownedTeams` and `memberTeams` are inferred independently so callers can
 * pass an empty array for either list without collapsing the other's type.
 */
export function buildAccessibleTeamSummaries<
  TOwned extends { id: number },
  TMember extends { id: number; role: string },
>(
  ownedTeams: readonly TOwned[],
  memberTeams: readonly TMember[],
): ((TOwned | Omit<TMember, "role">) & TeamCapabilitySummary)[] {
  type Merged = (TOwned | Omit<TMember, "role">) & TeamCapabilitySummary;
  const byId = new Map<number, Merged>();

  for (const team of memberTeams) {
    const { role, ...rest } = team;
    byId.set(team.id, {
      ...rest,
      membershipRole: role as TeamRole,
      canManage: isManagementRole(role),
    } as Merged);
  }

  // Owned teams always win — ownership outranks any membership role.
  for (const team of ownedTeams) {
    byId.set(team.id, {
      ...team,
      membershipRole: "owner",
      canManage: true,
    } as Merged);
  }

  return Array.from(byId.values());
}
