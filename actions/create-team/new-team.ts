"use server";

import { CreateTeamSchema } from "@/schemas/create-team";
import type { z } from "zod";

export async function newTeam(data: z.infer<typeof CreateTeamSchema>) {
	const valid = CreateTeamSchema.safeParse(data);

	if (!valid.success) {
		return {
			error: "Dados inválidos",
		};
	}

	try {
		// Create team
		console.log("Creating team with data", data);
		return {
			success: "Equipa criada com sucesso",
		};
	} catch (error) {
		throw error;
	}
}
