"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormatter, useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";
import { createFixture } from "@/actions/fixtures.actions";
import { Cta } from "@/components/arena/cta";
import { useTeams } from "@/hooks/use-teams";
import { cn } from "@/lib/utils";
import {
  clubCalendarKeys,
  type FixtureDto,
  type OpponentDto,
  type SeasonDto,
  useInvalidateClub,
  useTeamCallups,
} from "../_hooks/use-club-calendar";
import { useClubMessages } from "../_hooks/use-club-messages";
import {
  ClubActionError,
  FIELD_FOR_DOMAIN_ERROR,
  unwrapClubResult,
} from "../_utils/club-action-error";
import {
  CLUB_CALENDAR_TIME_ZONE,
  parseWallTime,
  type WallTimeProblem,
} from "../_utils/club-calendar-time";
import { competitionSuggestions } from "../_utils/club-calendar-view";
import { useClub } from "./club-context";
import {
  CLUB_INPUT_CLASS,
  CLUB_LINK_BUTTON_CLASS,
  ClubField,
  ClubFormAlert,
  fieldAria,
} from "./club-ui";
import { OpponentFormSheet } from "./opponent-form-sheet";

type FieldName =
  | "teamId"
  | "seasonId"
  | "opponentId"
  | "competitionName"
  | "startsAt"
  | "time"
  | "matchSessionId";
type FieldErrors = Partial<Record<FieldName, string>>;

const FIELD_ORDER: FieldName[] = [
  "teamId",
  "seasonId",
  "opponentId",
  "competitionName",
  "startsAt",
  "time",
  "matchSessionId",
];

/** Which field a wall-time problem belongs to, and its validation code. */
const WALL_TIME_ERRORS: Record<
  WallTimeProblem,
  { field: "startsAt" | "time"; code: string }
> = {
  dateMissing: { field: "startsAt", code: "VALIDATION_FIXTURE_DATE_REQUIRED" },
  dateInvalid: { field: "startsAt", code: "VALIDATION_DATE_INVALID" },
  timeMissing: { field: "time", code: "VALIDATION_FIXTURE_TIME_REQUIRED" },
  timeInvalid: { field: "time", code: "VALIDATION_FIXTURE_TIME_INVALID" },
  nonexistent: { field: "time", code: "VALIDATION_FIXTURE_TIME_NONEXISTENT" },
};

interface FixtureFormProps {
  seasons: SeasonDto[];
  opponents: OpponentDto[];
  fixtures: FixtureDto[];
  /** Presentation only: club admins may add an opponent inline. */
  canCreateOpponent: boolean;
}

