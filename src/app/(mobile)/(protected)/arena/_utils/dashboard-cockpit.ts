/**
 * Pure, framework-free presentation logic for the Arena dashboard cockpit.
 * No React/DB/hooks imports here — keep this deterministic and unit-testable.
 */

export type DashboardEventStatus = "scheduled" | "confirmed" | "cancelled";

export interface DashboardEvent {
  id: number;
  startsAt: Date;
  status: DashboardEventStatus;
}

export type CockpitAction =
  | { type: "create-event" }
  | { type: "view-event"; eventId: number }
  | { type: "add-player" }
  | { type: "view-squad" };

export interface CockpitActionInput {
  hasTeam: boolean;
  canManageTeam: boolean;
  activeEvent: DashboardEvent | null;
  squadCount: number;
}

export interface CockpitActions {
  primary: CockpitAction;
  secondary: CockpitAction[];
}

/**
 * Picks the cockpit's "active event": the nearest future, non-cancelled
 * event. Ties on `startsAt` are broken by the lowest `id`. `now` is passed
 * explicitly so callers stay deterministic and testable.
 *
 * Generic over `E` (any shape extending `DashboardEvent`) so callers can
 * pass their richer, UI-facing event objects and get the same reference
 * back — no need to re-map display fields after selection.
 */
export function selectActiveEvent<E extends DashboardEvent>(
  events: E[],
  now: Date,
): E | null {
  const upcoming = events.filter(
    event =>
      event.status !== "cancelled" && event.startsAt.getTime() >= now.getTime(),
  );

  if (upcoming.length === 0) return null;

  return upcoming.reduce((closest, candidate) => {
    const closestTime = closest.startsAt.getTime();
    const candidateTime = candidate.startsAt.getTime();

    if (candidateTime < closestTime) return candidate;
    if (candidateTime > closestTime) return closest;
    return candidate.id < closest.id ? candidate : closest;
  });
}

/**
 * Picks the remaining eligible upcoming events beyond the active one (used
 * for the "Esta semana" list), sorted deterministically by the same rule as
 * `selectActiveEvent` — ascending `startsAt`, ties broken by the lowest
 * `id` — so the list never depends on API/input ordering.
 */
export function selectSecondaryEvents<E extends DashboardEvent>(
  events: E[],
  activeEvent: E | null,
  now: Date,
): E[] {
  return events
    .filter(
      event =>
        event.status !== "cancelled" &&
        event.startsAt.getTime() >= now.getTime() &&
        event.id !== activeEvent?.id,
    )
    .sort((a, b) => {
      const diff = a.startsAt.getTime() - b.startsAt.getTime();
      if (diff !== 0) return diff;
      return a.id - b.id;
    });
}

/**
 * Derives which cockpit actions to show. `canManage` here is
 * presentation-only — every mutation still needs server-side authorization
 * via canManageTeam/userIsTeamOwner.
 */
export function buildCockpitActions(
  input: CockpitActionInput,
): CockpitActions | null {
  const { hasTeam, canManageTeam, activeEvent, squadCount } = input;

  if (!hasTeam) return null;

  const primary: CockpitAction = activeEvent
    ? { type: "view-event", eventId: activeEvent.id }
    : canManageTeam
      ? { type: "create-event" }
      : { type: "view-squad" };

  const secondary: CockpitAction[] =
    canManageTeam && squadCount === 0 ? [{ type: "add-player" }] : [];

  return { primary, secondary };
}

export interface DashboardViewModelInput<E extends DashboardEvent> {
  hasTeam: boolean;
  canManageTeam: boolean;
  events: E[];
  squadCount: number;
  now: Date;
  /**
   * Whether the Discover section has at least one card enabled at all
   * (today: `FEATURES.rankings || FEATURES.seasonHistory`).
   */
  isDiscoverFeatureActive: boolean;
  /**
   * Whether the currently-active discover card(s) have something real to
   * show. Kept separate from `isDiscoverFeatureActive` for when a card
   * needs real data to be non-empty (e.g. rankings requiring computed
   * standings) — today there is no such data source yet, so callers pass
   * the same signal as `isDiscoverFeatureActive` until one exists.
   */
  hasDiscoverContent: boolean;
}

export interface DashboardViewModel<E extends DashboardEvent> {
  activeEvent: E | null;
  secondaryEvents: E[];
  actions: CockpitActions | null;
  /** Only true once there is an active event to show metrics for. */
  showMetrics: boolean;
  /** Only true when there are secondary events beyond the active one. */
  showWeek: boolean;
  /** Only true when the discover feature is active AND has content. */
  showDiscover: boolean;
}

/**
 * Composes `selectActiveEvent`, `selectSecondaryEvents` and
 * `buildCockpitActions` into the dashboard's full presentation view model,
 * including the section-visibility flags. The UI layer should only need to
 * translate this output into sheets/links — it must not re-derive any of
 * this logic itself.
 *
 * Note on "Partilhar equipa": the design spec allows a "share team"
 * secondary action once a team-sharing mechanism exists. Confirmed via
 * `rg -n "Partilhar equipa|shareTeam|team.*share|share.*team|navigator.share" src`
 * (2026-07-16) that no such mechanism exists today — only event/timer
 * sharing via `navigator.share`. This view model intentionally does not
 * model a "share-team" action: there is no safe URL/contract to share a
 * team yet. Add it here, with its own test case, once one exists.
 */
export function buildDashboardViewModel<E extends DashboardEvent>(
  input: DashboardViewModelInput<E>,
): DashboardViewModel<E> {
  const {
    hasTeam,
    canManageTeam,
    events,
    squadCount,
    now,
    isDiscoverFeatureActive,
    hasDiscoverContent,
  } = input;

  const activeEvent = selectActiveEvent(events, now);
  const secondaryEvents = selectSecondaryEvents(events, activeEvent, now);
  const actions = buildCockpitActions({
    hasTeam,
    canManageTeam,
    activeEvent,
    squadCount,
  });

  return {
    activeEvent,
    secondaryEvents,
    actions,
    showMetrics: activeEvent !== null,
    showWeek: secondaryEvents.length > 0,
    showDiscover: isDiscoverFeatureActive && hasDiscoverContent,
  };
}
