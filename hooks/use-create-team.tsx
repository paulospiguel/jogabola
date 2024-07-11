import { useCreateTeamContext } from "@/context/create-team-context";

export const useCreateTeam = () => {
	const context = useCreateTeamContext();

	return { ...context };
};
