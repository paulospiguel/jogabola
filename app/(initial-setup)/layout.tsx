import { Logo } from "@/components/logo";

type LayoutProps = {
	children: React.ReactNode;
};

export default function LayoutInitalSetup({ children }: LayoutProps) {
	return (
		<div className="[background:radial-gradient(125%_125%_at_50%_10%,rgb(22,163,74)_25%,#086_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#086_100%)] flex flex-col w-full min-h-full items-center justify-center">
			<div className="max-w-7xl mx-4 flex flex-col">
				<Logo size="large" className="mx-auto" />
			</div>
			<div>{children}</div>
		</div>
	);
}
