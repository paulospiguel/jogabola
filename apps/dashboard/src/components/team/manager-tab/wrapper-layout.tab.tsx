import Loading from "@/components/loading";
import { dictionary } from "@/dictionary";
import { TabsContent } from "@repo/ui/components/tabs";
import { cn } from "@repo/ui/utils";
import { Suspense } from "react";

const dicitionaryTabs = dictionary.managerTabs;

type WrapperLayoutTabProps = {
	children: React.ReactNode;
	tabKey: string;
	className?: string;
};

export default async function WrapperLayoutTab({ children, tabKey, className }: WrapperLayoutTabProps) {
	const title = dicitionaryTabs[tabKey as keyof typeof dicitionaryTabs];

	return (
		<TabsContent className={cn(className)} value={tabKey}>
			<h1 className="text-center text-2xl">{title}</h1>
			<div className="flex flex-wrap items-center justify-center md:justify-end my-2">{/* <AddNewPlayer /> */}</div>

			<Suspense fallback={<Loading />}>
				<section className="bg-slate-50 py-4 px-2 dark:bg-slate-800 rounded-xl">{children}</section>
			</Suspense>
		</TabsContent>
	);
}
