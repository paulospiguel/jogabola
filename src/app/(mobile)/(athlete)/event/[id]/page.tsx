import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getUserEventAttendanceStatus } from "@/actions/attendance.actions";
import { getEvent } from "@/actions/match-sessions.actions";
import { Logo } from "@/components/logo";
import { getCachedSession } from "@/lib/get-session";
import { AthleteEventDetail } from "./_components/athlete-event-detail";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function AthleteEventPage({ params }: Params) {
  const { id } = await params;
  const t = await getTranslations("athleteEventPublic");
  // id can be slug or numeric id
  const eventIdOrSlug = id;

  try {
    const [session, eventResult] = await Promise.all([
      getCachedSession(),
      getEvent(eventIdOrSlug),
    ]);

    const userId = session?.user?.id ?? "";
    const userName = session?.user?.name ?? "";
    const event = eventResult.success ? eventResult.data : null;

    if (!event) {
      return (
        <div className="flex min-h-screen items-center gap-2 flex-col justify-center bg-arena-bg">
          <Logo size="medium" className="" />
          <p className="text-arena-text-muted text-md">{t("eventNotFound")}</p>
          <Link
            href="/"
            className="flex items-center text-arena-primary hover:text-arena-primary/75"
          >
            <ArrowLeft className="inline-block mr-1" size={16} />
            {t("backToHome")}
          </Link>
        </div>
      );
    }

    const myStatus = userId
      ? await getUserEventAttendanceStatus(event.id, userId)
      : null;

    return (
      <AthleteEventDetail
        event={event}
        userId={userId}
        userName={userName}
        initialMyStatus={myStatus}
      />
    );
  } catch {
    return (
      <div className="flex min-h-screen items-center gap-2 flex-col justify-center bg-arena-bg">
        <Logo size="medium" className="" />
        <p className="text-arena-text-muted text-md">{t("eventNotFound")}</p>
        <Link
          href="/"
          className="flex items-center text-arena-primary hover:text-arena-primary/75"
        >
          <ArrowLeft className="inline-block mr-1" size={16} />
          {t("backToHome")}
        </Link>
      </div>
    );
  }
}
