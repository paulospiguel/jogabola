import { z } from "zod";
import { STAFF_PERMISSIONS, STAFF_TITLES } from "@/lib/staff-permissions";

const teamIdField = z
  .number()
  .int()
  .positive({ message: "VALIDATION_TEAM_REQUIRED" });
const userIdField = z
  .string()
  .min(1, { message: "VALIDATION_PLAYER_REQUIRED" });

const permissionsField = z
  .array(z.enum(STAFF_PERMISSIONS))
  .transform(list => Array.from(new Set(list)));

export const staffTitleSchema = z.enum(STAFF_TITLES);

export const setMyAthleteStatusSchema = z.object({
  teamId: teamIdField,
  isAthlete: z.boolean(),
});

export const promoteToStaffSchema = z.object({
  teamId: teamIdField,
  userId: userIdField,
  title: staffTitleSchema,
  permissions: permissionsField,
});

export const updateStaffMemberSchema = z.object({
  teamId: teamIdField,
  userId: userIdField,
  title: staffTitleSchema.optional(),
  permissions: permissionsField.optional(),
});

export const demoteStaffSchema = z.object({
  teamId: teamIdField,
  userId: userIdField,
});

export const getTeamStaffSchema = z.object({
  teamId: teamIdField,
});

export type SetMyAthleteStatusInput = z.infer<typeof setMyAthleteStatusSchema>;
export type PromoteToStaffInput = z.infer<typeof promoteToStaffSchema>;
export type UpdateStaffMemberInput = z.infer<typeof updateStaffMemberSchema>;
export type DemoteStaffInput = z.infer<typeof demoteStaffSchema>;
export type GetTeamStaffInput = z.infer<typeof getTeamStaffSchema>;
