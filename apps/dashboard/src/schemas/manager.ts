import { z } from "zod";

export const tabKeysSchema = z.enum(["myteams", "fields", "players", "schedule", "statistics"]);
