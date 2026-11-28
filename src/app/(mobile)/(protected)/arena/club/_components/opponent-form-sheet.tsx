"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { createOpponent, updateOpponent } from "@/actions/clubs.actions";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { Cta } from "@/components/arena/cta";
import {
  type OpponentDto,
  useInvalidateClub,
} from "../_hooks/use-club-calendar";
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

interface OpponentFormSheetProps {
  clubId: number;
  opponent: OpponentDto | null;
  onSaved?: (opponent: OpponentDto) => void;
  onClose: () => void;
}

export function OpponentFormSheet({
  clubId,
  opponent,
  onSaved,
  onClose,
}: OpponentFormSheetProps) {
  const t = useTranslations("arenaClubCalendar.opponents");
  const messages = useClubMessages();
  const invalidate = useInvalidateClub();
  const nameId = useId();
  const nameRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(opponent?.name ?? "");
  const [nameError, setNameError] = useState<string | undefined>();
  const [formError, setFormError] = useState("");

  const mutation = useMutation({
    mutationFn: async (value: string) =>
      unwrapClubResult(
        opponent
          ? await updateOpponent({ opponentId: opponent.id, name: value })
          : await createOpponent({ clubId, name: value }),
      ),
    onSuccess: async saved => {
      await invalidate(clubId);
      onSaved?.(saved);
      onClose();
    },
    onError: error => {
      if (!(error instanceof ClubActionError)) {
        setFormError(messages.error("UNKNOWN_ERROR"));
      } else if (error.code === "VALIDATION_ERROR") {
        setNameError(messages.field(error.fieldErrors.name?.[0]));
      } else if (FIELD_FOR_DOMAIN_ERROR[error.code] === "name") {
        setNameError(messages.error(error.code));
      } else {
        setFormError(messages.error(error.code));
      }
      document.getElementById(nameId)?.focus();
    },
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 80) {
      setNameError(
        messages.field(
          trimmed.length < 2
            ? "VALIDATION_CLUB_CALENDAR_NAME_TOO_SHORT"
            : "VALIDATION_CLUB_CALENDAR_NAME_TOO_LONG",
        ),
      );
      document.getElementById(nameId)?.focus();
      return;
    }
    setNameError(undefined);
    mutation.mutate(trimmed);
  }

  return (
    <BottomSheet
      onClose={onClose}
      initialFocusRef={nameRef}
      title={opponent ? t("editTitle") : t("createTitle")}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <ClubField
          id={nameId}
          label={t("name")}
          error={nameError}
          hint={t("nameHint")}
        >
          <input
            id={nameId}
            className={CLUB_INPUT_CLASS}
            value={name}
            maxLength={80}
            placeholder={t("namePlaceholder")}
            ref={nameRef}
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
            {mutation.isPending ? t("saving") : t("save")}
          </Cta>
        </div>
      </form>
    </BottomSheet>
  );
}
