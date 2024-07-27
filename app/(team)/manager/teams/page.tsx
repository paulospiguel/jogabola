import { Suspense } from "react";
import { getTeamsByUserId } from "@/actions/team";
import { auth } from "@/auth";
import TeamTable from "@/components/team-table";
import AddNewTeam from "@/components/team/add-new-team";

const fetchTeams = async () => {
	const session = await auth();
	if (!session?.user.id) return [];
	const teams = await getTeamsByUserId(session?.user?.id);
	return teams;
};

export default async function ManagerTeamsPage() {
	const teams = await fetchTeams();

	return (
		<div className="w-full max-w-full px-3 mb-6 mx-auto">
			<div className="relative flex-[1_auto] flex flex-col break-words min-w-0 bg-clip-border rounded-[.95rem] bg-white m-5">
				<div className="relative flex flex-col min-w-0 break-words border border-dashed bg-clip-border rounded-2xl border-stone-200 bg-light/30">
					<div className="px-9 pt-5 flex justify-between items-stretch flex-wrap min-h-[70px] pb-0 bg-transparent">
						<h3 className="flex flex-col items-start justify-center m-2 ml-0 font-medium text-xl/tight text-dark">
							<span className="mr-3 font-semibold text-dark text-3xl">Gestão de equipas</span>
							<span className="mt-1 font-medium text-secondary-dark text-lg/normal">
								Visualize e gerencie suas equipas
							</span>
						</h3>
						<div className="relative flex flex-wrap items-center my-2">
							<AddNewTeam />
						</div>
					</div>
					<Suspense fallback={<div>Carregando...</div>}>
						<TeamTable teams={teams} />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
