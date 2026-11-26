"use client";

import { Flag, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Cta } from "@/components/arena/cta";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { useTeams } from "@/hooks/use-teams";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useMyClubs } from "../_hooks/use-club-calendar";
import { clubErrorCode } from "../_utils/club-action-error";
import { decideClubEntry } from "../_utils/club-entry";
import {
  CLUB_LINK_BUTTON_CLASS,
  ClubQueryProblem,
  ClubSkeletonRows,
} from "./club-ui";
import { CreateClubSheet } from "./create-club-sheet";

/**
 * "Clube" entry point. Opens the club of the active team, offers the team
 * owner to create one, or explains why there is no club to show.
 */
export function ClubEntry() {
  const t = useTranslations("arenaClubCalendar.entry");
  const router = useRouter();
  const { data: sessionData, isPending: isSessionPending } = useSession();
  const {
    activeTeam,
    activeTeamId,
    myTeams,
    isLoading: teamsLoading,
  } = useTeams();
  const clubsQuery = useMyClubs();
  const [creating, setCreating] = useState(false);

  const waitingForTeam =
    teamsLoading || (myTeams.length > 0 && activeTeamId === null);
  const isLoading = clubsQuery.isLoading || waitingForTeam || isSessionPending;

  const decision =
    isLoading || !clubsQuery.data
      ? null
      : decideClubEntry({
          clubs: clubsQuery.data,
          activeTeam: activeTeam
            ? {
                id: activeTeam.id,
                name: activeTeam.name,
                ownerId: activeTeam.ownerId,
              }
            : null,
          userId: sessionData?.user?.id ?? null,
        });

  const targetClubId = decision?.kind === "club" ? decision.clubId : null;
  useEffect(() => {
    if (targetClubId) router.replace(`/arena/club/${targetClubId}`);
  }, [targetClubId, router]);

  let body: React.ReactNode;
  if (clubsQuery.error) {
    body = (
      <ClubQueryProblem
        code={clubErrorCode(clubsQuery.error)}
        onRetry={() => void clubsQuery.refetch()}
        isRetrying={clubsQuery.isFetching}
      />
    );
  } else if (!decision || decision.kind === "club") {
    body = <ClubSkeletonRows rows={3} />;
  } else if (decision.kind === "create") {
    body = (
      <ArenaEmptyState
        icon={Flag}
        title={t("createTitle")}
        description={t("createDescription", { team: decision.teamName })}
        className="py-10"
        action={
          <Cta
            size="md"
            className="btn-press"
            onClick={() => setCreating(true)}
          >
            {t("createCta")}
          </Cta>
        }
      />
    );
  } else {
    body = (
      <ArenaEmptyState
        icon={Users}
        title={t(
          decision.reason === "noTeam" ? "noTeamTitle" : "notOwnerTitle",
        )}
        description={t(
          decision.reason === "noTeam"
            ? "noTeamDescription"
            : "notOwnerDescription",
        )}
        className="py-10"
        action={
          <Link
            href="/arena"
            className={cn(
              CLUB_LINK_BUTTON_CLASS,
              "h-9 rounded-[10px] border border-arena-border bg-arena-surface px-4 text-xs text-arena-text-sec hover:bg-arena-surface-el",
            )}
          >
            {t("backToDashboard")}
          </Link>
        }
      />
    );
  }

  return (
    <div className="jb-page">
      <div className="jb-page-inner mx-auto max-w-xl">
        <header className="jb-topbar">
          <div>
            <div className="jb-kicker">{t("kicker")}</div>
            <h1 className="jb-title">{t("title")}</h1>
          </div>
        </header>
        <div aria-live="polite">{body}</div>
      </div>
      {creating && decision?.kind === "create" && (
        <CreateClubSheet
          teamId={decision.teamId}
          teamName={decision.teamName}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}
