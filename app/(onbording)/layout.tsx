import { Logo } from "@/components/logo";

type LayoutProps = {
	children: React.ReactNode;
};

export default function LayoutInitalSetup({ children }: LayoutProps) {
	return (
		<div className="[background:radial-gradient(125%_125%_at_50%_10%,rgb(22,163,74)_25%,#086_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#086_100%)] flex flex-col w-full pb-6 min-h-full items-center justify-center">
			<div className="mx-4 mb-2 flex flex-col">
				<Logo size="large" className="mx-auto" />
			</div>
			<div className="w-full px-4 max-w-3xl h-[80vh]  overflow-auto">{children}</div>
		</div>
	);
}
