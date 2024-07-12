import { auth } from "@/auth";
import { AppHeader as Header } from "@/components/app-header";
import { redirect } from "next/navigation";

type LayoutProps = {
	children: React.ReactNode;
};

export default async function LayoutInitalSetup({ children }: LayoutProps) {
	const session = await auth();

	if (session?.user.isCompleted) {
		console.log("User is completed");
	}

	return (
		<div className="flex flex-col w-full h-full items-center bg-backgroundPrimary dark:bg-backgroundPrimary-dark">
			<Header />
			<div className="w-full px-4 mt-4 max-w-3xl h-[85vh] overflow-auto">{children}</div>
		</div>
	);
}
