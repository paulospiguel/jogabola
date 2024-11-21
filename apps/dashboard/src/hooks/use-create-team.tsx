import { getTeamsByUserId } from "@/actions/team";
import { teamStore } from "@/store/team.store";

export const useGetTeams = async (userId: string) => {
	const responseTeam = await getTeamsByUserId({ userId });

	teamStore.setState((state) => ({
		...state,
		createdTeamCounter: responseTeam?.data?.length || 0,
	}));

	return responseTeam;
};
