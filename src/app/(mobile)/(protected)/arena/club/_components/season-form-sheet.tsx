"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { createSeason, updateSeason } from "@/actions/clubs.actions";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import { type SeasonDto, useInvalidateClub } from "../_hooks/use-club-calendar";
import { useClubMessages } from "../_hooks/use-club-messages";
import {
  ClubActionError,
  FIELD_FOR_DOMAIN_ERROR,
  unwrapClubResult,
} from "../_utils/club-action-error";
import {
  CLUB_INPUT_CLASS,
  ClubField,
  ClubFormAlert,
  fieldAria,
} from "./club-ui";

type SeasonField = "name" | "startsOn" | "endsOn";

interface SeasonFormSheetProps {
  clubId: number;
  season: SeasonDto | null;
  /** Prefill for a new season (e.g. the current football season). */
  defaults?: { name: string; startsOn: string; endsOn: string };
  onSaved?: (season: SeasonDto) => void;
  onClose: () => void;
}

export function SeasonFormSheet({
  clubId,
  season,
  defaults,
  onSaved,
  onClose,
}: SeasonFormSheetProps) {
  const t = useTranslations("arenaClubCalendar.seasons");
  const messages = useClubMessages();
  const invalidate = useInvalidateClub();
  const baseId = useId();
  const ids: Record<SeasonField, string> = {
    name: `${baseId}-name`,
    startsOn: `${baseId}-starts`,
    endsOn: `${baseId}-ends`,
  };
  const [name, setName] = useState(season?.name ?? defaults?.name ?? "");
  const [startsOn, setStartsOn] = useState(
    season?.startsOn ?? defaults?.startsOn ?? "",
  );
  const [endsOn, setEndsOn] = useState(
    season?.endsOn ?? defaults?.endsOn ?? "",
  );
  const [errors, setErrors] = useState<Partial<Record<SeasonField, string>>>(
    {},
  );
  const [formError, setFormError] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const fields = {
        name: name.trim(),
        startsOn: startsOn || null,
        endsOn: endsOn || null,
      };
      return unwrapClubResult(
        season
          ? await updateSeason({ seasonId: season.id, ...fields })
          : await createSeason({ clubId, ...fields }),
      );
    },
    onSuccess: async saved => {
      await invalidate(clubId);
      onSaved?.(saved);
      onClose();
    },
    onError: error => {
      if (!(error instanceof ClubActionError)) {
        setFormError(messages.error("UNKNOWN_ERROR"));
        return;
      }
      if (error.code === "VALIDATION_ERROR") {
        setErrors({
          name: messages.field(error.fieldErrors.name?.[0]),
          startsOn: messages.field(error.fieldErrors.startsOn?.[0]),
          endsOn: messages.field(error.fieldErrors.endsOn?.[0]),
        });
        return;
      }
      if (FIELD_FOR_DOMAIN_ERROR[error.code] === "name") {
        setErrors({ name: messages.error(error.code) });
        return;
      }
      setFormError(messages.error(error.code));
    },
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    const trimmed = name.trim();
    const next: Partial<Record<SeasonField, string>> = {};
    if (trimmed.length < 2)
      next.name = messages.field("VALIDATION_CLUB_CALENDAR_NAME_TOO_SHORT");
    else if (trimmed.length > 80)
      next.name = messages.field("VALIDATION_CLUB_CALENDAR_NAME_TOO_LONG");
    if (startsOn && endsOn && endsOn < startsOn)
      next.endsOn = messages.field("VALIDATION_SEASON_RANGE_INVALID");
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = (["name", "startsOn", "endsOn"] as const).find(
        f => next[f],
      );
      if (first) document.getElementById(ids[first])?.focus();
      return;
    }
    mutation.mutate();
  }

  return (
    <BottomSheet
      onClose={onClose}
      title={season ? t("editTitle") : t("createTitle")}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex flex-col gap-4 overflow-y-auto"
      >
        <ClubField
          id={ids.name}
          label={t("name")}
          error={errors.name}
          hint={t("nameHint")}
        >
          <input
            id={ids.name}
            className={CLUB_INPUT_CLASS}
            value={name}
            maxLength={80}
            placeholder={t("namePlaceholder")}
            // biome-ignore lint/a11y/noAutofocus: first field of a modal sheet the user just opened
            autoFocus
            onChange={event => setName(event.target.value)}
            {...fieldAria(ids.name, errors.name, t("nameHint"))}
          />
        </ClubField>
        <div className="grid grid-cols-2 gap-3">
          <ClubField
            id={ids.startsOn}
            label={t("startsOn")}
            optional
            error={errors.startsOn}
          >
            <input
              id={ids.startsOn}
              type="date"
              className={CLUB_INPUT_CLASS}
              value={startsOn}
              onChange={event => setStartsOn(event.target.value)}
              {...fieldAria(ids.startsOn, errors.startsOn)}
            />
          </ClubField>
          <ClubField
            id={ids.endsOn}
            label={t("endsOn")}
            optional
            error={errors.endsOn}
          >
            <input
              id={ids.endsOn}
              type="date"
              className={CLUB_INPUT_CLASS}
              value={endsOn}
              min={startsOn || undefined}
              onChange={event => setEndsOn(event.target.value)}
              {...fieldAria(ids.endsOn, errors.endsOn)}
            />
          </ClubField>
        </div>
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
            {mutation.isPending ? t("saving") : t("save")}
          </Cta>
        </div>
      </form>
    </BottomSheet>
  );
}
