import { Steps } from "@/types/multi-steps";
import z from "zod";

export const teamShapeEnum = z.enum(["fut11", "fut7", "fut5"]);
export const languagesEnum = z.enum(["pt", "en", "es"]);

export const teamSchema = z.object({
	id: z.string().optional(),
	currentStep: z.nativeEnum(Steps).default(Steps.Step1),
	termsOfUse: z.boolean().default(false),
	teamName: z.string().min(3).max(50),
	bio: z.string().optional(),
	logo: z.string().optional(),
	location: z.string().optional(),
	language: languagesEnum.default(languagesEnum.options[0]),
	teamShape: teamShapeEnum.default(teamShapeEnum.options[0]),
	radiusPlayerArea: z.array(z.number()).default([0, 10]),
	radiusPlayerAge: z.array(z.number()).default([15, 100]),
});
