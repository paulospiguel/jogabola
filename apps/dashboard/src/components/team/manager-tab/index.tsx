import { Calendar, LineChart, PlayerIcon, StadiumIcon, TeamIcon } from "@/components/icons";
import { auth } from "@auth";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs";

import { dictionary } from "@/dictionary";
import { tabKeysSchema } from "@/schemas/manager";
import type { z } from "zod";

import HomeTabContent from "./home.tab";
import PlayersTabContent from "./players.tab";
import CalendarTabContent from "./schedule.tab";
import StatisticsTabContent from "./statistics.tab";
import TeamsTabContent from "./teams.tab";

const tabsValues = tabKeysSchema.Values;
const dicitionaryTabs = dictionary.managerTabs;

type TabsItems = {
	label: z.infer<typeof tabKeysSchema>;
	icon: React.ReactNode;
};

const tabs: TabsItems[] = [
	{
		label: tabsValues.home,
		icon: <StadiumIcon className="size-6 group-data-[state=active]:fill-white" />,
	},
	{
		label: tabsValues.teams,
		icon: <TeamIcon className="size-6 group-data-[state=active]:fill-white" />,
	},
	{
		label: tabsValues.players,
		icon: <PlayerIcon className="size-5 group-data-[state=active]:fill-white" />,
	},
	{
		label: tabsValues.schedule,
		icon: <Calendar className="size-5 group-data-[state=active]:text-white" />,
	},
	{
		label: tabsValues.statistics,
		icon: <LineChart className="size-5 group-data-[state=active]:text-white" />,
	},
];

export async function ManagerTabs() {
	const session = await auth();

	return (
		<>
			<Tabs defaultValue={tabsValues.home} className="w-full">
				<TabsList className="mx-auto w-full bg-primary h-14">
					{tabs.map((tab) => (
						<TabsTrigger key={tab.label} value={tab.label} className="group">
							<div className="space-x-2 flex items-center group-data-[state=inactive]:opacity-70">
								{tab.icon && <span>{tab.icon}</span>}
								<span>{dicitionaryTabs[tab.label]}</span>
							</div>
						</TabsTrigger>
					))}
				</TabsList>
				<HomeTabContent tabKey={tabsValues.home} session={session} />
				<TeamsTabContent tabKey={tabsValues.teams} session={session} />
				<PlayersTabContent tabKey={tabsValues.players} session={session} />
				<CalendarTabContent tabKey={tabsValues.schedule} session={session} />
				<StatisticsTabContent tabKey={tabsValues.statistics} session={session} />
			</Tabs>
		</>
	);
}
