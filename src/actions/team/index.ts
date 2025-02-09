"use server";

import db, {  UserRole, type Prisma } from "@/lib/db";
import { type RoleSchema, RoleValues, teamSchema } from "@/schemas";
import type { SessionRoles } from "@/types/roles";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authActionClient, type SafeCtx } from "../safe-action";
import { createMiddleware } from "next-safe-action";

export const getTeamInfo = authActionClient
	.schema(
		z.object({
			teamId: z.string().optional(),
			teamSlug: z.string().optional(),
		}),
	)
	.metadata({
		name: "get-team-info",
	})
	.action(async ({ parsedInput, ctx }) => {
		const team = await db.team.findFirst({
			where: {
				OR: [{ id: parsedInput.teamId }, { slug: parsedInput.teamSlug }],
			},
			include: {
				teamMembers: {
					select: {
						userId: true,
						role: true,
					},
				},
			},
		});

		if (!team) {
			throw new Error("Team not found");
		}

		const member = team.teamMembers.find(
			(member) => member.userId === ctx.userId,
		);
		const isMember = !!member;
		const allowedRoles = [RoleValues.MANAGER, RoleValues.ADMIN] as z.infer<
			typeof RoleSchema
		>[];
		const memberRole = member?.role;
		const hasEditPermission =
			isMember && !!memberRole && allowedRoles.includes(memberRole);

		const { teamMembers, ...teamWithoutMembers } = team;

		const membersAsync = teamMembers.map(async (member) => {
			const user = await db.user.findFirst({
				where: {
					id: member.userId,
				},
				select: {
					id: true,
					name: true,
					email: true,
					emailVerified: true,
					image: true,
				},
			});

			if (user) {
				return {
					...user,
					role: member.role,
				};
			}

			return null;
		});

		const members = await Promise.all(membersAsync);

		return {
			isMember,
			hasEditPermission,
			...teamWithoutMembers,
			members,
		};
	});

const managerMiddleware = createMiddleware<{
	ctx: SafeCtx;
	// metadata: { actionName: string };
}>().define(async ({ next, ctx }) => {
	const { userId } = ctx;

	if (userId) {
		const teamCount = await db.teamMember.count({
			where: {
				userId,
				role: UserRole.MANAGER,
				team: {
					isPublic: true,
					// user: {
					// 	is: {
					// 		emailVerified: {
					// 			not: null
					// 		}
					// 	}
					// }
				},
			},
		});

		return next({
			ctx: {
				...ctx,
				read: true,
				canCreateTeam: teamCount < 3,
			},
		});
	}
	return next({ ctx });
});

export const createTeamAction = authActionClient
	.use(managerMiddleware)
	.metadata({
		name: "add-new-team",
	})
	.schema(
		z.object({
			values: teamSchema,
			redirectTo: z.string().optional(),
		}),
	)
	.action(async ({ ctx, parsedInput: { values, redirectTo } }) => {
		try {
			const { read, userId, canCreateTeam } = ctx;

			if (!read) return null;

			if (!userId) {
				throw new Error("Usuário não encontrado!");
			}

			if (!canCreateTeam) {
				throw new Error("Você não tem permissão para criar times!");
			}

			const {
				language,
				name,
				bio,
				logo,
				radiusPlayerAge,
				radiusPlayerArea,
				teamShape,
				location,
				isPublic,
				email,
			} = teamSchema.parse(values);

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
							id: userId,
						},
					},
					teamMembers: {
						create: {
							userId: userId,
							role: role,
						},
					},
				},
			});

			if (redirectTo) {
				redirect(redirectTo);
			}

			return team;
		} catch (error) {
			if (error instanceof z.ZodError) {
				throw error;
			}

			throw new Error(
				error instanceof Error ? error.message : "Erro ao criar o time",
			);
		}
	});

export const checkTeamByName = authActionClient
	.schema(
		z.object({
			teamName: teamSchema.shape.name,
		}),
	)
	.metadata({
		name: "check-team-by-name",
	})
	.action(async ({ parsedInput: { teamName } }) => {
		try {
			const team = await db.team.findFirst({
				where: {
					OR: [{ name: teamName }, { slug: teamName.replace(/\s+/g, "-") }],
				},
			});
			return {
				exists: !!team,
				team,
			};
		} catch (error) {
			if (error instanceof z.ZodError) {
				throw error;
			}
			throw new Error("Erro ao verificar o nome do time");
		}
	});

export const checkUserHasTeam = authActionClient
	.metadata({
		name: "check-user-has-team",
	})
	.schema(z.object({ userId: z.string() }))
	.action(async ({ parsedInput: { userId } }) => {
		try {
			const team = await db.teamMember.count({
				where: {
					userId,
				},
				select: {
					role: true,
				},
			});
			return team.role;
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

			sessionRoles[`is${roleName}`] = roleName?.includes(
				RoleValues[roleName as keyof typeof RoleValues],
			);
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
			include: {
				teamMembers: {
					where: {
						role: "PLAYER",
					},
				},
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

export const saveTeamInfo = authActionClient
	.schema(
		z.object({
			teamId: z.string(),
			input: z.object({ key: z.string(), value: z.string() }),
		}),
	)
	.metadata({
		name: "save-team-info",
	})
	.action(async ({ parsedInput: { teamId, input } }) => {
		const saveDate: Prisma.TeamUpdateInput = {
			[input.key]: input.value,
		};

		const team = await db.team.update({
			where: {
				id: teamId,
			},
			data: {
				...saveDate,
				founded: input.key === "founded" ? new Date(input.value) : undefined,
			},
		});

		return team;
	});
