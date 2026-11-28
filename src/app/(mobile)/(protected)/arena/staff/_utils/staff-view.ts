import type { TeamStaffEntry } from "@/actions/team-staff.actions";
import {
  STAFF_PERMISSIONS,
  type StaffPermission,
} from "@/lib/staff-permissions";

export interface StaffRow extends TeamStaffEntry {
  isOwner: boolean;
  /** Presentation only: the server re-checks ownership on every mutation. */
  editable: boolean;
}

/** Keeps only known permissions, in catalog order. */
function orderPermissions(
  permissions: readonly StaffPermission[],
): StaffPermission[] {
  const set = new Set<string>(permissions);
  return STAFF_PERMISSIONS.filter(permission => set.has(permission));
}

/**
 * Maps `getTeamStaff` rows to the staff list view: owner first and never
 * editable; staff rows editable only when the viewer is the owner.
 */
export function toStaffRows(
  data: readonly TeamStaffEntry[],
  viewerIsOwner: boolean,
): StaffRow[] {
  const ownerRows = data.filter(entry => entry.title === "owner");
  const staffRows = data.filter(entry => entry.title !== "owner");

  return [...ownerRows, ...staffRows].map(entry => {
    const isOwner = entry.title === "owner";
    return {
      ...entry,
      permissions: orderPermissions(entry.permissions),
      isOwner,
      editable: viewerIsOwner && !isOwner,
    };
  });
}

export { staffQueryKey } from "@/lib/staff-ui";

/** Same members regardless of order (permission lists are tiny). */
export function sameMembers(a: readonly string[], b: readonly string[]) {
  const set = new Set(b);
  return a.length === b.length && a.every(item => set.has(item));
}
