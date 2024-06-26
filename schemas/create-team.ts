import z from "zod";

export const TeamType = z.enum(["fut11", "fut7", "fut5"]);

export const CreateTeamSchema = z.object({
	teamName: z.string().nonempty("Nome da equipa é obrigatório."),
	bio: z.string().optional(),
	logo: z.string().optional(),
	location: z.string().optional(),
	language: z.string().optional().default("pt"),
	teamTypes: TeamType.default("fut11"),
	radiusPlayerArea: z.array(z.number()).default([0, 5]),
	radiusPlayerAge: z.array(z.number()).default([18, 35]),
});
