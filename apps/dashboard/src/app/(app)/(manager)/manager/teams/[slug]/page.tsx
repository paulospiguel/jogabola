import TeamCard from "@/components/team/team-info-card";
import PlayersList from "@/components/team/players-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { Award, BarChart2, CalendarDays, Newspaper, Trophy, Users } from "@repo/ui/icons";
import TeamTab from "@/components/team/manager-tab/teams.tab";
import { auth } from "@auth";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

const teamData = {
	name: "Estrelas do Futebol FC",
	foundedYear: 1950,
	homeStadium: "Estádio Municipal",
	league: "Liga Principal",
	bio: "Um clube com tradição e paixão pelo futebol, formando estrelas desde 1950.",
};

const tabsList = [
	{ tab: "teams", icon: Trophy },
	{ tab: "season", icon: Award },
	{ tab: "players", icon: Users },
	{ tab: "stats", icon: BarChart2 },
	{ tab: "events", icon: CalendarDays },
	{ tab: "schedule", icon: CalendarDays },
	{ tab: "news", icon: Newspaper },
] as const;

const tabsContent = {
	teams: TeamTab,
	season: () => <div>season</div>,
	players: PlayersList,
	stats: () => <div>stats</div>,
	events: () => <div>events</div>,
	schedule: () => <div>schedule</div>,
	news: () => <div>news</div>,
};

const TeamPage: React.FC = async () => {
	const t = await getTranslations();
	const session = await auth();
	const hasEditPermission = true;

	return (
		<div className="container mx-auto px-4">
			<header className="mb-8 text-center">
				<TeamCard teamData={teamData} hasEditPermission={hasEditPermission} />
			</header>

			<Tabs defaultValue={tabsList[0].tab} className="w-full mx-auto">
				<TabsList className={`grid w-full  bg-primary rounded-lg p-1 mb-6 grid-cols-${tabsList.length}`}>
					{tabsList?.map(({ tab, icon: Icon }) => (
						<TabsTrigger
							key={tab}
							value={tab}
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
			</Tabs>
		</div>
	);
};

export default TeamPage;
