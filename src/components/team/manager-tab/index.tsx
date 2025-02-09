import {
  PlayerIcon,
  ShoesSoccer,
  StadiumIcon,
  MultiShield2 as MultiShield,
} 
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@auth";
import type { z } from "zod";
import { tabKeysSchema } from "@/schemas";
import {
  Calendar,
  CrownIcon,
  ShieldEllipsisIcon,
  Trophy,
} 
import TeamsTabContent from "./teams.tab";
import { getTranslations } from "next-intl/server";

// import FieldsTabContent from "./fileds.tab";
// import PlayersTabContent from "./players.tab";
// import CalendarTabContent from "./schedule.tab";
// import StatisticsTabContent from "./statistics.tab";
// import EventsTabContent from "./events.tab";
// import MatchesTabContent from "./matches.tab";
// import CompetitionsTabContent from "./competitions.tab";

const tabsValues = tabKeysSchema.Values;

type TabsItems = {
  label: z.infer<typeof tabKeysSchema>;
  icon: React.ReactNode;
  order?: number;
  isPremium?: boolean;
  isDisabled?: boolean;
};

export async function ManagerTabs() {
  const session = await auth();
  const t = await getTranslations();

  const tabs: TabsItems[] = [
    {
      order: 1,
      label: tabsValues.myTeams,
      icon: (
        <MultiShield className="size-5 stroke-red-500 group-data-[state=active]:text-white" />
      ),
    },
    {
      order: 4,
      label: tabsValues.matches,
      icon: (
        <ShoesSoccer className="size-6 group-data-[state=active]:fill-white" />
      ),
      isPremium: true,
      isDisabled: true,
    },
    {
      order: 2,
      label: tabsValues.events,
      icon: (
        <Calendar className="size-5 group-data-[state=active]:text-white" />
      ),
      isDisabled: true,
      isPremium: true,
    },
    {
      order: 5,
      label: tabsValues.myCompetitions,
      icon: <Trophy className="size-5 group-data-[state=active]:text-white" />,
      isPremium: true,
      isDisabled: true,
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

  const defaultTab = tabs.find(tab => !tab.isDisabled)?.label;

  return (
    <>
      <Tabs httpState className="w-full" defaultValue={defaultTab}>
        <TabsList className="mx-auto h-14 w-full bg-primary">
          {tabs?.map(tab => (
            <TabsTrigger
              disabled={tab?.isDisabled}
              key={tab.label}
              value={tab.label}
              className="group border data-[state=inactive]:border-transparent"
            >
              <div className="flex items-center group-data-[state=inactive]:opacity-70">
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                <span>{t(`tabs.${tab.label}`)}</span>
                {tab.isPremium && tab.isDisabled && (
                  <CrownIcon className="ml-1 size-3 group-data-[state=active]:fill-white" />
                )}
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
        <TeamsTabContent tabKey={tabsValues.myTeams} session={session} />
        {/*<FieldsTabContent tabKey={tabsValues.fields} session={session} />
				<PlayersTabContent tabKey={tabsValues.players} session={session} />
				<CalendarTabContent tabKey={tabsValues.schedule} session={session} />
				<StatisticsTabContent tabKey={tabsValues.statistics} session={session} />
				<EventsTabContent tabKey={tabsValues.events} session={session} />
				<CompetitionsTabContent tabKey={tabsValues.competitions} session={session} />
				<MatchesTabContent tabKey={tabsValues.matches} session={session} /> */}
      </Tabs>
    </>
  );
}
