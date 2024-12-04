import { Steps } from "@/types";
import * as z from "zod";

export const teamShapeEnum = z.enum(["fut11", "fut7", "fut5"]);
export const languagesEnum = z.enum(["pt", "en", "es"]);

export const teamSchema = z.object({
  id: z.string().optional(),
  currentStep: z.nativeEnum(Steps).default(Steps.Step1),
  termsOfUse: z.boolean().default(false),
  allowNotifications: z.boolean().default(false),
  name: z
    .string()
    .min(3, { message: "O nome deve ter pelo menos 3 caracteres" })
    .regex(/^[a-zA-ZÀ-ÿ0-9\s]+$/, {
      message: "O nome não deve conter caracteres especiais",
    })
    .max(50, { message: "O nome deve ter no máximo 50 caracteres" }),
  isPublic: z.boolean().default(true),
  email: z.string().email(),
  bio: z.string().optional(),
  logo: z.string().optional(),
  location: z.string().optional(),
  language: languagesEnum.default(languagesEnum.options[0]),
  teamShape: teamShapeEnum.default(teamShapeEnum.options[0]),
  radiusPlayerArea: z.array(z.number()).default([1, 4]),
  radiusPlayerAge: z.array(z.number()).default([15, 45]),
  slug: z.string().optional(),
  temaMember: z
    .array(
      z.object({
        userId: z.string(),
        role: z.string(),
      }),
    )
    .optional(),
});
