import Loading from "@/components/loading";
import AddNewTeam from "@/components/team/add-new-team";
import { TeamsList } from "@/components/team/teams-list";
import { TabsContent } from "@/components/ui/tabs";
import { dictionary } from "@/dictionary";
import type { Session } from "next-auth";
import React, { Suspense } from "react";

const dicitionaryTabs = dictionary.managerTabs;

type TeamsTab = {
	session: Session | null;
	tabKey: string;
};

export default async function TeamsTabContent({ session, tabKey }: TeamsTab) {
	const title = dicitionaryTabs[tabKey as keyof typeof dicitionaryTabs];

	return (
		<TabsContent value={tabKey}>
			<h1 className="text-center text-2xl">{title}</h1>
			<div className="flex flex-wrap items-center justify-center md:justify-end my-2">
				<AddNewTeam />
			</div>

			<Suspense fallback={<Loading />}>
				<TeamsList userId={session?.user.id} />
			</Suspense>
		</TabsContent>
	);
}
