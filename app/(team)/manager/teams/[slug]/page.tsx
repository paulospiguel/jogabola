import { getTeamInfoBySlug } from "@/actions/team";

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
			<pre>{JSON.stringify(teamInfo, null, 2)}</pre>
		</div>
	);
}
