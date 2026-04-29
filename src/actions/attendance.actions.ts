"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { attendance } from "@/db/schema";
import { upsertAttendanceSchema } from "@/schemas/attendance.schema";
import type { ActionResult } from "@/types/common";

export async function upsertAttendanceAction(
  input: unknown,
): Promise<ActionResult<typeof attendance.$inferSelect>> {
  return upsertAttendance(input);
}

export async function upsertAttendance(
  input: unknown,
): Promise<ActionResult<typeof attendance.$inferSelect>> {
  const parsed = upsertAttendanceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      },
    };
  }

  const [row] = await db
    .insert(attendance)
    .values({ ...parsed.data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [attendance.matchSessionId, attendance.playerId],
      set: {
        status: parsed.data.status,
        note: parsed.data.note,
        updatedAt: new Date(),
      },
    })
    .returning();

  return { success: true, data: row };
}

export async function getAttendanceForMatchSessionAction(
  matchSessionId: number,
): Promise<ActionResult<(typeof attendance.$inferSelect)[]>> {
  return getAttendanceForMatchSession(matchSessionId);
}

export async function getAttendanceForMatchSession(
  matchSessionId: number,
): Promise<ActionResult<(typeof attendance.$inferSelect)[]>> {
  const rows = await db
    .select()
    .from(attendance)
    .where(eq(attendance.matchSessionId, matchSessionId));

  return { success: true, data: rows };
}
