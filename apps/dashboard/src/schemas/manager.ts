import { z } from "zod";

export const tabKeysSchema = z.enum([
  "myTeams",
  "matches",
  "fields",
  "players",
  "schedule",
  "statistics",
  "events",
  "myCompetitions",
]);
