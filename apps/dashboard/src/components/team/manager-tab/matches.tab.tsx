import type { Session } from "next-auth";
import WrapperLayoutTab from "./wrapper-layout.tab";

interface MatchesTabProps {
	tabKey: string;
	session: Session | null;
}

export default function MatchesTabContent({ tabKey }: MatchesTabProps) {
	return <WrapperLayoutTab tabKey={tabKey}> </WrapperLayoutTab>;
}
