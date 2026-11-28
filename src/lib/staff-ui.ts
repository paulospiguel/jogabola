/**
 * Client-safe presentation helpers for the staff UI. These only decide what
 * to show; every staff mutation is authorized server-side (owner only).
 */
import {
  STAFF_PERMISSIONS,
  type StaffPermission,
  type StaffTitle,
} from "@/lib/staff-permissions";

/** Minimal react-query surface, so this module stays framework-light. */
interface QueryInvalidator {
  invalidateQueries: (filters: { queryKey: readonly unknown[] }) => unknown;
}

/** Roster (Plantel) query keys refreshed after an athlete opt-in/out. */
export const ROSTER_QUERY_KEYS = [["squad"], ["dashboard", "squad"]] as const;

export async function invalidateRosterQueries(
  queryClient: QueryInvalidator,
): Promise<void> {
  await Promise.all(
    ROSTER_QUERY_KEYS.map(queryKey =>
      queryClient.invalidateQueries({ queryKey }),
    ),
  );
}

/** Team staff list query key (staff page). */
export const staffQueryKey = (teamId: number) => ["team-staff", teamId];

/**
 * Everything a promote/demote/update touches: the staff list, the athlete
 * profile (staff badge) and the roster (staff badges in the Plantel).
 */
export async function invalidateStaffChange(
  queryClient: QueryInvalidator,
  teamId: number,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: staffQueryKey(teamId) }),
    queryClient.invalidateQueries({ queryKey: ["athlete-profile"] }),
    invalidateRosterQueries(queryClient),
  ]);
}

export type StaffAction = "promote" | "demote" | null;

export interface StaffActionTarget {
  /** Registered account (not an invited guest without a user). */
  isRegistered: boolean;
  isTeamOwner: boolean;
  staffTitle: StaffTitle | null;
}

/**
 * Owner viewers may promote a registered non-staff athlete or demote a staff
 * member. Nobody else sees either action, and the owner is never a target.
 */
export function getStaffAction(
  viewerIsOwner: boolean,
  target: StaffActionTarget,
): StaffAction {
  if (!viewerIsOwner || target.isTeamOwner) return null;
  if (target.staffTitle !== null) return "demote";
  return target.isRegistered ? "promote" : null;
}

/**
 * Presentation gate for team payment settings (MB WAY, etc.). The server
 * skips payment-settings writes for anyone else, so the UI hides them.
 */
export function canManagePayments(team: TeamCapabilities | null): boolean {
  return canDo(team, "payments.manage");
}

/** Owner flag + granted permissions, as returned by `getMyTeams`. */
export interface TeamCapabilities {
  isOwner: boolean;
  permissions: readonly StaffPermission[];
}

/**
 * Presentation gate for a single permission: the owner can do everything,
 * staff only what they were granted. The server re-checks with `can()`.
 */
export function canDo(
  team: TeamCapabilities | null | undefined,
  permission: StaffPermission,
): boolean {
  if (!team) return false;
  return team.isOwner || team.permissions.includes(permission);
}

/**
 * Mirrors `removePlayerFromRoster`: needs `roster.manage`, never targets the
 * owner, and only the owner may remove a staff member from the roster.
 */
export function canRemoveFromRoster(
  team: TeamCapabilities | null | undefined,
  target: { isTeamOwner: boolean; staffTitle: StaffTitle | null },
): boolean {
  if (!team || target.isTeamOwner) return false;
  if (!canDo(team, "roster.manage")) return false;
  return team.isOwner || target.staffTitle === null;
}

const ADD_PLAYER_ERROR_CODES = new Set([
  "FORBIDDEN",
  "TEAM_REQUIRED",
  "PLAYER_ALREADY_IN_TEAM",
  "PLAYER_ALREADY_INVITED_TO_TEAM",
  "PLAYER_ALREADY_INVITED_ELSEWHERE",
  "VALIDATION_ERROR",
]);

/** Maps an `addPlayerToRoster` error code to an `arenaAddPlayer.errors.*` key. */
export function addPlayerErrorKey(code: string | undefined): string {
  return code && ADD_PLAYER_ERROR_CODES.has(code)
    ? `errors.${code}`
    : "errors.UNKNOWN_ERROR";
}

/** Locale key segment for a permission (`events.manage` → `events`). */
export function permissionLabelKey(permission: StaffPermission): string {
  return permission.split(".")[0];
}

/** Toggles a permission, keeping the catalog order. */
export function togglePermission(
  current: readonly StaffPermission[],
  permission: StaffPermission,
): StaffPermission[] {
  const next = new Set(current);
  if (next.has(permission)) next.delete(permission);
  else next.add(permission);
  return STAFF_PERMISSIONS.filter(p => next.has(p));
}

const STAFF_ERROR_CODES = new Set([
  "FORBIDDEN",
  "TEAM_NOT_FOUND",
  "NOT_AN_ATHLETE",
  "CANNOT_MODIFY_OWNER",
  "NOT_STAFF",
  "VALIDATION_ERROR",
]);

/** Maps a staff action error code to a `teamStaff.errors.*` key. */
export function staffErrorKey(code: string | undefined): string {
  return code && STAFF_ERROR_CODES.has(code)
    ? `errors.${code}`
    : "errors.UNKNOWN_ERROR";
}
