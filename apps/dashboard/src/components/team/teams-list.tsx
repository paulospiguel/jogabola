import { getTeamsByUserId } from "@/actions/team";
import TeamsTable from "./teams-table";

export const TeamsList = async ({ userId }: { userId: string | undefined }) => {
	if (!userId) return null;

	const teams = await getTeamsByUserId({
		userId,
	});

	return <TeamsTable teams={teams?.data || []} />;
};
