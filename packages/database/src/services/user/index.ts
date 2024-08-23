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
