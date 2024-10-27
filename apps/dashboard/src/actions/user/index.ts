import { auth } from "@auth";
import { db } from "@repo/db";
import type { SessionRoles } from "@/types/roles";
import { actionClient } from "../safe-action";

export const findUserbyEmail = async (email: string) => {
	const user = await db.user.findUnique({
		where: {
			email,
		},
	});
	return user;
};

export const findUserbyId = async (userId: string) => {
	const user = await db.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			id: true,
			name: true,
			email: true,
			password: true,
			isTwoFactorAuthEnabled: true,
		},
	});
	return user;
};

export const getUsers = async () => {
	const users = await db.user.findMany();
	return users;
};

export const getUser = async () => {
	const session = await auth();

	if (!session?.user?.id) {
		return {
			user: null,
			roles: {},
			canCreateTeam: false,
		};
	}

	const user = await db.user.findUnique({
		where: {
			id: session?.user?.id,
		},
		select: {
			id: true,
			name: true,
			email: true,
			isTwoFactorAuthEnabled: true,
			role: true,
			image: true,
			emailVerified: true,
			team: {
				select: {
					id: true,
					teamMembers: {
						select: {
							role: true,
						},
					},
				},
			},
		},
	});

	const roles: SessionRoles = {};

	user?.team.flatMap((team) =>
		team.teamMembers.map((member) => {
			if (!member.role) return;
			roles[`is${member.role}`] = true;
		}),
	);

	return {
		user,
		roles,
		canCreateTeam: user?.role === "ADMIN" || user?.role === "MANAGER",
	};
};
