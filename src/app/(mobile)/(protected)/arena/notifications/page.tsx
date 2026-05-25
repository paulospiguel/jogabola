import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getNotifications } from "@/actions/notifications.actions";
import { auth } from "@/lib/auth";
import { NotificationsList } from "./_components/notifications-list";

export default async function ArenaNotificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  const notificationsResult = await getNotifications();
  const notifications = notificationsResult.success ? notificationsResult.data : [];

  return (
    <NotificationsList
      initialNotifications={
        (notifications as {
          id: string;
          type: string;
          title: string;
          message: string;
          read: boolean;
          createdAt: Date;
        }[]) || []
      }
    />
  );
}
