import PushNotifications from "@/components/push-notifications";
import VerticalHeader from "@/components/vertical-header";

type LayoutProps = {
  children: React.ReactNode;
};

export default async function LayoutManageTeam({ children }: LayoutProps) {
  return (
    <div className="flex h-full w-full items-center">
      <VerticalHeader />
      <div className="h-full w-full overflow-auto px-4">{children}</div>
      <PushNotifications notifications={[]} />
    </div>
  );
}
