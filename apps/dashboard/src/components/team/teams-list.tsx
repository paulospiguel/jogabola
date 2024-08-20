"use client";

import { useGetTeams } from "@/hooks/use-create-team";
import TeamsTable from "./teams-table";

export const TeamsList = ({ userId }: { userId: string | undefined }) => {
	if (!userId) return null;

	const { data } = useGetTeams(userId);

	return <TeamsTable teams={data} />;
};
