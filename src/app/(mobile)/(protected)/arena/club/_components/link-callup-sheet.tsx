"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarX2, Check } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { linkMatchSession } from "@/actions/fixtures.actions";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { cn } from "@/lib/utils";
import {
  clubCalendarKeys,
  type FixtureDto,
  useClubFixtures,
  useInvalidateClub,
  useTeamCallups,
} from "../_hooks/use-club-calendar";
import { useClubMessages } from "../_hooks/use-club-messages";
import { clubErrorCode, unwrapClubResult } from "../_utils/club-action-error";
import { ClubFormAlert, ClubQueryProblem, ClubSkeletonRows } from "./club-ui";

interface LinkCallupSheetProps {
  fixture: FixtureDto;
  /** Called on a successful link, before the fixture cache is updated. */
  onLinked?: () => void;
  onClose: () => void;
}

/** Picks a callup of the fixture's team and links it (owner only, server-checked). */
export function LinkCallupSheet({
  fixture,
  onLinked,
  onClose,
}: LinkCallupSheetProps) {
  const t = useTranslations("arenaClubCalendar.link");
  const messages = useClubMessages();
  const format = useFormatter();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateClub();
  const callupsQuery = useTeamCallups(fixture.team.id);
  const fixturesQuery = useClubFixtures(fixture.clubId);
  const [selected, setSelected] = useState<number | null>(null);

  const linkedElsewhere = new Set(
    (fixturesQuery.data ?? [])
      .filter(f => f.id !== fixture.id)
      .map(f => f.linkedMatchSessionId)
      .filter((id): id is number => id !== null),
  );
  const callups = (callupsQuery.data ?? []).filter(
    c => !linkedElsewhere.has(c.id),
  );

  const mutation = useMutation({
    mutationFn: async (matchSessionId: number) =>
      unwrapClubResult(
        await linkMatchSession({ fixtureId: fixture.id, matchSessionId }),
      ),
    onSuccess: async updated => {
      onLinked?.();
      queryClient.setQueryData(clubCalendarKeys.fixture(updated.id), updated);
      await invalidate(updated.clubId);
      onClose();
    },
  });

  let body: React.ReactNode;
  if (callupsQuery.isLoading) {
    body = <ClubSkeletonRows rows={3} />;
  } else if (callupsQuery.error) {
    body = (
      <ClubQueryProblem
        code={clubErrorCode(callupsQuery.error)}
        onRetry={() => void callupsQuery.refetch()}
        isRetrying={callupsQuery.isFetching}
      />
    );
  } else if (callups.length === 0) {
    body = (
      <ArenaEmptyState
        icon={CalendarX2}
        title={t("emptyTitle")}
        description={t("emptyDescription", { team: fixture.team.name })}
      />
    );
  } else {
    body = (
      <fieldset className="flex flex-col gap-2">
        <legend className="sr-only">{t("legend")}</legend>
        {callups.map(callup => {
          const active = selected === callup.id;
          return (
            <label
              key={callup.id}
              className={cn(
                "btn-press flex min-h-14 cursor-pointer items-center gap-3 rounded-[12px] border px-3 py-2.5 transition-[transform,border-color,background-color] duration-150 active:scale-[0.98] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-arena-primary",
                active
                  ? "border-arena-primary/50 bg-arena-primary/10"
                  : "border-arena-border bg-arena-surface hover:bg-arena-surface-el",
              )}
            >
              <input
                type="radio"
                name="callup"
                value={callup.id}
                checked={active}
                onChange={() => setSelected(callup.id)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border",
                  active
                    ? "border-arena-primary bg-arena-primary text-arena-bg"
                    : "border-arena-border",
                )}
              >
                {active && <Check size={12} strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-arena-text">
                  {callup.title}
                </span>
                <span className="block truncate text-[11px] text-arena-text-muted">
                  {format.dateTime(new Date(callup.startDate), {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" · "}
                  {callup.location}
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>
    );
  }

  return (
    <BottomSheet onClose={onClose} title={t("title")}>
      <div className="flex min-h-0 flex-col gap-3">
        <p className="text-xs leading-5 text-arena-text-muted">
          {t("description", { team: fixture.team.name })}
        </p>
        <div className="min-h-0 overflow-y-auto">{body}</div>
        <ClubFormAlert
          message={
            mutation.error ? messages.error(clubErrorCode(mutation.error)) : ""
          }
        />
        <div className="flex gap-2 pt-1">
          <Cta
            variant="secondary"
            size="md"
            className="btn-press flex-1"
            onClick={onClose}
          >
            {t("cancel")}
          </Cta>
          <Cta
            size="md"
            className="btn-press flex-1"
            disabled={selected === null || mutation.isPending}
            aria-busy={mutation.isPending}
            onClick={() => selected !== null && mutation.mutate(selected)}
          >
            {mutation.isPending ? t("submitting") : t("submit")}
          </Cta>
        </div>
      </div>
    </BottomSheet>
  );
}
