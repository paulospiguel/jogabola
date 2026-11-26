"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { createClubWithTeam } from "@/actions/clubs.actions";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { currentFootballSeason } from "@/lib/club-season";
import { useInvalidateClub } from "../_hooks/use-club-calendar";
import { useClubMessages } from "../_hooks/use-club-messages";
import {
  clubErrorCode,
  firstFieldError,
  unwrapClubResult,
} from "../_utils/club-action-error";
import {
  CLUB_INPUT_CLASS,
  ClubField,
  ClubFormAlert,
  fieldAria,
} from "./club-ui";

const NAME_MIN = 2;
const NAME_MAX = 80;

interface CreateClubSheetProps {
  teamId: number;
  teamName: string;
  onClose: () => void;
}

export function CreateClubSheet({
  teamId,
  teamName,
  onClose,
}: CreateClubSheetProps) {
  const t = useTranslations("arenaClubCalendar.createClub");
  const messages = useClubMessages();
  const router = useRouter();
  const invalidate = useInvalidateClub();
  const nameId = useId();
  const [name, setName] = useState(teamName);
  const [localError, setLocalError] = useState<string | undefined>();

  const mutation = useMutation({
    mutationFn: async (clubName: string) =>
      unwrapClubResult(await createClubWithTeam({ name: clubName, teamId })),
    onSuccess: async data => {
      await invalidate();
      router.push(`/arena/club/${data.club.id}`);
      router.refresh();
    },
  });

  const code = clubErrorCode(mutation.error);
  const nameError =
    localError ??
    messages.field(firstFieldError(mutation.error, "name")) ??
    undefined;
  const formError =
    code && code !== "VALIDATION_ERROR" ? messages.error(code) : "";

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX) {
      setLocalError(
        messages.field(
          trimmed.length < NAME_MIN
            ? "VALIDATION_CLUB_CALENDAR_NAME_TOO_SHORT"
            : "VALIDATION_CLUB_CALENDAR_NAME_TOO_LONG",
        ),
      );
      return;
    }
    setLocalError(undefined);
    mutation.mutate(trimmed);
  }

  return (
    <BottomSheet onClose={onClose} title={t("title")}>
      <form
        className="flex flex-col gap-4 overflow-y-auto"
        onSubmit={handleSubmit}
        noValidate
      >
        <p className="text-xs leading-5 text-arena-text-muted">
          {t("description", { team: teamName })}
        </p>
        <p className="rounded-[10px] border border-arena-border bg-arena-surface px-3 py-2 text-xs leading-5 text-arena-text-sec">
          {t("seasonNote", { season: currentFootballSeason().name })}
        </p>
        <ClubField
          id={nameId}
          label={t("nameLabel")}
          error={nameError}
          hint={t("nameHint")}
        >
          <input
            id={nameId}
            className={CLUB_INPUT_CLASS}
            value={name}
            maxLength={NAME_MAX}
            autoComplete="organization"
            // biome-ignore lint/a11y/noAutofocus: first field of a modal sheet the user just opened
            autoFocus
            onChange={event => setName(event.target.value)}
            {...fieldAria(nameId, nameError, t("nameHint"))}
          />
        </ClubField>
        <ClubFormAlert message={formError} />
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
            type="submit"
            size="md"
            className="btn-press flex-1"
            disabled={mutation.isPending}
            aria-busy={mutation.isPending}
          >
            {mutation.isPending ? t("submitting") : t("submit")}
          </Cta>
        </div>
      </form>
    </BottomSheet>
  );
}
