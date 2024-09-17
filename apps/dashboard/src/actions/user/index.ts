import { auth } from "@auth";
import { db } from "@repo/db";

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
		return null;
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
					teamMember: {
						select: {
							role: true,
						},
					},
				},
			},
		},
	});

	const roles = user?.team.flatMap((team) => team.teamMember.map((member) => member.role));

	return {
		user,
		roles,
	};
};
