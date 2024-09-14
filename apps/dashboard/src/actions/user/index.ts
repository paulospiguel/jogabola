import { auth } from "@auth";
import { db } from "@repo/db";
import type { TelegramUserData } from "@telegram-auth/server";

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

export const createUserOrUpdate = async (user: TelegramUserData) => {
	if (!user.id) return;

	if (user.is_bot) {
		throw new Error("This user is a bot. They cannot be registered.");
	}

	return db.user.upsert({
		where: {
			id: user.id.toString(),
		},
		create: {
			id: user.id.toString(),
			name: user.first_name,
			image: user.photo_url,
			email: "",
		},
		update: {
			name: user.first_name,
			image: user.photo_url,
		},
	});
};
