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

	const user = await db.user.findUnique({
		where: {
			id: session?.user?.id,
		},
	});

	return user;
};
