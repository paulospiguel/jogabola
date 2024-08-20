import NotifyNews from "@/components/notify-news";
import { ManagerTabs } from "@/components/team/manager-tab";

export default async function ManagerTeamsPage() {
	return (
		<div className="w-full max-w-full px-3 py-4 space-y-4 mx-auto">
			<div className="relative h-full flex-[1_auto] flex flex-col break-words min-w-0 bg-clip-border rounded-[.95rem] bg-white">
				<div className="relative flex flex-col min-w-0 break-words border shadow-md rounded-2xl  bg-light/30">
					<div className="px-9 py-3 flex justify-between items-stretch flex-wrap min-h-[70px] bg-transparent">
						<h3 className="flex flex-col items-start justify-center m-2 ml-0 font-medium text-xl/tight text-dark">
							<span className="mr-3 font-semibold text-dark text-3xl">Gestão de equipas</span>
							<span className="mt-1 font-medium text-secondary-dark text-lg/normal">
								Visualize e gerencie suas equipas
							</span>
						</h3>
					</div>
				</div>
			</div>

			<section>
				<NotifyNews />
			</section>

			<section className="flex-1">
				<ManagerTabs />
			</section>
		</div>
	);
}
