import { getPlayerByUser } from "@/actions/player/players.action";
import type { Session } from "next-auth";
import PlayersTable from "../players-table";
import WrapperLayoutTab from "./wrapper-layout.tab";

type TeamsTab = {
	session: Session | null;
	tabKey: string;
};

export default async function PlayersTabContent({ session, tabKey }: TeamsTab) {
	if (!session?.user.id) return null;

	return (
		<WrapperLayoutTab tabKey={tabKey}>
			<PlayersTable />
		</WrapperLayoutTab>
	);
}
