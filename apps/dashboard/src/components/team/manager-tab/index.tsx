import { PlayerIcon, ShoesSoccer, StadiumIcon, TeamIcon } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { auth } from "@auth";

import { dictionary } from "@/dictionary";
import { tabKeysSchema } from "@/schemas";
import { object, type z } from "zod";

import FieldsTabContent from "./fileds.tab";
import PlayersTabContent from "./players.tab";
import CalendarTabContent from "./schedule.tab";
import StatisticsTabContent from "./statistics.tab";
import TeamsTabContent from "./teams.tab";
import { Calendar, LineChart } from "@repo/ui/icons";
import EventsTabContent from "./events.tab";
import MatchesTabContent from "./matches.tab";

const tabsValues = tabKeysSchema.Values;
const dicitionaryTabs = dictionary.managerTabs;

type TabsItems = {
	label: z.infer<typeof tabKeysSchema>;
	icon: React.ReactNode;
	order?: number;
};

const tabs: TabsItems[] = [
	{
		order: 3,
		label: tabsValues.myteams,
		icon: <TeamIcon className="size-6 group-data-[state=active]:fill-white" />,
	},
	// {
	// 	order: 2,
	// 	label: tabsValues.players,
	// 	icon: <PlayerIcon className="size-5 group-data-[state=active]:fill-white" />,
	// },
	{
		order: 4,
		label: tabsValues.matches,
		icon: <ShoesSoccer className="size-6 group-data-[state=active]:fill-white" />,
	},
	{
		label: tabsValues.events,
		icon: <Calendar className="size-5 group-data-[state=active]:text-white" />,
	},
	/*{
		label: tabsValues.fields,
		icon: <StadiumIcon className="size-6 group-data-[state=active]:fill-white" />,
	},
	 	{
		label: tabsValues.schedule,
		icon: <Calendar className="size-5 group-data-[state=active]:text-white" />,
	},
	{
		label: tabsValues.statistics,
		icon: <LineChart className="size-5 group-data-[state=active]:text-white" />,
	}, */
]?.sort((a, b) => (a?.order || 0) - (b?.order || 0));

export async function ManagerTabs() {
	const session = await auth();

	return (
		<>
			<Tabs httpState className="w-full" defaultValue={tabsValues.events}>
				<TabsList className="mx-auto w-full bg-primary h-14">
					{tabs?.map((tab) => (
						<TabsTrigger key={tab.label} value={tab.label} className="group">
							<div className="space-x-2 flex items-center group-data-[state=inactive]:opacity-70">
								{tab.icon && <span>{tab.icon}</span>}
								<span>{dicitionaryTabs[tab.label]}</span>
							</div>
						</TabsTrigger>
					))}
				</TabsList>
				<TeamsTabContent tabKey={tabsValues.myteams} session={session} />
				<FieldsTabContent tabKey={tabsValues.fields} session={session} />
				<PlayersTabContent tabKey={tabsValues.players} session={session} />
				<CalendarTabContent tabKey={tabsValues.schedule} session={session} />
				<StatisticsTabContent tabKey={tabsValues.statistics} session={session} />
				<EventsTabContent tabKey={tabsValues.events} session={session} />
				<MatchesTabContent tabKey={tabsValues.matches} session={session} />
			</Tabs>
		</>
	);
}
