import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(2, { message: "VALIDATION_TEAM_NAME_TOO_SHORT" }),
  slug: z
    .string()
    .min(3, { message: "VALIDATION_TEAM_SLUG_TOO_SHORT" })
    .regex(/^[a-z0-9-]+$/, { message: "VALIDATION_TEAM_SLUG_INVALID" }),
  ownerId: z.string().min(1, { message: "VALIDATION_OWNER_REQUIRED" }),
});

export const addTeamMemberSchema = z.object({
  teamId: z.number().int().positive({ message: "VALIDATION_TEAM_REQUIRED" }),
  playerId: z.string().min(1, { message: "VALIDATION_PLAYER_REQUIRED" }),
  role: z.enum(["owner", "manager", "coach", "player"]).default("player"),
});

export const addPlayerToRosterSchema = z.object({
  name: z.string().min(2, { message: "VALIDATION_NAME_TOO_SHORT" }),
  email: z.string().email({ message: "VALIDATION_EMAIL_INVALID" }),
  position: z.string().optional().default(""),
  experience: z.string().optional().default("beginner"),
  jerseyNumber: z.number().int().positive().optional(),
  dateOfBirth: z.string().optional(),
  managerId: z.string().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
export type AddPlayerToRosterInput = z.infer<typeof addPlayerToRosterSchema>;
