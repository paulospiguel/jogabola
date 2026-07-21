/**
 * Pure, framework-free presentation logic for the Arena events list screen.
 * No React/DB/hooks imports here — keep this deterministic and unit-testable.
 */

export type EventPartitionStatus = "scheduled" | "confirmed" | "cancelled";

export interface EventPartitionInput {
  id: number;
  startDate: Date;
  status: EventPartitionStatus;
  recurrenceGroupId?: string | null;
}

export interface PartitionedEvents<E> {
  upcoming: E[];
  past: E[];
}

/**
 * Splits a list of events into "upcoming" (Próximos) and "past" (Anteriores)
 * sections, relative to `now`. The two sections are derived independently
 * from the full input list — an empty `upcoming` result must never cause
 * `past` to be empty too, and vice versa; each section only depends on its
 * own filter/sort rule.
 *
 * Upcoming excludes cancelled events (mirrors `selectActiveEvent` in
 * `dashboard-cockpit.ts`: a cancelled event, even if scheduled in the
 * future, is not something to promote as "what's next"). Past events keep
 * every status, including cancelled — a cancelled event that already
 * happened is still part of the team's history.
 *
 * Sort order matches the "what's next / what happened" convention already
 * used by the events list before this refactor: upcoming ascending
 * (soonest first), past descending (most recent first).
 *
 * `upcoming` is additionally collapsed by recurring series (see
 * `collapseUpcomingSeries`) — `past` is never collapsed, so every occurrence
 * that already happened keeps its own card in the history.
 */
export function partitionEventsByDate<E extends EventPartitionInput>(
  events: E[],
  now: Date,
): PartitionedEvents<E> {
  const nowMs = now.getTime();

  const upcoming = collapseUpcomingSeries(
    events
      .filter(
        event =>
          event.status !== "cancelled" && event.startDate.getTime() >= nowMs,
      )
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime()),
  );

  const past = events
    .filter(event => event.startDate.getTime() < nowMs)
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  return { upcoming, past };
}

/**
 * Collapses a list of already-ascending-sorted events down to one entry per
 * `recurrenceGroupId` — the earliest occurrence of each series, since it's
 * the first one encountered in ascending order. Events without a
 * `recurrenceGroupId` (standalone, non-recurring) are never collapsed.
 */
function collapseUpcomingSeries<E extends EventPartitionInput>(
  ascendingEvents: E[],
): E[] {
  const seenGroups = new Set<string>();
  const collapsed: E[] = [];

  for (const event of ascendingEvents) {
    if (!event.recurrenceGroupId) {
      collapsed.push(event);
      continue;
    }
    if (seenGroups.has(event.recurrenceGroupId)) continue;
    seenGroups.add(event.recurrenceGroupId);
    collapsed.push(event);
  }

  return collapsed;
}
