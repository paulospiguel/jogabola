import { z } from "zod";

// Enums
export const roleSchema = z.enum(["PLAYER", "MANAGER", "FAN", "ORGANIZER"], {
  required_error: "Seleciona o teu papel",
  invalid_type_error: "Papel inválido",
});

export const experienceSchema = z.enum(
  ["beginner", "intermediate", "advanced", "professional"],
  {
    required_error: "Seleciona o teu nível de experiência",
    invalid_type_error: "Nível de experiência inválido",
  }
);

export const availabilitySchema = z.enum(
  ["weekends", "evenings", "flexible", "specific"],
  {
    required_error: "Seleciona a tua disponibilidade",
    invalid_type_error: "Disponibilidade inválida",
  }
);

// Preferences schema
export const preferencesSchema = z.object({
  notifications: z.boolean().default(true),
  newsletter: z.boolean().default(true),
  earlyAccess: z.boolean().default(true),
});

// Main onboarding schema
export const onboardingSchema = z.object({
  role: roleSchema,
  name: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  email: z.string().email("Email inválido"),
  location: z
    .string()
    .min(2, "Localização deve ter pelo menos 2 caracteres")
    .max(100, "Localização deve ter no máximo 100 caracteres")
    .optional()
    .or(z.literal("")),
  experience: experienceSchema.optional().or(z.literal("")),
  goals: z
    .array(z.string())
    .min(1, "Seleciona pelo menos um objetivo")
    .max(10, "Máximo de 10 objetivos"),
  availability: availabilitySchema.optional().or(z.literal("")),
  preferences: preferencesSchema,
  waitlistApps: z.array(z.string()).default([]),
});

// Step-specific schemas for progressive validation
export const step1Schema = z.object({
  role: roleSchema,
});

export const step2Schema = z.object({
  name: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  email: z.string().email("Email inválido"),
  location: z
    .string()
    .min(2, "Localização deve ter pelo menos 2 caracteres")
    .optional()
    .or(z.literal("")),
  experience: experienceSchema.optional().or(z.literal("")),
  availability: availabilitySchema.optional().or(z.literal("")),
});

export const step3Schema = z.object({
  goals: z
    .array(z.string())
    .min(1, "Seleciona pelo menos um objetivo")
    .max(10, "Máximo de 10 objetivos"),
});

export const step4Schema = z.object({
  waitlistApps: z.array(z.string()),
  preferences: preferencesSchema,
});

// Types
export type OnboardingData = z.infer<typeof onboardingSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Availability = z.infer<typeof availabilitySchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
