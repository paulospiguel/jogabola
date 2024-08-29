import { getTeamsByUserId } from "@/actions/team";
import { useCreateTeamContext } from "@/context/create-team-context";
import { teamStore } from "@/store/team.store";

export const useCreateTeam = () => {
	const context = useCreateTeamContext();

	return { ...context };
};

export const useGetTeams = async (userId: string) => {
	const [responseTeam] = await getTeamsByUserId({ userId });

	console.log({ responseTeam });

	teamStore.setState((state) => ({
		...state,
		createdTeamCounter: responseTeam?.length || 0,
	}));

	return responseTeam;
};
