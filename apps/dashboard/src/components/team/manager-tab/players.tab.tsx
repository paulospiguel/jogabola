import type { Session } from "next-auth";
import WrapperLayoutTab from "./wrapper-layout.tab";

type TeamsTab = {
	session: Session | null;
	tabKey: string;
};

export default async function PlayersTabContent({ session, tabKey }: TeamsTab) {
	return <WrapperLayoutTab tabKey={tabKey}> </WrapperLayoutTab>;
}
