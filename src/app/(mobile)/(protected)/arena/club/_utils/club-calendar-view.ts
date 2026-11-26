import { CLUB_CALENDAR_TIME_ZONE, zonedDateKey } from "./club-calendar-time";

/** Minimal fixture shape the calendar view logic needs. */
export interface CalendarFixtureLike {
  id: number;
  startsAt: string;
  season: { id: number };
  team: { id: number };
}

export interface FixtureDayGroup<T> {
  dayKey: string;
  fixtures: T[];
}

export type FixtureScope = "upcoming" | "past";

/**
 * Splits fixtures into upcoming (soonest first) and past (most recent
 * first). A fixture starting exactly now counts as upcoming.
 */
export function partitionFixtures<T extends CalendarFixtureLike>(
  fixtures: readonly T[],
  now: Date,
) {
  const nowMs = now.getTime();
  const byStart = [...fixtures].sort(
    (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt) || a.id - b.id,
  );
  return {
    upcoming: byStart.filter(f => Date.parse(f.startsAt) >= nowMs),
    past: byStart.filter(f => Date.parse(f.startsAt) < nowMs).reverse(),
  };
}

export interface FixtureFilters {
  seasonId: number | null;
  teamId: number | null;
}

export function filterFixtures<T extends CalendarFixtureLike>(
  fixtures: readonly T[],
  { seasonId, teamId }: FixtureFilters,
) {
  return fixtures.filter(
    f =>
      (seasonId === null || f.season.id === seasonId) &&
      (teamId === null || f.team.id === teamId),
  );
}

/** Groups already-ordered fixtures by calendar day in `timeZone`. */
export function groupFixturesByDay<T extends CalendarFixtureLike>(
  fixtures: readonly T[],
  timeZone: string = CLUB_CALENDAR_TIME_ZONE,
): FixtureDayGroup<T>[] {
  const groups: FixtureDayGroup<T>[] = [];
  for (const fixture of fixtures) {
    const dayKey = zonedDateKey(fixture.startsAt, timeZone);
    const last = groups.at(-1);
    if (last?.dayKey === dayKey) {
      last.fixtures.push(fixture);
    } else {
      groups.push({ dayKey, fixtures: [fixture] });
    }
  }
  return groups;
}

/** Unique teams present in the fixtures, by name. */
export function teamsInFixtures<
  T extends { team: { id: number; name: string } },
>(fixtures: readonly T[]) {
  const byId = new Map<number, { id: number; name: string }>();
  for (const f of fixtures) byId.set(f.team.id, f.team);
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Distinct competition names, most used first, for form suggestions. */
export function competitionSuggestions(
  fixtures: readonly { competitionName: string }[],
) {
  const counts = new Map<string, number>();
  for (const f of fixtures) {
    counts.set(f.competitionName, (counts.get(f.competitionName) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([name]) => name);
}
