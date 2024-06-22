import z from "zod";

export const RoleSchema = z.enum(["player", "manager", "admin"]);
