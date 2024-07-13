import { teamSchema } from "@/schemas/create-team";
import type { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

import { RoleSchema } from "@/schemas/roles";

const teamService = {
  getTeamInfo: async (teamId: string) => {
    const team = await prisma.team.findUnique({
      where: {
        id: teamId
      }
    });
    return team;
  },

  createTeam: async (values: z.infer<typeof teamSchema>) => {
    const { language, teamName, bio, logo, radiusPlayerAge, radiusPlayerArea, teamShape, location } = teamSchema.parse(values);
    const session = await auth();
    const ownerId = session?.user.id;

    if (!ownerId) {
      throw new Error("User not found");
    }

    const role = RoleSchema.Values.owner;

    const team = await prisma.team.create({
      data: {
        name: teamName,
        language,
        bio,
        logo,
        location,
        maxRadiusPlayerAge: radiusPlayerAge[1],
        minRadiusPlayerAge: radiusPlayerAge[0],
        maxRadiusPlayerArea: radiusPlayerArea[1],
        minRadiusPlayerArea: radiusPlayerArea[0],
        teamShape,
        slug: teamName.toLowerCase().replace(" ", "-"),
        User: {
          connect: {
            id: ownerId
          }
        },
        TeamMember: {
          create: {
            userId: ownerId,
            role: role
          }
        }
      }
    });
    return team;
  },

  checkTeamName: async (teamName: string) => {
    const team = await prisma.team.findFirst({
      where: {
        name: teamName
      }
    });
    return team;
  }
};

export default teamService;