import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { accountTransferRequests } from "@/db/schema";

export async function getPendingTransferRequest(userId: string) {
  return db.query.accountTransferRequests.findFirst({
    where: and(
      eq(accountTransferRequests.userId, userId),
      eq(accountTransferRequests.status, "pending"),
      gt(accountTransferRequests.expiresAt, new Date()),
    ),
  });
}
