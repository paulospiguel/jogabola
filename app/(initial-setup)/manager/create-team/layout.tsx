import { CreateTeamProvider } from "@/components/create-team/create-team-context";

type LayoutProps = {
	children: React.ReactNode;
};

export default function ManagerCreateTeam({ children }: LayoutProps) {
	return <CreateTeamProvider>{children}</CreateTeamProvider>;
}
