import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, {
    message: "VALIDATION_NAME_TOO_SHORT",
  }),
});
