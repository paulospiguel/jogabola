import { db } from "@repo/db";

import { type Role, RoleSchema, teamSchema } from "@/schemas";
import type { TeamCreateInput } from "@/types";
import { z } from "zod";
import { authActionClient } from "../safe-action";

export const getTeamInfo = async (teamId?: string, slug?: string) => {
  const team = await db.team.findFirst({
    where: {
      OR: [
        {
          id: teamId,
        },
        {
          slug,
        },
      ],
    },
  });
  return team;
};

export const createTeam = async (userId: string, values: TeamCreateInput) => {
  const { language, name, bio, logo, radiusPlayerAge, radiusPlayerArea, teamShape, location } =
    teamSchema.parse(values);
  const ownerId = userId;

  if (!ownerId) {
    throw new Error("User not found");
  }

  const role = RoleSchema.Enum.MANAGER;

  const team = await db.team.create({
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
        },
      },
      teamMember: {
        create: {
          userId: ownerId,
          role: "MANAGER",
        },
      },
    },
  });
  return team;
};

export const checkTeamByName = async (teamName: string) => {
  const team = await db.team.findFirst({
    where: {
      name: teamName,
    },
  });
  return team;
};

export const checkUserHasTeam = async (userId: string) => {
  try {
    const team = await db.team.count({
      where: {
        user: {
          id: userId,
        },
      },
    });
    return team > 0;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const getRolesByUser = async (userId: string) => {
  const roles = await db.teamMember.findMany({
    where: {
      userId,
    },
    select: {
      role: true,
    },
  });
  return roles.map((roles) => roles.role) as Role[];
};

export const getTeamByUser = async (userId: string) => {
  try {
    const data = await db.team.findMany({
      where: {
        user: {
          id: userId,
        },
      },
      include: {
        teamMember: {
          select: {
            role: true,
          },
        },
      },
    });

    return data;
  } catch (error) {
    throw new Error("Error getting team by user.");
  }
};

export const getTeamsByUserId = authActionClient
  .schema(z.object({ userId: z.string() }))
  .action(async ({ parsedInput: { userId } }) => {
    const response = await db.team.findMany({
      where: {
        userId: userId,
      },
    });
    return response;
  });

export const checkUserMemberTeam = async (userId: string, teamId: string) => {
  const team = await db.teamMember.findFirst({
    where: {
      userId,
      teamId,
    },
  });
  return team;
};
