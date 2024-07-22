"use server";

import { teamSchema } from "@/schemas/create-team";
import { checkTeamByName, checkUserHasTeam, createTeam, getRolesByUser, getTeamByUser, getTeamInfo } from "@/services/team";
import type { Role } from "@/schemas/roles";
import type { z } from "zod";

export async function createNewTeam(data: z.infer<typeof teamSchema>) {
	const valid = teamSchema.safeParse(data);

	if (!valid.success) {
		return {
			error: "Dados inválidos",
		};
	}

	try {

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

export async function getTeamInformation(teamId: string) {
	const response = await getTeamInfo(teamId);

	if (response) {
		return response;
	}

	return {
		error: "Time não encontrado",
	};

}

export async function checkTeamName(teamName: string) {
	if (!teamName) {
		return {}
	}
	const response = await checkTeamByName(teamName);

	if (response) {
		return {
			error: "Nome de time já existe",
		};
	}

	return {
		success: "Nome de time disponível",
	};
}

export async function checkUserTeam(userId: string): Promise<boolean> {
	return await checkUserHasTeam(userId);
}

export async function getRolesByUserId(userId: string): Promise<Role[]> {
	const response = await getRolesByUser(userId);

	if (response) {
		return response
	}

	return [];
}

export async function getTeamsByUserId(userId: string): Promise<z.infer<typeof teamSchema>[]> {
	const response = await getTeamByUser(userId);

	console.log(response[0].teamMember.length);
	if (response) {
		return response.map((resp) => ({
			...resp,
			radiusPlayerAge: [resp.minRadiusPlayerAge, resp.maxRadiusPlayerAge],
			radiusPlayerArea: [resp.minRadiusPlayerArea, resp.maxRadiusPlayerArea],
		}));
	}

	return [];
}

export async function getTeamInfoBySlug(slug: string) {
	const response = await getTeamInfo(undefined, slug);

	if (response) {
		return response;
	}

	return {
		error: "Time não encontrado",
	};
}
