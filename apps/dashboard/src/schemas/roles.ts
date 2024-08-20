import z from "zod"
import { UserRole } from "@prisma/client";

export const RoleSchema = z.enum([UserRole.MANAGER, UserRole.PLAYER, UserRole.COACH, UserRole.WATCHER]);

export type Role = z.infer<typeof RoleSchema>;

export const RoleValues = RoleSchema.Values;

