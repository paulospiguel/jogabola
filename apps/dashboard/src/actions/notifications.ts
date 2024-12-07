import { db } from "@repo/db";

export async function createNotification(
	teamId: string,
	title: string,
	message: string,
	priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
) {
	return await db.notification.create({
		data: {
			title,
			message,
			priority,
			teamId,
		},
	});
}

export async function getImportantNotifications(teamId: string) {
	return await db.notification.findMany({
		where: {
			teamId: teamId,
			priority: {
				in: ["HIGH", "URGENT"],
			},
			sent: false,
		},
	});
}
