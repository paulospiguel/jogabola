import type { Session } from "next-auth";
import AddNewTeam from "@/components/team/add-new-team";
import { TeamsList } from "@/components/team/teams-list";
import WrapperLayoutTab from "./wrapper-layout.tab";

type TeamsTab = {
	session: Session | null;
	tabKey: string;
};

export default async function TeamsTabContent({ session, tabKey }: TeamsTab) {
	return (
		<WrapperLayoutTab tabKey={tabKey}>
			<div className="flex flex-wrap items-center justify-center md:justify-end my-2">{/* <AddNewTeam /> */}</div>

			<TeamsList userId={session?.user.id} />
		</WrapperLayoutTab>
	);
}
