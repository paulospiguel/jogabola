import { z } from "zod";

export const upsertAttendanceSchema = z.object({
  matchSessionId: z
    .number()
    .int()
    .positive({ message: "VALIDATION_MATCH_SESSION_REQUIRED" }),
  playerId: z.string().min(1, { message: "VALIDATION_PLAYER_REQUIRED" }),
  status: z.enum(["invited", "available", "unavailable", "maybe"]),
  note: z.string().max(500, { message: "VALIDATION_NOTE_TOO_LONG" }).optional(),
});

export type UpsertAttendanceInput = z.infer<typeof upsertAttendanceSchema>;
