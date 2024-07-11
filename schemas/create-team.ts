import { Steps } from "@/types/multi-steps";
import z from "zod";

export const TeamTypeEnum = z.enum(["fut11", "fut7", "fut5"]);
export const languagesEnum = z.enum(["pt", "en", "es"]);

export const CreateTeamSchema = z.object({
	currentStep: z.nativeEnum(Steps).default(Steps.Step1),
	teamName: z.string().min(3).max(50),
	bio: z.string().optional(),
	logo: z.string().optional(),
	location: z.string().optional().default(""),
	language: languagesEnum.default("pt"),
	teamTypes: TeamTypeEnum.default("fut11"),
	radiusPlayerArea: z.array(z.number()).default([0, 10]),
	radiusPlayerAge: z.array(z.number()).default([15, 100]),
});
