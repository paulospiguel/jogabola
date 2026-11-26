import { SearchX } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { listMyClubs } from "@/actions/clubs.actions";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { ClubProvider } from "../_components/club-context";
import { ClubShell } from "../_components/club-shell";

interface ClubLayoutProps {
  children: React.ReactNode;
  params: Promise<{ clubId: string }>;
}

/**
 * Loads the caller's membership of this club on the server. Unknown clubs
 * and clubs the caller does not belong to render the same "not found"
 * state, so a club ID reveals nothing about clubs outside the caller's
 * scope (ADR 0005).
 */
export default async function ClubLayout({
  children,
  params,
}: ClubLayoutProps) {
  const { clubId: rawClubId } = await params;
  const clubId = Number(rawClubId);
  const result =
    Number.isSafeInteger(clubId) && clubId > 0 ? await listMyClubs({}) : null;
  const club = result?.success
    ? result.data.find(item => item.id === clubId)
    : undefined;

  if (!club) {
    const t = await getTranslations("arenaClubCalendar.states");
    return (
      <div className="jb-page">
        <div className="jb-page-inner mx-auto max-w-md pt-10">
          <ArenaEmptyState
            icon={SearchX}
            title={t("clubNotFoundTitle")}
            description={t("clubNotFoundDescription")}
            action={
              <Link
                href="/arena/club"
                className="btn-press inline-flex h-11 items-center md:h-9 rounded-[10px] border border-arena-border bg-arena-surface px-4 text-xs font-bold text-arena-text-sec transition-transform active:scale-[0.97] hover:bg-arena-surface-el"
              >
                {t("backToClub")}
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <ClubProvider club={club}>
      <ClubShell>{children}</ClubShell>
    </ClubProvider>
  );
}
