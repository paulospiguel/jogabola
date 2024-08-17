import Loading from "@/components/loading";
import { TabsContent } from "@/components/ui/tabs";
import { dictionary } from "@/dictionary";
import { cn } from "@/lib/utils";
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

			<Suspense fallback={<Loading />}>{children}</Suspense>
		</TabsContent>
	);
}
