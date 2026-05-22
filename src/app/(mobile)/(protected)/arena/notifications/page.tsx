import { Bell } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getNotifications } from "@/actions/notifications.actions";
import { JbUserMenu } from "@/components/arena/jb-user-menu";
import { auth } from "@/lib/auth";
import { NotificationsList } from "./_components/notifications-list";

export default async function ArenaNotificationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  const t = await getTranslations("notificationsPage");
  const notificationsResult = await getNotifications();
  const notifications = notificationsResult.success
    ? notificationsResult.data
    : [];

  return (
    <div className="jb-page">
      <div className="jb-page-inner">
        <header className="jb-topbar">
          <div>
            <div className="jb-kicker">{t("header.eyebrow")}</div>
            <div className="flex items-center gap-2 mt-1">
              <Bell className="size-6 text-arena-primary shrink-0" />
              <h1 className="jb-title flex items-center gap-3">
                {t("header.title")}
                {notifications &&
                  notifications.filter(n => !n.read).length > 0 && (
                    <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-arena-primary px-1.5 text-[11px] font-black text-arena-bg">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
              </h1>
            </div>
            <p className="mt-1.5 max-w-xl text-sm text-arena-text-sec">
              {t("header.description")}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-arena-surface border border-arena-border flex items-center justify-center text-arena-text-sec">
              <Bell size={20} />
            </div>
            <JbUserMenu onlyAvatar />
          </div>
        </header>

        <div className="max-w-3xl">
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
        </div>
      </div>
    </div>
  );
}
