"use client";

import { CalendarRange, Lock, Swords } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { deleteOpponent, deleteSeason } from "@/actions/clubs.actions";
import { SegmentedControl } from "@/components/arena/segmented-control";
import { cn } from "@/lib/utils";
import {
  type SeasonDto,
  useClubOpponents,
  useClubSeasons,
} from "../_hooks/use-club-calendar";
import { dateKeyToNoonUtc } from "../_utils/club-calendar-time";
import { CatalogPanel } from "./catalog-panel";
import { useClub } from "./club-context";
import { OpponentFormSheet } from "./opponent-form-sheet";
import { SeasonFormSheet } from "./season-form-sheet";

type Tab = "seasons" | "opponents";
type Editing =
  | { kind: "season"; id: number | null }
  | { kind: "opponent"; id: number | null }
  | null;

/** Seasons and opponents: read for every member, managed by club admins. */
export function ClubSettings() {
  const t = useTranslations("arenaClubCalendar.settings");
  const tSeasons = useTranslations("arenaClubCalendar.seasons");
  const format = useFormatter();
  const { club, isAdmin } = useClub();
  const seasonsQuery = useClubSeasons(club.id);
  const opponentsQuery = useClubOpponents(club.id);
  const [tab, setTab] = useState<Tab>("seasons");
  const [editing, setEditing] = useState<Editing>(null);

  const formatDay = (value: string) =>
    format.dateTime(dateKeyToNoonUtc(value), {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  const seasonSub = (season: SeasonDto) => {
    if (season.startsOn && season.endsOn)
      return tSeasons("range", {
        start: formatDay(season.startsOn),
        end: formatDay(season.endsOn),
      });
    if (season.startsOn)
      return tSeasons("from", { start: formatDay(season.startsOn) });
    if (season.endsOn)
      return tSeasons("until", { end: formatDay(season.endsOn) });
    return tSeasons("noDates");
  };

  const editingSeason =
    editing?.kind === "season" && editing.id !== null
      ? (seasonsQuery.data?.find(s => s.id === editing.id) ?? null)
      : null;
  const editingOpponent =
    editing?.kind === "opponent" && editing.id !== null
      ? (opponentsQuery.data?.find(o => o.id === editing.id) ?? null)
      : null;

  return (
    <div className="flex flex-col gap-4">
      {!isAdmin && (
        <p
          role="note"
          className="flex items-start gap-2 rounded-[12px] border border-arena-border bg-arena-surface px-3 py-2.5 text-xs text-arena-text-sec"
        >
          <Lock size={14} className="mt-px shrink-0" aria-hidden="true" />
          {t("readOnlyNotice")}
        </p>
      )}

      <SegmentedControl
        buttonClassName="h-11 md:h-9"
        ariaLabel={t("tabsLabel")}
        value={tab}
        onChange={setTab}
        options={[
          { id: "seasons", label: t("seasonsTab"), icon: CalendarRange },
          { id: "opponents", label: t("opponentsTab"), icon: Swords },
        ]}
        className="self-start md:hidden"
      />

      <div className="grid gap-5 md:grid-cols-2 md:items-start">
        <CatalogPanel
          kind="seasons"
          clubId={club.id}
          icon={CalendarRange}
          className={cn(tab !== "seasons" && "hidden md:block")}
          items={seasonsQuery.data?.map(s => ({
            id: s.id,
            name: s.name,
            sub: seasonSub(s),
            usage: s.fixtureCount,
          }))}
          isLoading={seasonsQuery.isLoading}
          isFetching={seasonsQuery.isFetching}
          error={seasonsQuery.error}
          onRetry={() => void seasonsQuery.refetch()}
          canManage={isAdmin}
          onCreate={() => setEditing({ kind: "season", id: null })}
          onEdit={id => setEditing({ kind: "season", id })}
          deleteItem={id => deleteSeason({ seasonId: id })}
          inUseCode="SEASON_IN_USE"
        />
        <CatalogPanel
          kind="opponents"
          clubId={club.id}
          icon={Swords}
          className={cn(tab !== "opponents" && "hidden md:block")}
          items={opponentsQuery.data?.map(o => ({
            id: o.id,
            name: o.name,
            usage: o.fixtureCount,
          }))}
          isLoading={opponentsQuery.isLoading}
          isFetching={opponentsQuery.isFetching}
          error={opponentsQuery.error}
          onRetry={() => void opponentsQuery.refetch()}
          canManage={isAdmin}
          onCreate={() => setEditing({ kind: "opponent", id: null })}
          onEdit={id => setEditing({ kind: "opponent", id })}
          deleteItem={id => deleteOpponent({ opponentId: id })}
          inUseCode="OPPONENT_IN_USE"
        />
      </div>

      {editing?.kind === "season" && (
        <SeasonFormSheet
          clubId={club.id}
          season={editingSeason}
          onClose={() => setEditing(null)}
        />
      )}
      {editing?.kind === "opponent" && (
        <OpponentFormSheet
          clubId={club.id}
          opponent={editingOpponent}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
