import { Prisma } from "@repo/db";

export type TeamCreateInput = Prisma.TeamCreateInput

export type Team = Prisma.TeamGetPayload<boolean>