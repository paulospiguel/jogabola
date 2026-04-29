import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, {
    message: "VALIDATION_NAME_TOO_SHORT",
  }),
  image: z
    .string()
    .trim()
    .url({
      message: "VALIDATION_IMAGE_URL_INVALID",
    })
    .optional()
    .or(z.literal("")),
});
