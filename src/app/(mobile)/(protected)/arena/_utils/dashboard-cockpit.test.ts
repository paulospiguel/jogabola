import { describe, expect, it } from "vitest";
import {
  buildCockpitActions,
  buildDashboardViewModel,
  type DashboardEvent,
  selectActiveEvent,
  selectSecondaryEvents,
} from "./dashboard-cockpit";

const OWNER = { isOwner: true, permissions: [] };
const MEMBER = { isOwner: false, permissions: [] };

describe("buildCockpitActions", () => {
  it("blocks cockpit actions when no team exists", () => {
    expect(
      buildCockpitActions({
        hasTeam: false,
        access: MEMBER,
        activeEvent: null,
        squadCount: 0,
      }),
    ).toBeNull();
  });

  it("creates an event and offers adding a player to an empty managed team", () => {
    expect(
      buildCockpitActions({
        hasTeam: true,
        access: OWNER,
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
        access: MEMBER,
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
        access: OWNER,
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
        access: MEMBER,
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
        access: OWNER,
        activeEvent: null,
        squadCount: 1,
      }),
    ).toEqual({
      primary: { type: "create-event" },
      secondary: [],
    });
  });
});

describe("buildCockpitActions granular permissions", () => {
  it("hides create-event and add-player from payments-only staff", () => {
    const actions = buildCockpitActions({
      hasTeam: true,
      access: { isOwner: false, permissions: ["payments.manage"] },
      activeEvent: null,
      squadCount: 0,
    });
    expect(actions).toEqual({ primary: { type: "view-squad" }, secondary: [] });
  });

  it("offers create-event but not add-player to events-only staff", () => {
    expect(
      buildCockpitActions({
        hasTeam: true,
        access: { isOwner: false, permissions: ["events.manage"] },
        activeEvent: null,
        squadCount: 0,
      }),
    ).toEqual({ primary: { type: "create-event" }, secondary: [] });
  });

  it("offers add-player to roster-only staff with an empty squad", () => {
    expect(
      buildCockpitActions({
        hasTeam: true,
        access: { isOwner: false, permissions: ["roster.manage"] },
        activeEvent: null,
        squadCount: 0,
      }),
    ).toEqual({
      primary: { type: "view-squad" },
      secondary: [{ type: "add-player" }],
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

describe("selectSecondaryEvents", () => {
  const now = new Date("2026-07-16T12:00:00.000Z");

  it("returns the remaining upcoming events deterministically sorted, excluding the active one", () => {
    const active: DashboardEvent = {
      id: 2,
      startsAt: new Date("2026-07-18T12:00:00.000Z"),
      status: "scheduled",
    };
    const later: DashboardEvent = {
      id: 5,
      startsAt: new Date("2026-07-25T12:00:00.000Z"),
      status: "scheduled",
    };
    // Same startsAt as each other — tie must break on the lowest id, same
    // rule as selectActiveEvent, so ordering never depends on input order.
    const tiedA: DashboardEvent = {
      id: 9,
      startsAt: new Date("2026-07-20T12:00:00.000Z"),
      status: "confirmed",
    };
    const tiedB: DashboardEvent = {
      id: 4,
      startsAt: new Date("2026-07-20T12:00:00.000Z"),
      status: "confirmed",
    };

    expect(
      selectSecondaryEvents([later, active, tiedA, tiedB], active, now),
    ).toEqual([tiedB, tiedA, later]);
  });

  it("excludes cancelled and past events", () => {
    const cancelled: DashboardEvent = {
      id: 1,
      startsAt: new Date("2026-07-19T12:00:00.000Z"),
      status: "cancelled",
    };
    const past: DashboardEvent = {
      id: 2,
      startsAt: new Date("2026-07-01T12:00:00.000Z"),
      status: "scheduled",
    };

    expect(selectSecondaryEvents([cancelled, past], null, now)).toEqual([]);
  });

  it("returns an empty array when there is nothing beyond the active event", () => {
    const active: DashboardEvent = {
      id: 1,
      startsAt: new Date("2026-07-18T12:00:00.000Z"),
      status: "scheduled",
    };

    expect(selectSecondaryEvents([active], active, now)).toEqual([]);
  });
});

describe("buildDashboardViewModel", () => {
  const now = new Date("2026-07-16T12:00:00.000Z");

  it("produces exactly one primary CTA and hides metrics/week/discover without a team event", () => {
    const viewModel = buildDashboardViewModel({
      hasTeam: true,
      access: OWNER,
      events: [],
      squadCount: 0,
      now,
      isDiscoverFeatureActive: false,
      hasDiscoverContent: false,
    });

    expect(viewModel.actions).toEqual({
      primary: { type: "create-event" },
      secondary: [{ type: "add-player" }],
    });
    expect(Array.isArray(viewModel.actions?.primary)).toBe(false);
    expect(viewModel.showMetrics).toBe(false);
    expect(viewModel.showWeek).toBe(false);
    expect(viewModel.showDiscover).toBe(false);
  });

  it("surfaces the active event and shows metrics once one exists", () => {
    const active: DashboardEvent = {
      id: 1,
      startsAt: new Date("2026-07-20T12:00:00.000Z"),
      status: "scheduled",
    };

    const viewModel = buildDashboardViewModel({
      hasTeam: true,
      access: OWNER,
      events: [active],
      squadCount: 5,
      now,
      isDiscoverFeatureActive: false,
      hasDiscoverContent: false,
    });

    expect(viewModel.activeEvent).toEqual(active);
    expect(viewModel.actions?.primary).toEqual({
      type: "view-event",
      eventId: 1,
    });
    expect(viewModel.showMetrics).toBe(true);
  });

  it("sends a member without management permission to the squad", () => {
    const viewModel = buildDashboardViewModel({
      hasTeam: true,
      access: MEMBER,
      events: [],
      squadCount: 3,
      now,
      isDiscoverFeatureActive: false,
      hasDiscoverContent: false,
    });

    expect(viewModel.actions).toEqual({
      primary: { type: "view-squad" },
      secondary: [],
    });
  });

  it("does not offer add-player to a managed team that already has a squad", () => {
    const viewModel = buildDashboardViewModel({
      hasTeam: true,
      access: OWNER,
      events: [],
      squadCount: 4,
      now,
      isDiscoverFeatureActive: false,
      hasDiscoverContent: false,
    });

    expect(viewModel.actions).toEqual({
      primary: { type: "create-event" },
      secondary: [],
    });
  });

  it("shows the week section only when secondary events exist beyond the active one", () => {
    const active: DashboardEvent = {
      id: 1,
      startsAt: new Date("2026-07-18T12:00:00.000Z"),
      status: "scheduled",
    };
    const secondary: DashboardEvent = {
      id: 2,
      startsAt: new Date("2026-07-22T12:00:00.000Z"),
      status: "scheduled",
    };

    const withoutSecondary = buildDashboardViewModel({
      hasTeam: true,
      access: OWNER,
      events: [active],
      squadCount: 1,
      now,
      isDiscoverFeatureActive: false,
      hasDiscoverContent: false,
    });
    expect(withoutSecondary.showWeek).toBe(false);
    expect(withoutSecondary.secondaryEvents).toEqual([]);

    const withSecondary = buildDashboardViewModel({
      hasTeam: true,
      access: OWNER,
      events: [active, secondary],
      squadCount: 1,
      now,
      isDiscoverFeatureActive: false,
      hasDiscoverContent: false,
    });
    expect(withSecondary.showWeek).toBe(true);
    expect(withSecondary.secondaryEvents).toEqual([secondary]);
  });

  it.each([
    [false, false, false],
    [true, false, false],
    [false, true, false],
    [true, true, true],
  ])("shows discover only when the feature is active AND has content (feature=%s, content=%s -> %s)", (isDiscoverFeatureActive, hasDiscoverContent, expected) => {
    const viewModel = buildDashboardViewModel({
      hasTeam: true,
      access: OWNER,
      events: [],
      squadCount: 1,
      now,
      isDiscoverFeatureActive,
      hasDiscoverContent,
    });

    expect(viewModel.showDiscover).toBe(expected);
  });

  it("returns null actions and hides every section when there is no team", () => {
    const viewModel = buildDashboardViewModel({
      hasTeam: false,
      access: MEMBER,
      events: [],
      squadCount: 0,
      now,
      isDiscoverFeatureActive: true,
      hasDiscoverContent: true,
    });

    expect(viewModel.actions).toBeNull();
    expect(viewModel.showMetrics).toBe(false);
    expect(viewModel.showWeek).toBe(false);
  });
});
