import { AppHeader as Header } from "@/components/horizontal-header";
import { getUser as getUserAction } from "@/actions";
import routes from "@/constants/routes";
import { redirect } from "next/navigation";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function LayoutInitalSetup({ children }: LayoutProps) {
  const { user: userInfo, canCreateTeam } = (await getUserAction()) || {};

  if (!userInfo) {
    return redirect(routes.auth.login);
  }

  return (
    <div className="flex h-full w-full flex-col items-center bg-primary dark:bg-primary-dark">
      <Header />
      <div className="w-full max-w-5xl px-4 pt-4">{children}</div>
    </div>
  );
}
