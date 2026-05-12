import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { fines } from "@/db/schema";

export async function hasPendingFines(userId: string) {
  const pendingFines = await db.query.fines.findFirst({
    where: and(eq(fines.playerId, userId), eq(fines.status, "pending")),
  });
  return !!pendingFines;
}
