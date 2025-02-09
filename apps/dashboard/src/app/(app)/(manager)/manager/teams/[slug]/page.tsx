import { Suspense } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import {
  BarChart2,
  CalendarDays,
  Newspaper,
  Shield,
  Trophy,
  Users,
} from "@repo/ui/icons";
import { auth } from "@auth";
import { getTranslations } from "next-intl/server";
import PlayersList from "@/components/team/players-list";
import TeamCard from "@/components/team/team-info-card";
import CompetitionsTab from "@/components/team/manager-tab/competitions.tab";
import TeamTab from "./components/tabs-team/teams.tab";
import { cn } from "@repo/utils";
import { getTeamInfo } from "@/actions";

// const teamData = {
//   name: "Estrelas do Futebol FC",
//   foundedYear: 1950,
//   homeStadium: "Estádio Municipal",
//   league: "Liga Principal",
//   bio: "Um clube com tradição e paixão pelo futebol, formando estrelas desde 1950.",
// };

const tabsList = [
  { tab: "team", icon: Shield, isDisabled: false },
  { tab: "season", icon: Trophy, isDisabled: false },
  { tab: "players", icon: Users, isDisabled: false },
  { tab: "stats", icon: BarChart2, isDisabled: true },
  { tab: "events", icon: CalendarDays, isDisabled: true },
  { tab: "schedule", icon: CalendarDays, isDisabled: true },
  { tab: "news", icon: Newspaper, isDisabled: true },
] as const;

const tabsContent = {
  team: TeamTab,
  season: CompetitionsTab,
  players: PlayersList,
  stats: () => <div>stats</div>,
  events: () => <div>events</div>,
  schedule: () => <div>schedule</div>,
  news: () => <div>news</div>,
};

type TeamPageProps = {
  params: Promise<{ slug: string }>;
};

const TeamPage = async ({ params }: TeamPageProps) => {
  const { slug } = await params;
  const t = await getTranslations();
  const session = await auth();

  const teamData = await getTeamInfo({
    teamId: slug,
  });

  const hasEditPermission = teamData?.data?.hasEditPermission;

  console.log({ teamData });

  return (
    <div className="container mx-auto px-0 md:px-4">
      <header className="text-center">
        <TeamCard
          teamData={{
            bio: teamData?.data?.bio || "",
            image: teamData?.data?.logo || "",
            name: teamData?.data?.name || "",
          }}
          hasEditPermission={hasEditPermission}
        />
      </header>

      {/*<Tabs defaultValue={tabsList[0].tab} className="w-full mx-auto">
        <TabsList
          className={cn(
            "grid w-full bg-primary rounded-lg p-1 mb-6, grid-cols-10",
            {
              "grid-cols-1": tabsList.length >= 1,
              "grid-cols-2": tabsList.length >= 2,
              "grid-cols-3": tabsList.length >= 3,
              "grid-cols-4": tabsList.length >= 4,
              "grid-cols-5": tabsList.length >= 5,
              "grid-cols-6": tabsList.length >= 6,
              "grid-cols-7": tabsList.length === 7,
            }
          )}
        >
          {tabsList?.map(({ tab, icon: Icon, isDisabled }) => (
            <TabsTrigger
              key={tab}
              value={tab}
              disabled={isDisabled}
              className="rounded-xl text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow"
            >
              <Icon className="h-4 w-4 mr-2" />
              {t(`tabs.${tab}`)}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(tabsContent).map(([key, Comp]) => (
          <TabsContent key={key} value={key}>
            <Suspense fallback={<div>Loading...</div>}>
              <Comp session={session} hasEditPermission={hasEditPermission} />
            </Suspense>
          </TabsContent>
        ))}
      </Tabs> */}
    </div>
  );
};

export default TeamPage;
