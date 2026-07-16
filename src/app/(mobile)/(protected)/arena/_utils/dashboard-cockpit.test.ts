import { describe, expect, it } from "vitest";
import {
  buildCockpitActions,
  type DashboardEvent,
  selectActiveEvent,
} from "./dashboard-cockpit";

describe("buildCockpitActions", () => {
  it("blocks cockpit actions when no team exists", () => {
    expect(
      buildCockpitActions({
        hasTeam: false,
        canManageTeam: false,
        activeEvent: null,
        squadCount: 0,
      }),
    ).toBeNull();
  });

  it("creates an event and offers adding a player to an empty managed team", () => {
    expect(
      buildCockpitActions({
        hasTeam: true,
        canManageTeam: true,
        activeEvent: null,
        squadCount: 0,
      }),
    ).toEqual({
      primary: { type: "create-event" },
      secondary: [{ type: "add-player" }],
    });
  });

  it("sends a non-managing member without an active event to the squad", () => {
    expect(
      buildCockpitActions({
        hasTeam: true,
        canManageTeam: false,
        activeEvent: null,
        squadCount: 3,
      }),
    ).toEqual({
      primary: { type: "view-squad" },
      secondary: [],
    });
  });

  it("surfaces the active event as the primary action once one exists", () => {
    const activeEvent: DashboardEvent = {
      id: 42,
      startsAt: new Date("2026-08-01T18:00:00.000Z"),
      status: "scheduled",
    };

    expect(
      buildCockpitActions({
        hasTeam: true,
        canManageTeam: true,
        activeEvent,
        squadCount: 5,
      }),
    ).toEqual({
      primary: { type: "view-event", eventId: 42 },
      secondary: [],
    });
  });

  it("does not offer add-player to non-managers even with an empty squad", () => {
    expect(
      buildCockpitActions({
        hasTeam: true,
        canManageTeam: false,
        activeEvent: null,
        squadCount: 0,
      }),
    ).toEqual({
      primary: { type: "view-squad" },
      secondary: [],
    });
  });

  it("does not offer add-player to managers once the squad has players", () => {
    expect(
      buildCockpitActions({
        hasTeam: true,
        canManageTeam: true,
        activeEvent: null,
        squadCount: 1,
      }),
    ).toEqual({
      primary: { type: "create-event" },
      secondary: [],
    });
  });
});

describe("selectActiveEvent", () => {
  const now = new Date("2026-07-16T12:00:00.000Z");

  it("returns null when there are no events", () => {
    expect(selectActiveEvent([], now)).toBeNull();
  });

  it("picks the nearest future, non-cancelled event", () => {
    const far: DashboardEvent = {
      id: 1,
      startsAt: new Date("2026-08-01T12:00:00.000Z"),
      status: "scheduled",
    };
    const near: DashboardEvent = {
      id: 2,
      startsAt: new Date("2026-07-20T12:00:00.000Z"),
      status: "confirmed",
    };

    expect(selectActiveEvent([far, near], now)).toEqual(near);
  });

  it("ignores past events", () => {
    const past: DashboardEvent = {
      id: 3,
      startsAt: new Date("2026-07-01T12:00:00.000Z"),
      status: "scheduled",
    };

    expect(selectActiveEvent([past], now)).toBeNull();
  });

  it("breaks ties on the same start time using the lowest id", () => {
    const eventA: DashboardEvent = {
      id: 9,
      startsAt: new Date("2026-07-20T12:00:00.000Z"),
      status: "scheduled",
    };
    const eventB: DashboardEvent = {
      id: 4,
      startsAt: new Date("2026-07-20T12:00:00.000Z"),
      status: "scheduled",
    };

    expect(selectActiveEvent([eventA, eventB], now)).toEqual(eventB);
  });

  it("ignores cancelled events even when they are the nearest", () => {
    const cancelled: DashboardEvent = {
      id: 5,
      startsAt: new Date("2026-07-17T12:00:00.000Z"),
      status: "cancelled",
    };
    const later: DashboardEvent = {
      id: 6,
      startsAt: new Date("2026-07-25T12:00:00.000Z"),
      status: "scheduled",
    };

    expect(selectActiveEvent([cancelled, later], now)).toEqual(later);
  });
});
