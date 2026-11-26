"use client";

import { useMutation } from "@tanstack/react-query";
import { ChevronRight, Flag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { attachTeamToClub } from "@/actions/clubs.actions";
import { Cta } from "@/components/arena/cta";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { cn } from "@/lib/utils";
import { useInvalidateClub } from "../_hooks/use-club-calendar";
import { useClubMessages } from "../_hooks/use-club-messages";
import { clubErrorCode, unwrapClubResult } from "../_utils/club-action-error";
import type { ClubLink } from "../_utils/club-entry";
import { CLUB_LINK_BUTTON_CLASS, ClubFormAlert } from "./club-ui";

/** Links to the clubs the caller already belongs to. */
export function MyClubLinks({ clubs }: { clubs: ClubLink[] }) {
  const t = useTranslations("arenaClubCalendar.entry");
  if (clubs.length === 0) return null;
  return (
    <nav aria-label={t("myClubsLabel")} className="w-full max-w-xs">
      <h2 className="jb-section-label pt-0 text-center">{t("myClubsLabel")}</h2>
      <ul className="flex flex-col gap-1.5">
        {clubs.map(club => (
          <li key={club.id}>
            <Link
              href={`/arena/club/${club.id}`}
              className={cn(
                CLUB_LINK_BUTTON_CLASS,
                "h-11 w-full justify-between rounded-[10px] border border-arena-border bg-arena-surface px-3.5 text-xs text-arena-text-sec hover:bg-arena-surface-el md:h-9",
              )}
            >
              <span className="truncate">
                {t("openClub", { club: club.name })}
              </span>
              <ChevronRight size={14} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

interface JoinClubOptionsProps {
  teamId: number;
  teamName: string;
  joinableClubs: ClubLink[];
  myClubs: ClubLink[];
  onCreate: () => void;
}

/**
 * A free team whose owner already administers a club: joining that club is
 * the shortest path, creating a new club stays available.
 */
export function JoinClubOptions({
  teamId,
  teamName,
  joinableClubs,
  myClubs,
  onCreate,
}: JoinClubOptionsProps) {
  const t = useTranslations("arenaClubCalendar.entry");
  const messages = useClubMessages();
  const router = useRouter();
  const invalidate = useInvalidateClub();

  const join = useMutation({
    mutationFn: async (clubId: number) =>
      unwrapClubResult(await attachTeamToClub({ clubId, teamId })),
    onSuccess: async data => {
      await invalidate();
      router.push(`/arena/club/${data.clubId}`);
      router.refresh();
    },
  });

  return (
    <ArenaEmptyState
      icon={Flag}
      title={t("joinTitle", { team: teamName })}
      description={t("joinDescription")}
      className="py-10"
      action={
        <div className="flex w-full max-w-xs flex-col items-stretch gap-4">
          <ul aria-label={t("joinLegend")} className="flex flex-col gap-2">
            {joinableClubs.map(club => {
              const pending = join.isPending && join.variables === club.id;
              return (
                <li key={club.id}>
                  <Cta
                    size="md"
                    className="btn-press w-full"
                    disabled={join.isPending}
                    aria-busy={pending}
                    onClick={() => join.mutate(club.id)}
                  >
                    <span className="truncate">
                      {pending
                        ? t("joining")
                        : t("joinCta", { club: club.name })}
                    </span>
                  </Cta>
                </li>
              );
            })}
          </ul>
          <ClubFormAlert
            message={
              join.error ? messages.error(clubErrorCode(join.error)) : ""
            }
          />
          <Cta
            variant="secondary"
            size="md"
            className="btn-press w-full"
            disabled={join.isPending}
            onClick={onCreate}
          >
            {t("createNewCta")}
          </Cta>
          <MyClubLinks clubs={myClubs} />
        </div>
      }
    />
  );
}
