import NotifyNews from "@/components/notify-news";
import { ManagerTabs } from "@/components/team/manager-tab";

export default async function ManagerTeamsPage() {
  return (
    <div className="mx-auto w-full max-w-full space-y-4 px-3 py-4">
      <div className="relative flex h-full min-w-0 flex-[1_auto] flex-col break-words rounded-[.95rem] bg-white bg-clip-border dark:bg-slate-800">
        <div className="bg-light/30 relative flex min-w-0 flex-col break-words rounded-2xl border shadow-md">
          <div className="flex min-h-[70px] flex-wrap items-stretch justify-between bg-transparent px-9 py-3">
            <h3 className="text-dark m-2 ml-0 flex flex-col items-start justify-center text-xl/tight font-medium">
              <span className="text-dark mr-3 text-3xl font-semibold">
                Gestão de equipas
              </span>
              <span className="text-secondary-dark mt-1 text-lg/normal font-medium">
                Visualize e gerencie suas equipas
              </span>
            </h3>
          </div>
        </div>
      </div>

      <section>{/* <NotifyNews /> */}</section>

      <section className="flex-1">{<ManagerTabs />}</section>
    </div>
  );
}
