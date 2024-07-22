import type { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

import { type Role, RoleSchema } from "@/schemas/roles";
import { teamSchema } from "@/schemas/create-team";

export const getTeamInfo = async (teamId?: string, slug?: string) => {
  const team = await prisma.team.findFirst({
    where: {
      OR: [
        {
          id: teamId
        },
        {
          slug
        }
      ]
    }
  });
  return team;
}

export const createTeam = async (values: z.infer<typeof teamSchema>) => {
  const { language, name, bio, logo, radiusPlayerAge, radiusPlayerArea, teamShape, location } = teamSchema.parse(values);
  const session = await auth();
  const ownerId = session?.user.id;

  if (!ownerId) {
    throw new Error("User not found");
  }

  const role = RoleSchema.Enum.MANAGER;

  const team = await prisma.team.create({
    data: {
      name,
      language,
      bio,
      logo,
      location,
      maxRadiusPlayerAge: radiusPlayerAge[1],
      minRadiusPlayerAge: radiusPlayerAge[0],
      maxRadiusPlayerArea: radiusPlayerArea[1],
      minRadiusPlayerArea: radiusPlayerArea[0],
      teamShape,
      slug: name.toLowerCase().replace(" ", "-"),
      user: {
        connect: {
          id: ownerId,
        }
      },
      teamMember: {
        create: {
          userId: ownerId,
          role: "MANAGER"
        }
      }
    }
  });
  return team;
}

export const checkTeamByName = async (teamName: string) => {
  const team = await prisma.team.findFirst({
    where: {
      name: teamName
    }
  });
  return team;
}

export const checkUserHasTeam = async (userId: string) => {
  try {
    const team = await prisma.team.count({
      where: {
        user: {
          id: userId
        }
      }
    });
    return team > 0;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export const getRolesByUser = async (userId: string) => {
  const roles = await prisma.teamMember.findMany({
    where: {
      userId
    },
    select: {
      role: true
    }
  });
  return roles.map((roles) => roles.role) as Role[];
}

export const getTeamByUser = async (userId: string) => {
  return prisma.team.findMany({
    where: {
      user: {
        id: userId
      }
    },
    include: {
      teamMember: {
        select: {
          role: true
        }
      }
    }
  });
}

export const checkUserMemberTeam = async (userId: string, teamId: string) => {
  const team = await prisma.teamMember.findFirst({
    where: {
      userId,
      teamId
    }
  });
  return team;
}

