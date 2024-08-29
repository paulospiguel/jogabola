import { Steps } from "@/types";
import * as z from "zod";

export const teamShapeEnum = z.enum(["fut11", "fut7", "fut5"]);
export const languagesEnum = z.enum(["pt", "en", "es"]);

export const teamSchema = z.object({
	id: z.string().optional(),
	currentStep: z.nativeEnum(Steps).default(Steps.Step1),
	termsOfUse: z.boolean().default(false),
	name: z.string({
		required_error: "Nome da equipa é obrigatório",
	}).min(3).max(50),
	isPublic: z.boolean().default(false),
	bio: z.string().optional(),
	logo: z.string().optional(),
	location: z.string().optional(),
	language: languagesEnum.default(languagesEnum.options[0]),
	teamShape: teamShapeEnum.default(teamShapeEnum.options[0]),
	radiusPlayerArea: z.array(z.number()).default([0, 10]),
	radiusPlayerAge: z.array(z.number()).default([15, 100]),
	slug: z.string().optional(),
	temaMember: z.array(
		z.object({
			userId: z.string(),
			role: z.string(),
		})
	).optional(),


});
