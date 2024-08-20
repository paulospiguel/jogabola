import { AppHeader as Header } from "@/components/horizontal-header";

type LayoutProps = {
	children: React.ReactNode;
};

export default async function LayoutInitalSetup({ children }: LayoutProps) {
	return (
		<div className="flex flex-col w-full h-full items-center bg-primary dark:bg-primary-dark">
			<Header />
			<div className="w-full px-4 mt-4 max-w-3xl h-[85vh] overflow-auto">{children}</div>
		</div>
	);
}
