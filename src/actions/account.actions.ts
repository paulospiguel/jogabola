"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db/client";
import { accountTransferRequests, user } from "@/db/schema";
import { withAuthAction } from "@/lib/action-helpers";

export const deleteAccount = withAuthAction(
  z.object({}),
  async authUser => {
    try {
      await db.delete(user).where(eq(user.id, authUser.id));
      revalidatePath("/arena");
      return { success: true, data: null };
    } catch (err) {
      console.error("[account] delete error:", err);
      return { success: false, error: { code: "DELETE_FAILED" } };
    }
  },
);

export const transferAccount = withAuthAction(
  z.object({ newEmail: z.string().email() }),
  async (authUser, { newEmail }) => {
    try {
      const existing = await db.query.user.findFirst({
        where: eq(user.email, newEmail),
      });

      if (existing) {
        return { success: false, error: { code: "EMAIL_ALREADY_IN_USE" } };
      }

      // Cancel any previous pending request from this user
      await db
        .update(accountTransferRequests)
        .set({ status: "cancelled" })
        .where(
          and(
            eq(accountTransferRequests.userId, authUser.id),
            eq(accountTransferRequests.status, "pending"),
          ),
        );

      // Save new request (expires in 48h)
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await db.insert(accountTransferRequests).values({
        userId: authUser.id,
        newEmail,
        status: "pending",
        expiresAt,
      });

      revalidatePath("/arena/profile");

      console.log(`[account] transfer request: ${authUser.email} → ${newEmail}`);
      return { success: true, data: { message: "TRANSFER_REQUEST_SENT" } };
    } catch (err) {
      console.error("[account] transfer error:", err);
      return { success: false, error: { code: "TRANSFER_FAILED" } };
    }
  },
);

export const cancelTransferRequest = withAuthAction(
  z.object({ requestId: z.number() }),
  async (authUser, { requestId }) => {
    try {
      await db
        .update(accountTransferRequests)
        .set({ status: "cancelled" })
        .where(
          and(
            eq(accountTransferRequests.id, requestId),
            eq(accountTransferRequests.userId, authUser.id),
          ),
        );

      revalidatePath("/arena/profile");
      return { success: true, data: null };
    } catch (err) {
      console.error("[account] cancel transfer error:", err);
      return { success: false, error: { code: "CANCEL_FAILED" } };
    }
  },
);
