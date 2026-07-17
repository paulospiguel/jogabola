import { z } from "zod";

/**
 * Auto-avaliação do atleta — fonte única de verdade para posições,
 * skills e cálculo do overall. Partilhado entre server actions e UI
 * (por isso vive fora de um ficheiro "use server").
 */

export const POSITIONS = ["GK", "DEF", "MID", "FWD"] as const;
export type Position = (typeof POSITIONS)[number];

/** Skills de campo (escala 1–10), comuns a todas as posições. */
export const OUTFIELD_SKILLS = [
  "finishing",
  "defense",
  "passing",
  "pace",
  "physical",
  "technique",
] as const;
export type OutfieldSkill = (typeof OUTFIELD_SKILLS)[number];

/** Skill extra, só relevante quando a posição principal é guarda-redes. */
export const GK_SKILL = "goalkeeping" as const;

export const RATING_MIN = 1;
export const RATING_MAX = 10;

/** Rating neutro para atletas confirmados ainda sem auto-avaliação. */
export const DEFAULT_RATING = 6.5;

export interface SelfAssessment {
  primaryPosition: Position;
  secondaryPosition: Position | null;
  finishing: number;
  defense: number;
  passing: number;
  pace: number;
  physical: number;
  technique: number;
  goalkeeping: number | null;
  overall: number;
}

const ratingValue = z.coerce.number().int().min(RATING_MIN).max(RATING_MAX);

export const selfAssessmentInputSchema = z
  .object({
    primaryPosition: z.enum(POSITIONS),
    secondaryPosition: z.enum(POSITIONS).nullable().optional(),
    finishing: ratingValue,
    defense: ratingValue,
    passing: ratingValue,
    pace: ratingValue,
    physical: ratingValue,
    technique: ratingValue,
    goalkeeping: ratingValue.nullable().optional(),
  })
  .refine(
    data =>
      data.primaryPosition !== "GK" || typeof data.goalkeeping === "number",
    {
      message: "goalkeeping rating required for goalkeepers",
      path: ["goalkeeping"],
    },
  );

export type SelfAssessmentInput = z.infer<typeof selfAssessmentInputSchema>;

/**
 * Overall automático = média das skills avaliadas (1 casa decimal).
 * Inclui guarda-redes apenas quando preenchido (posição GK).
 */
export function computeOverall(input: {
  finishing: number;
  defense: number;
  passing: number;
  pace: number;
  physical: number;
  technique: number;
  goalkeeping?: number | null;
}): number {
  const values = [
    input.finishing,
    input.defense,
    input.passing,
    input.pace,
    input.physical,
    input.technique,
  ];
  if (typeof input.goalkeeping === "number") {
    values.push(input.goalkeeping);
  }
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / values.length) * 10) / 10;
}
