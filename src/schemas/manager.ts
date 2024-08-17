import { z } from "zod";

export const tabKeysSchema = z.enum(["home", "teams", "players", "schedule", "statistics"]);