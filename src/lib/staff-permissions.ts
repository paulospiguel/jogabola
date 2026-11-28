/**
 * Team staff permission catalog. Client-safe: no DB or server imports.
 * Ownership is never a permission — it comes only from `teams.owner_id`.
 */
export const STAFF_PERMISSIONS = [
  "events.manage",
  "attendance.manage",
  "roster.manage",
  "payments.manage",
  "communication.manage",
  "match.manage",
] as const;

export type StaffPermission = (typeof STAFF_PERMISSIONS)[number];

/** Staff titles are labels and presets only; they grant no power. */
export const STAFF_TITLES = [
  "coach",
  "director",
  "finance",
  "secretary",
  "other",
] as const;

export type StaffTitle = (typeof STAFF_TITLES)[number];

export const TITLE_PRESETS: Record<StaffTitle, StaffPermission[]> = {
  coach: ["events.manage", "attendance.manage", "match.manage"],
  director: [...STAFF_PERMISSIONS],
  finance: ["payments.manage"],
  secretary: ["events.manage", "attendance.manage", "communication.manage"],
  other: [],
};

/** Everything a legacy co-captain (`team_members.role = 'manager'`) could do. */
export const LEGACY_MANAGER_PERMISSIONS: StaffPermission[] = [
  "events.manage",
  "attendance.manage",
  "payments.manage",
  "communication.manage",
  "roster.manage",
];

const PERMISSION_SET: ReadonlySet<string> = new Set(STAFF_PERMISSIONS);
const TITLE_SET: ReadonlySet<string> = new Set(STAFF_TITLES);

export function isStaffPermission(v: string): v is StaffPermission {
  return PERMISSION_SET.has(v);
}

export function isStaffTitle(v: string): v is StaffTitle {
  return TITLE_SET.has(v);
}
