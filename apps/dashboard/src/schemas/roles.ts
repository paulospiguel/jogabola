import * as z from "zod";

export const RoleSchema = z.enum(["MANAGER", "PLAYER", "COACH", "WATCHER", "USER"]);

export type Role = z.infer<typeof RoleSchema>;

export const RoleValues = RoleSchema.Values;
