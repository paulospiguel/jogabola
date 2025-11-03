import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O email é obrigatório")
    .email("Email inválido"),
  password: z
    .string()
    .min(1, "A palavra-passe é obrigatória")
    .min(8, "A palavra-passe deve ter no mínimo 8 caracteres"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "O nome é obrigatório")
      .min(3, "O nome deve ter no mínimo 3 caracteres"),
    email: z
      .string()
      .min(1, "O email é obrigatório")
      .email("Email inválido"),
    password: z
      .string()
      .min(1, "A palavra-passe é obrigatória")
      .min(8, "A palavra-passe deve ter no mínimo 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "A palavra-passe deve conter pelo menos uma letra maiúscula, uma minúscula e um número"
      ),
    confirmPassword: z
      .string()
      .min(1, "Confirma a tua palavra-passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As palavras-passe não coincidem",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
