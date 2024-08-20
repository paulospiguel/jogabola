import type { Session } from "next-auth";
import { TeamCharts } from "../team-charts";
import WrapperLayoutTab from "./wrapper-layout.tab";

interface StatisticsTabProps {
	tabKey: string;
	session: Session | null;
}

export default function StatisticsTabContent({ tabKey }: StatisticsTabProps) {
	return (
		<WrapperLayoutTab tabKey={tabKey}>
			<TeamCharts />
		</WrapperLayoutTab>
	);
}
