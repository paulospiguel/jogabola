import { auth } from "@/auth";
import { redirect } from "next/navigation";

type LayoutProps = {
	children: React.ReactNode;
};

export default async function LayoutManageTeam({ children }: LayoutProps) {
	const session = await auth();

	if (session?.user.isCompleted) {
		console.log("User is completed");
		redirect("/onboarding");
	}

	return <>{children}</>;
}
