import { UserRole as Role } from "@prisma/client";
import { z } from "zod";

export const userRoles = z.nativeEnum(Role);

export type UserRole = z.infer<typeof userRoles>;


export type SessionRoles = {
  isADMIN?: boolean;
  isUSER?: boolean;
  isPLAYER?: boolean;
  isCOACH?: boolean;
  isMANAGER?: boolean;
  isWATCHER?: boolean;
}