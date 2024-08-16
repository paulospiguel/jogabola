import { Calendar, PlayerIcon, StadiumIcon, TeamIcon } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@auth";

import { dictionary } from "@/dictionary";
import { tabKeysSchema } from "@/schemas/manager";
import type { z } from "zod";
import PlayersTabContent from "./players.tab";
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
		icon: <StadiumIcon className="group-data-[state=active]:fill-white" width={24} height={24} />,
	},
	{
		label: tabsValues.teams,
		icon: <TeamIcon className="group-data-[state=active]:fill-white" width={24} height={24} />,
	},
	{
		label: tabsValues.players,
		icon: <PlayerIcon className="group-data-[state=active]:fill-white" width={24} height={24} />,
	},
	{
		label: tabsValues.schedule,
		icon: <Calendar className="size-5 group-data-[state=active]:text-white" />,
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
				<TeamsTabContent tabKey={tabsValues.teams} session={session} />
				<PlayersTabContent tabKey={tabsValues.players} session={session} />
			</Tabs>
		</>
	);
}
