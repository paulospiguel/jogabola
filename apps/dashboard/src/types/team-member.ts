import { Prisma } from "@repo/db";
import { z } from "zod";
export type { Player } from "@repo/db";

export type TeamMember = z.Schema<Prisma.TeamMemberInclude>

