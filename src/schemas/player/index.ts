import * as z from "zod";

export const playerSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  image: z.string().optional(),
  bith_day: z.string(),
});
