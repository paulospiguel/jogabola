import { CreateTeamProvider } from "@/context/create-team-context";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function ManagerCreateTeam({ children }: LayoutProps) {
  return <CreateTeamProvider>{children}</CreateTeamProvider>;
}
