import { getTeamInfoBySlug } from "@/actions/team";
import NavTabs from "@/components/nav-tabs";
import { Home } from "lucide-react";
import Image from "next/image";

type TeamManagerPageProps = {
	params: {
		slug: string;
	};
};

const fetchTeamInfo = async (teamId: string) => {
	const response = await getTeamInfoBySlug(teamId);
	return response;
};

export default async function TeamManagerPage({ params }: TeamManagerPageProps) {
	const teamInfo = await fetchTeamInfo(params.slug);
	return (
		<div className="flex flex-col w-full h-full items-center bg-backgroundPrimary dark:bg-backgroundPrimary-dark">
			<NavTabs
				tabs={[
					{
						label: "HOME",
						icon: <Home className="h-6 w-6" />,
					},
					{
						label: "Teams",
						icon: <Image alt="" width={24} height={24} src={require("@/assets/icons/tshirt-ball.png")} />,
					},
					{
						label: "Players",
					},
					{
						label: "Schedule",
					},
				]}
			/>

			<pre>{JSON.stringify(teamInfo, null, 2)}</pre>
		</div>
	);
}
