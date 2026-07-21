import { describe, expect, it } from "vitest";
import { type EventPartitionInput, partitionEventsByDate } from "./events-view";

describe("partitionEventsByDate", () => {
  const now = new Date("2026-07-16T12:00:00.000Z");

  it("keeps past events when there is no upcoming event — the sections are independent, not gated on each other", () => {
    const onlyPast: EventPartitionInput = {
      id: 1,
      startDate: new Date("2026-07-01T12:00:00.000Z"),
      status: "scheduled",
    };

    const result = partitionEventsByDate([onlyPast], now);

    expect(result.upcoming).toEqual([]);
    expect(result.past).toEqual([onlyPast]);
  });

  it("keeps upcoming events when there is no past event", () => {
    const onlyUpcoming: EventPartitionInput = {
      id: 1,
      startDate: new Date("2026-08-01T12:00:00.000Z"),
      status: "scheduled",
    };

    const result = partitionEventsByDate([onlyUpcoming], now);

    expect(result.upcoming).toEqual([onlyUpcoming]);
    expect(result.past).toEqual([]);
  });

  it("never places a cancelled event in the upcoming section, even when it is the nearest one", () => {
    const cancelled: EventPartitionInput = {
      id: 1,
      startDate: new Date("2026-07-17T12:00:00.000Z"),
      status: "cancelled",
    };
    const scheduled: EventPartitionInput = {
      id: 2,
      startDate: new Date("2026-07-25T12:00:00.000Z"),
      status: "scheduled",
    };

    const result = partitionEventsByDate([cancelled, scheduled], now);

    expect(result.upcoming).toEqual([scheduled]);
    expect(result.upcoming.some(e => e.status === "cancelled")).toBe(false);
  });

  it("keeps a cancelled event in the past section once it has already happened — history is preserved regardless of status", () => {
    const cancelledPast: EventPartitionInput = {
      id: 1,
      startDate: new Date("2026-07-01T12:00:00.000Z"),
      status: "cancelled",
    };

    const result = partitionEventsByDate([cancelledPast], now);

    expect(result.past).toEqual([cancelledPast]);
  });

  it("sorts upcoming ascending (soonest first)", () => {
    const later: EventPartitionInput = {
      id: 1,
      startDate: new Date("2026-08-10T12:00:00.000Z"),
      status: "scheduled",
    };
    const sooner: EventPartitionInput = {
      id: 2,
      startDate: new Date("2026-07-20T12:00:00.000Z"),
      status: "scheduled",
    };

    const result = partitionEventsByDate([later, sooner], now);

    expect(result.upcoming).toEqual([sooner, later]);
  });

  it("sorts past descending (most recent first)", () => {
    const older: EventPartitionInput = {
      id: 1,
      startDate: new Date("2026-06-01T12:00:00.000Z"),
      status: "scheduled",
    };
    const recent: EventPartitionInput = {
      id: 2,
      startDate: new Date("2026-07-10T12:00:00.000Z"),
      status: "scheduled",
    };

    const result = partitionEventsByDate([older, recent], now);

    expect(result.past).toEqual([recent, older]);
  });

  it("treats an event starting exactly at `now` as upcoming, not past", () => {
    const exact: EventPartitionInput = {
      id: 1,
      startDate: new Date(now.getTime()),
      status: "scheduled",
    };

    const result = partitionEventsByDate([exact], now);

    expect(result.upcoming).toEqual([exact]);
    expect(result.past).toEqual([]);
  });

  it("collapses a recurring series in upcoming down to its earliest occurrence", () => {
    const soonest: EventPartitionInput = {
      id: 1,
      startDate: new Date("2026-07-20T12:00:00.000Z"),
      status: "scheduled",
      recurrenceGroupId: "series-a",
    };
    const later: EventPartitionInput = {
      id: 2,
      startDate: new Date("2026-07-27T12:00:00.000Z"),
      status: "scheduled",
      recurrenceGroupId: "series-a",
    };
    const evenLater: EventPartitionInput = {
      id: 3,
      startDate: new Date("2026-08-03T12:00:00.000Z"),
      status: "scheduled",
      recurrenceGroupId: "series-a",
    };

    const result = partitionEventsByDate([later, evenLater, soonest], now);

    expect(result.upcoming).toEqual([soonest]);
  });

  it("keeps standalone upcoming events (no recurrenceGroupId) uncollapsed", () => {
    const standaloneA: EventPartitionInput = {
      id: 1,
      startDate: new Date("2026-07-20T12:00:00.000Z"),
      status: "scheduled",
      recurrenceGroupId: null,
    };
    const standaloneB: EventPartitionInput = {
      id: 2,
      startDate: new Date("2026-07-25T12:00:00.000Z"),
      status: "scheduled",
    };

    const result = partitionEventsByDate([standaloneA, standaloneB], now);

    expect(result.upcoming).toEqual([standaloneA, standaloneB]);
  });

  it("keeps each series' own earliest occurrence when multiple series are upcoming", () => {
    const seriesASoonest: EventPartitionInput = {
      id: 1,
      startDate: new Date("2026-07-20T12:00:00.000Z"),
      status: "scheduled",
      recurrenceGroupId: "series-a",
    };
    const seriesALater: EventPartitionInput = {
      id: 2,
      startDate: new Date("2026-07-27T12:00:00.000Z"),
      status: "scheduled",
      recurrenceGroupId: "series-a",
    };
    const seriesBSoonest: EventPartitionInput = {
      id: 3,
      startDate: new Date("2026-07-22T12:00:00.000Z"),
      status: "scheduled",
      recurrenceGroupId: "series-b",
    };

    const result = partitionEventsByDate(
      [seriesALater, seriesBSoonest, seriesASoonest],
      now,
    );

    expect(result.upcoming).toEqual([seriesASoonest, seriesBSoonest]);
  });

  it("never collapses past occurrences of a series — each keeps its own card", () => {
    const pastOne: EventPartitionInput = {
      id: 1,
      startDate: new Date("2026-06-01T12:00:00.000Z"),
      status: "scheduled",
      recurrenceGroupId: "series-a",
    };
    const pastTwo: EventPartitionInput = {
      id: 2,
      startDate: new Date("2026-06-08T12:00:00.000Z"),
      status: "scheduled",
      recurrenceGroupId: "series-a",
    };
    const upcomingOne: EventPartitionInput = {
      id: 3,
      startDate: new Date("2026-08-01T12:00:00.000Z"),
      status: "scheduled",
      recurrenceGroupId: "series-a",
    };
    const upcomingTwo: EventPartitionInput = {
      id: 4,
      startDate: new Date("2026-08-08T12:00:00.000Z"),
      status: "scheduled",
      recurrenceGroupId: "series-a",
    };

    const result = partitionEventsByDate(
      [pastOne, pastTwo, upcomingOne, upcomingTwo],
      now,
    );

    expect(result.past).toEqual([pastTwo, pastOne]);
    expect(result.upcoming).toEqual([upcomingOne]);
  });
});
