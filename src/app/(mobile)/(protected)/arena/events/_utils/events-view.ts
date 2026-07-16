/**
 * Pure, framework-free presentation logic for the Arena events list screen.
 * No React/DB/hooks imports here — keep this deterministic and unit-testable.
 */

export type EventPartitionStatus = "scheduled" | "confirmed" | "cancelled";

export interface EventPartitionInput {
  id: number;
  startDate: Date;
  status: EventPartitionStatus;
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
 */
export function partitionEventsByDate<E extends EventPartitionInput>(
  events: E[],
  now: Date,
): PartitionedEvents<E> {
  const nowMs = now.getTime();

  const upcoming = events
    .filter(
      event =>
        event.status !== "cancelled" && event.startDate.getTime() >= nowMs,
    )
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const past = events
    .filter(event => event.startDate.getTime() < nowMs)
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  return { upcoming, past };
}
