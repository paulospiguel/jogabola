"use server";

import { db } from "@repo/db";

import { RoleSchema, RoleValues, teamSchema } from "@/schemas";
import type { SessionRoles } from "@/types/roles";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authActionClient } from "../safe-action";
import { getUser } from "../user";

export const getTeamInfo = authActionClient
	.schema(z.object({ teamId: z.string().optional(), teamSlug: z.string().optional() }))
	.metadata({
		name: "get-team-info",
	})
	.action(async ({ parsedInput: { teamId, teamSlug } }) => {
		const team = await db.team.findUnique({
			where: {
				id: teamId,
				slug: teamSlug,
			},
		});
		return team;
	});

export const createTeamAction = authActionClient
	.metadata({
		name: "create-team",
		// track: {
		//   event: LogEvents.CreateTeam.name,
		//   channel: LogEvents.CreateTeam.channel,
		// },
	})
	.schema(
		z.object({
			values: teamSchema,
			redirectTo: z.string().optional(),
		}),
	)
	.action(async ({ ctx, parsedInput: { values, redirectTo } }) => {
		const { language, name, bio, logo, radiusPlayerAge, radiusPlayerArea, teamShape, location, isPublic, email } =
			teamSchema.parse(values);

		const { data } = (await getUser()) || {};

		const ownerId = data?.user?.id;

		if (!ownerId) {
			throw new Error("User not found");
		}

		const role = RoleValues.MANAGER;

		const team = await db.team.create({
			data: {
				name,
				language,
				email,
				isPublic,
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
				teamMembers: {
					create: {
						userId: ownerId,
						role: role,
					},
				},
			},
		});

		if (redirectTo) {
			redirect(redirectTo);
		}

		return team;
	});

export const checkTeamByName = authActionClient
	.schema(z.object({ teamName: z.string() }))
	.metadata({
		name: "check-team-by-name",
	})
	.action(async ({ parsedInput: { teamName } }) => {
		const team = await db.team.findFirst({
			where: {
				name: teamName,
			},
		});
		return team;
	});

export const checkUserHasTeam = authActionClient
	.schema(z.object({ userId: z.string() }))
	.metadata({
		name: "check-user-has-team",
	})
	.action(async ({ parsedInput: { userId } }) => {
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
	});

export const getRolesByUser = authActionClient
	.schema(z.object({ userId: z.string() }))
	.metadata({
		name: "get-roles-by-user-id",
	})
	.action(async ({ parsedInput: { userId } }) => {
		const roles = await db.teamMember.findMany({
			where: {
				userId,
			},
			select: {
				role: true,
			},
		});

		const sessionRoles: Record<string, boolean> = {};

		for (const role of roles) {
			const roleName = role.role;

			if (!roleName) return;

			sessionRoles[`is${roleName}`] = roleName?.includes(RoleValues[roleName as keyof typeof RoleValues]);
		}

		return sessionRoles as SessionRoles;
	});

export const getTeamByUser = async (userId: string) => {
	try {
		const data = await db.team.findMany({
			where: {
				user: {
					id: userId,
				},
			},
			include: {
				teamMembers: {
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
	.metadata({
		name: "get-teams-by-user-id",
	})
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
