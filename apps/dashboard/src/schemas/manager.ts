import { z } from "zod";

export const tabKeysSchema = z.enum(["teams", "fields", "players", "schedule", "statistics"]);