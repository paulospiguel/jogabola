import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { UserMenu } from "@/components/arena/user-menu";
import { auth } from "@/lib/auth";
import { SettingsForm } from "./_components/settings-form";

export default async function ArenaSettingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  const t = await getTranslations("settingsPage");

  return (
    <div className="jb-page">
      <div className="jb-page-inner">
        <header className="jb-topbar">
          <div>
            <div className="jb-kicker">{t("header.eyebrow")}</div>
            <h1 className="jb-title">{t("header.title")}</h1>
            <p className="mt-1 max-w-xl text-sm text-arena-text-sec">
              {t("header.description")}
            </p>
          </div>
          <UserMenu onlyAvatar />
        </header>

        <div className="max-w-2xl">
          <SettingsForm
            initialSettings={{
              locale: (session.user as { locale?: string }).locale || "pt",
              notificationsEnabled:
                (session.user as { notificationsEnabled?: boolean })
                  .notificationsEnabled ?? true,
            }}
          />
        </div>
      </div>
    </div>
  );
}
