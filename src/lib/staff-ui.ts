/**
 * Client-safe presentation helpers for the staff UI. These only decide what
 * to show; every staff mutation is authorized server-side (owner only).
 */
import {
  STAFF_PERMISSIONS,
  type StaffPermission,
  type StaffTitle,
} from "@/lib/staff-permissions";

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
