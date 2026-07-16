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
 */
export function selectActiveEvent(
  events: DashboardEvent[],
  now: Date,
): DashboardEvent | null {
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
