import { getTeamsByUserId"@/actiactiactions
import { useCreateTeamContexttexttext } contexttcreate-extt-contextcreate-ext/-contextcreate-team-context";
import { teamStore } from "@/store/team.store";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useCreateTeam = () => {
	const context = useCreateTeamContext();

	return { ...context };
};

export const useGetTeams = (userId: string) => {
	const responseTeam = useSuspenseQuery({
		queryKey: ["teams", userId],
		queryFn: () => getTeamsByUserId(userId),
	});

	teamStore.setState((state) => ({
		...state,
		createdTeamCounter: responseTeam.data.length,
	}));

	return responseTeam;
};
