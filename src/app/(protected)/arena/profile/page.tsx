import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { VerifiedBadge } from "@/components/arena/verified-badge";
import { auth } from "@/lib/auth";
import { ProfileForm } from "./_components/profile-form";

export default async function ArenaProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/auth");
  }

  const t = await getTranslations("profilePage");
  const locale = await getLocale();
  const createdAt = session.user.createdAt
    ? new Date(session.user.createdAt)
    : new Date();
  const memberSince = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(createdAt);

  return (
    <div className="jb-page">
      <div className="jb-page-inner">
        <header className="jb-topbar">
          <div>
            <div className="jb-kicker">{t("header.eyebrow")}</div>
            <div className="flex items-center gap-2">
              <h1 className="jb-title">{t("header.title")}</h1>
              <VerifiedBadge verified={Boolean(session.user.emailVerified)} />
            </div>
            <p className="mt-1 max-w-xl text-sm text-arena-text-sec">
              {t("header.description")}
            </p>
          </div>
          <JbAvatar
            id={session.user.id}
            name={session.user.name || t("fallbacks.user")}
            size={44}
          />
        </header>

        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <ProfileForm
            profile={{
              id: session.user.id,
              name: session.user.name || "",
              email: session.user.email,
              emailVerified: Boolean(session.user.emailVerified),
              image: session.user.image || null,
              createdAt,
            }}
          />

          <aside className="space-y-4">
            <section className="jb-card p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-arena-text-muted">
                {t("cards.account")}
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-arena-text-muted">{t("fields.email")}</dt>
                  <dd className="mt-1 font-semibold text-arena-text">
                    {session.user.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-arena-text-muted">
                    {t("fields.memberSince")}
                  </dt>
                  <dd className="mt-1 font-semibold text-arena-text">
                    {memberSince}
                  </dd>
                </div>
                <div>
                  <dt className="text-arena-text-muted">
                    {t("fields.emailStatus")}
                  </dt>
                  <dd className="mt-1">
                    {session.user.emailVerified ? (
                      <VerifiedBadge verified />
                    ) : (
                      <span className="text-sm font-semibold text-arena-text-muted">
                        {t("status.unverified")}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="jb-card p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-arena-text-muted">
                {t("cards.mvpScope")}
              </div>
              <p className="mt-3 text-sm leading-6 text-arena-text-sec">
                {t("cards.mvpScopeDescription")}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
