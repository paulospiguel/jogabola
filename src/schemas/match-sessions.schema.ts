import { z } from "zod";

export const createMatchSessionSchema = z.object({
  teamId: z.number().int().positive({ message: "VALIDATION_TEAM_REQUIRED" }),
  title: z.string().min(3, { message: "VALIDATION_TITLE_TOO_SHORT" }),
  location: z.string().min(3, { message: "VALIDATION_LOCATION_REQUIRED" }),
  startsAt: z.coerce.date({
    invalid_type_error: "VALIDATION_STARTS_AT_INVALID",
  }),
  endsAt: z.coerce.date().optional(),
  capacity: z.number().int().positive().optional(),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().length(3).default("EUR"),
});

export const createMatchReservationSchema = z.object({
  matchSessionId: z
    .number()
    .int()
    .positive({ message: "VALIDATION_MATCH_SESSION_REQUIRED" }),
  playerId: z.string().min(1, { message: "VALIDATION_PLAYER_REQUIRED" }),
  status: z
    .enum([
      "reserved_unpaid",
      "payment_uploaded",
      "confirmed",
      "waiting_list",
      "cancelled",
      "expired",
    ])
    .default("reserved_unpaid"),
});

export type CreateMatchSessionInput = z.infer<typeof createMatchSessionSchema>;
export type CreateMatchReservationInput = z.infer<
  typeof createMatchReservationSchema
>;
