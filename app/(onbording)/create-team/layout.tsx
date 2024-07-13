import { auth } from "@/auth";
import { CreateTeamProvider } from "@/context/create-team-context";
import { redirect } from "next/navigation";

import routes from "@/constants/routes";

type LayoutProps = {
	children: React.ReactNode;
};

export default async function ManagerCreateTeam({ children }: LayoutProps) {
	const session = await auth();

	// if (!session) {
	// 	redirect(routes.auth.login);
	// }

	return <CreateTeamProvider>{children}</CreateTeamProvider>;
}
