"use server";

import { teamSchema } from "@/schemas/create-team";
import type { z } from "zod";
import teamService from "@/services/team";

export async function createNewTeam(data: z.infer<typeof teamSchema>) {
	const valid = teamSchema.safeParse(data);

	if (!valid.success) {
		return {
			error: "Dados inválidos",
		};
	}

	try {
		const { createTeam } = teamService;

		const response = await createTeam(data);

		if (response?.id) {
			return {
				success: "Time criado com sucesso",
				data: response,
			};
		}
	} catch (error) {
		throw error as Error;
	}
}

export async function getTeamInfo(teamId: string) {
	const response = await teamService.getTeamInfo(teamId);

	if (response) {
		return response;
	}

	return {
		error: "Time não encontrado",
	};

}

export async function checkTeamName(teamName: string) {
	const response = await teamService.checkTeamName(teamName);

	if (response) {
		return {
			error: "Nome de time já existe",
		};
	}

	return {
		success: "Nome de time disponível",
	};
}
