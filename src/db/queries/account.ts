import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { accountTransferRequests } from "@/db/schema";

export async function getPendingTransferRequest(userId: string) {
  const rows = await db
    .select()
    .from(accountTransferRequests)
    .where(
      and(
        eq(accountTransferRequests.userId, userId),
        eq(accountTransferRequests.status, "pending"),
        gt(accountTransferRequests.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}
