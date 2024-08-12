import VerticalHeader from "@/components/vertical-header";

type LayoutProps = {
	children: React.ReactNode;
};

export default async function LayoutManageTeam({ children }: LayoutProps) {
	return (
		<div className="flex w-full h-full items-center">
			<VerticalHeader />
			<div className="w-full px-4 overflow-auto">{children}</div>
		</div>
	);
}
