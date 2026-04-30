"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { attendance } from "@/db/schema";
import { upsertAttendanceSchema } from "@/schemas/attendance.schema";
import { withAction } from "@/lib/action-helpers";

export const upsertAttendance = withAction(
  upsertAttendanceSchema,
  async (data) => {
    const [row] = await db
      .insert(attendance)
      .values({ ...data, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: [attendance.matchSessionId, attendance.playerId],
        set: { status: data.status, note: data.note, updatedAt: new Date() },
      })
      .returning();
    return { success: true, data: row };
  },
);

export async function getAttendanceForMatchSession(matchSessionId: number) {
  const rows = await db
    .select()
    .from(attendance)
    .where(eq(attendance.matchSessionId, matchSessionId));
  return { success: true as const, data: rows };
}
