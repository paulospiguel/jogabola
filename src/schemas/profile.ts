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
  },
);

export const availabilitySchema = z.enum(
  ["weekends", "evenings", "flexible", "specific"],
  {
    required_error: "Seleciona a tua disponibilidade",
    invalid_type_error: "Disponibilidade inválida",
  },
);

// Preferences schema
export const preferencesSchema = z.object({
  notifications: z.boolean().default(true),
  newsletter: z.boolean().default(true),
  earlyAccess: z.boolean().default(true),
});

// Helper function to create slug from nickname
export function createSlugFromNickname(nickname: string): string {
  return nickname
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-") // Replace non-alphanumeric with dash
    .replace(/-+/g, "-") // Replace multiple dashes with single dash
    .replace(/^-|-$/g, ""); // Remove leading/trailing dashes
}

// Gerar nickname automático baseado no nome + número aleatório curto
export function generateNicknameFromName(name: string): string {
  // Remover acentos e caracteres especiais, converter para minúsculas
  const normalized = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais exceto espaços e traços
    .trim()
    .replace(/\s+/g, "-") // Substitui espaços por traços
    .replace(/-+/g, "-") // Remove traços múltiplos
    .replace(/^-|-$/g, ""); // Remove traços no início/fim

  // Pegar primeiras palavras (máximo 20 caracteres para base)
  // Considerar que vamos adicionar "-" + 3 dígitos = 4 caracteres extras
  // Total máximo é 30, então base pode ter até 26 caracteres
  let base = normalized.substring(0, 26);
  
  // Se terminar com traço, remover
  base = base.replace(/-+$/, "");
  
  // Adicionar número aleatório curto (3 dígitos)
  const randomNum = Math.floor(Math.random() * 900) + 100; // 100-999
  
  const generated = `${base}-${randomNum}`;
  
  // Garantir que não ultrapasse 30 caracteres
  return generated.substring(0, 30);
}

// Main onboarding schema
export const onboardingSchema = z.object({
  role: roleSchema,
  name: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  nickname: z
    .string()
    .min(3, "O nickname deve ter pelo menos 3 caracteres")
    .max(30, "O nickname deve ter no máximo 30 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "O nickname deve conter apenas letras minúsculas, números e traços"
    )
    .optional()
    .or(z.literal("")),
  email: z.string().email("Email inválido"),
  dateOfBirth: z.date().optional().or(z.literal(null)),
  nationality: z.string().optional().or(z.literal("")), // nacionalidade
  country: z.string().optional().or(z.literal("")), // país
  city: z.string().optional().or(z.literal("")), // cidade
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
  // Campos personalizados por role (armazenados como JSON)
  customFields: z.record(z.string(), z.any()).optional().default({}),
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
  nickname: z
    .string()
    .min(3, "O nickname deve ter pelo menos 3 caracteres")
    .max(30, "O nickname deve ter no máximo 30 caracteres")
    .regex(
      /^[a-z0-9-]+$/,
      "O nickname deve conter apenas letras minúsculas, números e traços"
    )
    .optional()
    .or(z.literal("")),
  email: z.string().email("Email inválido"),
  dateOfBirth: z.date().optional().or(z.literal(null)),
  nationality: z.string().optional().or(z.literal("")), // nacionalidade
  country: z.string().optional().or(z.literal("")), // país
  city: z.string().optional().or(z.literal("")), // cidade
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
