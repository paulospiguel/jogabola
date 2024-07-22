import { AppHeader } from "@/components/app-header";

type LayoutProps = {
	children: React.ReactNode;
};

export default async function LayoutManageTeam({ children }: LayoutProps) {
	return (
		<div className="flex flex-col w-full h-full items-center bg-backgroundPrimary dark:bg-backgroundPrimary-dark">
			<AppHeader />
			<div className="w-full px-4 mt-4 max-w-7xl h-[85vh] overflow-auto">{children}</div>
		</div>
	);
}
