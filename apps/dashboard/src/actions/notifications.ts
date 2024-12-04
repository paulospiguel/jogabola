import { db } from "@repo/db"; // Caminho do seu cliente Prisma

export async function createNotification(
  teamId: string,
  title: string,
  message: string,
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
) {
  return await db.pushNotification.create({
    data: {
      title,
      message,
      priority,
      teamId,
    },
  });
}

export async function getImportantNotifications(teamId: string) {
  return await db.pushNotification.findMany({
    where: {
      teamId: teamId,
      priority: {
        in: ["HIGH", "URGENT"],
      },
      sent: false,
    },
  });
}