export function FixtureForm({
  seasons,
  opponents,
  fixtures,
  canCreateOpponent,
}: FixtureFormProps) {
  const t = useTranslations("arenaClubCalendar.create");
  const messages = useClubMessages();
  const format = useFormatter();
  const router = useRouter();
  const queryClient = useQueryClient();
  const invalidate = useInvalidateClub();
  const { club } = useClub();
  const { activeTeamId } = useTeams();
  const baseId = useId();
  const ids = Object.fromEntries(
    FIELD_ORDER.map(name => [name, `${baseId}-${name}`]),
  ) as Record<FieldName, string>;
  const opponentSelectRef = useRef<HTMLSelectElement | null>(null);
  const [creatingOpponent, setCreatingOpponent] = useState(false);

  const defaultTeam =
    club.ownedTeams.find(team => team.id === activeTeamId) ??
    club.ownedTeams[0];
  const [teamId, setTeamId] = useState(String(defaultTeam?.id ?? ""));
  const [seasonId, setSeasonId] = useState(String(seasons[0]?.id ?? ""));
  const [opponentId, setOpponentId] = useState("");
  const [competitionName, setCompetitionName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [matchSessionId, setMatchSessionId] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");

  const callupsQuery = useTeamCallups(teamId ? Number(teamId) : null);
  const linkedIds = new Set(
    fixtures
      .map(f => f.linkedMatchSessionId)
      .filter((id): id is number => id !== null),
  );
  const callups = (callupsQuery.data ?? []).filter(c => !linkedIds.has(c.id));
  const suggestions = competitionSuggestions(fixtures);

  function focusFirstError(next: FieldErrors) {
    const first = FIELD_ORDER.find(name => next[name]);
    if (first) {
      requestAnimationFrame(() => document.getElementById(ids[first])?.focus());
    }
  }

  function showErrors(next: FieldErrors, alert = "") {
    setErrors(next);
    setFormError(alert);
    focusFirstError(next);
  }

  const mutation = useMutation({
    mutationFn: async (input: Record<string, unknown>) =>
      unwrapClubResult(await createFixture(input)),
    onSuccess: async fixture => {
      queryClient.setQueryData(clubCalendarKeys.fixture(fixture.id), fixture);
      await invalidate(club.id);
      router.push(`/arena/club/${club.id}/fixtures/${fixture.id}`);
    },
    onError: error => {
      if (!(error instanceof ClubActionError)) {
        showErrors({}, messages.error("UNKNOWN_ERROR"));
        return;
      }
      if (error.code === "VALIDATION_ERROR") {
        const next: FieldErrors = {};
        for (const name of FIELD_ORDER) {
          const code = error.fieldErrors[name]?.[0];
          if (code) next[name] = messages.field(code);
        }
        showErrors(next, messages.error("VALIDATION_ERROR"));
        return;
      }
      const field = FIELD_FOR_DOMAIN_ERROR[error.code] as FieldName | undefined;
      if (field && FIELD_ORDER.includes(field)) {
        showErrors({ [field]: messages.error(error.code) });
        return;
      }
      showErrors({}, messages.error(error.code));
    },
  });

  function validate(): {
    input: Record<string, unknown> | null;
    errors: FieldErrors;
  } {
    const next: FieldErrors = {};
    if (!teamId) next.teamId = messages.field("VALIDATION_TEAM_REQUIRED");
    if (!seasonId) next.seasonId = messages.field("VALIDATION_SEASON_REQUIRED");
    if (!opponentId)
      next.opponentId = messages.field("VALIDATION_OPPONENT_REQUIRED");
    const competition = competitionName.trim();
    if (competition.length < 2)
      next.competitionName = messages.field(
        "VALIDATION_CLUB_CALENDAR_NAME_TOO_SHORT",
      );
    else if (competition.length > 80)
      next.competitionName = messages.field(
        "VALIDATION_CLUB_CALENDAR_NAME_TOO_LONG",
      );
    const wallTime = parseWallTime(date, time, CLUB_CALENDAR_TIME_ZONE);
    const startsAt = "instant" in wallTime ? wallTime.instant : null;
    if ("problem" in wallTime) {
      const { field, code } = WALL_TIME_ERRORS[wallTime.problem];
      next[field] = messages.field(code);
    }

    if (Object.keys(next).length > 0 || !startsAt) {
      return { input: null, errors: next };
    }
    return {
      errors: next,
      input: {
        teamId: Number(teamId),
        seasonId: Number(seasonId),
        opponentId: Number(opponentId),
        competitionName: competition,
        startsAt: startsAt.toISOString(),
        ...(matchSessionId ? { matchSessionId: Number(matchSessionId) } : {}),
      },
    };
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = validate();
    if (!result.input) {
      showErrors(result.errors, messages.error("VALIDATION_ERROR"));
      return;
    }
    setErrors({});
    setFormError("");
    mutation.mutate(result.input);
  }

  function clearError(name: FieldName) {
    if (errors[name]) setErrors(current => ({ ...current, [name]: undefined }));
  }

  const callupHint = callupsQuery.isLoading
    ? t("callupLoading")
    : callupsQuery.error
      ? t("callupError")
      : callups.length === 0
        ? t("callupEmpty")
        : t("callupHint");

  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="jb-card flex flex-col gap-4 p-4 md:p-5"
        aria-describedby={`${baseId}-tz`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ClubField id={ids.teamId} label={t("team")} error={errors.teamId}>
            <select
              id={ids.teamId}
              className={CLUB_INPUT_CLASS}
              value={teamId}
              onChange={event => {
                setTeamId(event.target.value);
                setMatchSessionId("");
                clearError("teamId");
              }}
              {...fieldAria(ids.teamId, errors.teamId)}
            >
              {club.ownedTeams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </ClubField>

          <ClubField
            id={ids.seasonId}
            label={t("season")}
            error={errors.seasonId}
          >
            <select
              id={ids.seasonId}
              className={CLUB_INPUT_CLASS}
              value={seasonId}
              onChange={event => {
                setSeasonId(event.target.value);
                clearError("seasonId");
              }}
              {...fieldAria(ids.seasonId, errors.seasonId)}
            >
              {seasons.map(season => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </select>
          </ClubField>

          <ClubField
            id={ids.opponentId}
            label={t("opponent")}
            error={errors.opponentId}
            hint={
              canCreateOpponent && opponents.length === 0
                ? t("opponentEmptyHint")
                : undefined
            }
          >
            <div className="flex min-w-0 gap-2">
              <select
                ref={opponentSelectRef}
                id={ids.opponentId}
                className={cn(CLUB_INPUT_CLASS, "min-w-0 flex-1")}
                value={opponentId}
                onChange={event => {
                  setOpponentId(event.target.value);
                  clearError("opponentId");
                }}
                {...fieldAria(
                  ids.opponentId,
                  errors.opponentId,
                  canCreateOpponent && opponents.length === 0
                    ? t("opponentEmptyHint")
                    : undefined,
                )}
              >
                <option value="">
                  {opponents.length === 0
                    ? t("opponentEmpty")
                    : t("opponentPlaceholder")}
                </option>
                {opponents.map(opponent => (
                  <option key={opponent.id} value={opponent.id}>
                    {opponent.name}
                  </option>
                ))}
              </select>
              {canCreateOpponent && (
                <button
                  type="button"
                  onClick={() => setCreatingOpponent(true)}
                  className={cn(
                    CLUB_LINK_BUTTON_CLASS,
                    "h-11 shrink-0 rounded-[10px] border border-arena-primary/30 bg-arena-primary/5 px-3 text-xs text-arena-primary hover:border-arena-primary/50 md:h-10",
                  )}
                >
                  <Plus size={14} strokeWidth={2.4} aria-hidden="true" />
                  {t("newOpponent")}
                </button>
              )}
            </div>
          </ClubField>

          <ClubField
            id={ids.competitionName}
            label={t("competition")}
            error={errors.competitionName}
            hint={t("competitionHint")}
          >
            <input
              id={ids.competitionName}
              className={CLUB_INPUT_CLASS}
              value={competitionName}
              maxLength={80}
              list={`${baseId}-competitions`}
              placeholder={t("competitionPlaceholder")}
              onChange={event => {
                setCompetitionName(event.target.value);
                clearError("competitionName");
              }}
              {...fieldAria(
                ids.competitionName,
                errors.competitionName,
                t("competitionHint"),
              )}
            />
            <datalist id={`${baseId}-competitions`}>
              {suggestions.map(name => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </ClubField>

          <ClubField
            id={ids.startsAt}
            label={t("date")}
            error={errors.startsAt}
          >
            <input
              id={ids.startsAt}
              type="date"
              className={CLUB_INPUT_CLASS}
              value={date}
              onChange={event => {
                setDate(event.target.value);
                clearError("startsAt");
              }}
              {...fieldAria(ids.startsAt, errors.startsAt)}
            />
          </ClubField>

          <ClubField id={ids.time} label={t("time")} error={errors.time}>
            <input
              id={ids.time}
              type="time"
              step={300}
              className={CLUB_INPUT_CLASS}
              value={time}
              aria-invalid={errors.time ? true : undefined}
              aria-describedby={
                errors.time ? `${ids.time}-error` : `${baseId}-tz`
              }
              onChange={event => {
                setTime(event.target.value);
                clearError("time");
              }}
            />
          </ClubField>
        </div>

        <ClubField
          id={ids.matchSessionId}
          label={t("callup")}
          optional
          error={errors.matchSessionId}
          hint={callupHint}
        >
          <select
            id={ids.matchSessionId}
            className={CLUB_INPUT_CLASS}
            value={matchSessionId}
            disabled={callupsQuery.isLoading}
            onChange={event => {
              setMatchSessionId(event.target.value);
              clearError("matchSessionId");
            }}
            {...fieldAria(
              ids.matchSessionId,
              errors.matchSessionId,
              callupHint,
            )}
          >
            <option value="">{t("callupNone")}</option>
            {callups.map(callup => (
              <option key={callup.id} value={callup.id}>
                {t("callupOption", {
                  title: callup.title,
                  date: format.dateTime(new Date(callup.startDate), {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                })}
              </option>
            ))}
          </select>
        </ClubField>

        <p id={`${baseId}-tz`} className="text-[11px] text-arena-text-muted">
          {t("timeZoneNote", { zone: CLUB_CALENDAR_TIME_ZONE })}
        </p>

        <ClubFormAlert message={formError} />

        <div className="flex flex-col-reverse gap-2 border-arena-border border-t pt-4 sm:flex-row sm:justify-end">
          <Cta
            variant="secondary"
            size="md"
            className="btn-press"
            onClick={() => router.push(`/arena/club/${club.id}`)}
          >
            {t("cancel")}
          </Cta>
          <Cta
            type="submit"
            size="md"
            className="btn-press"
            disabled={mutation.isPending}
            aria-busy={mutation.isPending}
          >
            {mutation.isPending ? t("submitting") : t("submit")}
          </Cta>
        </div>
      </form>
      {creatingOpponent && (
        <OpponentFormSheet
          clubId={club.id}
          opponent={null}
          onSaved={created => {
            setOpponentId(String(created.id));
            clearError("opponentId");
            // Focus returns to the trigger on close; then move it to the
            // select that now shows the new opponent.
            requestAnimationFrame(() => opponentSelectRef.current?.focus());
          }}
          onClose={() => setCreatingOpponent(false)}
        />
      )}
    </>
  );
}
