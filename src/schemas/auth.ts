import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "VALIDATION_EMAIL_REQUIRED")
    .email("VALIDATION_EMAIL_INVALID"),
  password: z
    .string()
    .min(1, "VALIDATION_PASSWORD_REQUIRED")
    .min(8, "VALIDATION_PASSWORD_MIN"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "VALIDATION_NAME_REQUIRED")
      .min(3, "VALIDATION_NAME_MIN"),
    email: z
      .string()
      .min(1, "VALIDATION_EMAIL_REQUIRED")
      .email("VALIDATION_EMAIL_INVALID"),
    password: z
      .string()
      .min(1, "VALIDATION_PASSWORD_REQUIRED")
      .min(8, "VALIDATION_PASSWORD_MIN")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "VALIDATION_PASSWORD_COMPLEXITY",
      ),
    confirmPassword: z.string().min(1, "VALIDATION_CONFIRM_PASSWORD_REQUIRED"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "VALIDATION_PASSWORDS_DONT_MATCH",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
