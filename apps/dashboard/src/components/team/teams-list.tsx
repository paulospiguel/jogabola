import { getTeamsByUserId } from "@/actions/team";
import TeamsTable from "./teams-table";
import { useAction } from "next-safe-action/hooks";

export const TeamsList = async ({ userId }: { userId: string | undefined }) => {
  if (!userId) return null;

  const { result: teams } = useAction(getTeamsByUserId, {
		executeOnMount: {
			input: {
				userId
			}
		},
	});

  return <TeamsTable teams={teams?.data!} />;
};
