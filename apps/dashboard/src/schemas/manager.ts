import { z } from "zod";

export const tabKeysSchema = z.enum(["myteams", "matches", "fields", "players", "schedule", "statistics", "events"]);
