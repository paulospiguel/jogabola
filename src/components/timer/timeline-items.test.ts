import { describe, expect, it } from "vitest";
import { buildTimelineItems } from "./timeline-items";
import type { MatchEvent } from "./types";

function goal(
  id: string,
  atSec: number,
  team: "A" | "B",
  playerId: string,
): MatchEvent {
  return { id, atSec, period: 1, type: "goal", team, playerId };
}

function card(id: string, atSec: number, team: "A" | "B"): MatchEvent {
  return {
    id,
    atSec,
    period: 1,
    type: "card",
    team,
    playerId: "p9",
    card: "yellow",
  };
}

describe("buildTimelineItems", () => {
  it("groups goals by team + player with chronological times", () => {
    const items = buildTimelineItems([
      goal("g1", 300, "A", "p1"),
      goal("g2", 900, "B", "p2"),
      goal("g3", 1500, "A", "p1"),
    ]);

    expect(items).toHaveLength(2);
    const p1 = items.find(i => i.kind === "goals" && i.playerId === "p1");
    expect(p1).toMatchObject({
      kind: "goals",
      team: "A",
      atSecs: [300, 1500],
      latestAtSec: 1500,
      latestEventId: "g3",
    });
  });

  it("keeps unassigned goals (playerId '') grouped per team, not merged across teams", () => {
    const items = buildTimelineItems([
      goal("g1", 100, "A", ""),
      goal("g2", 200, "B", ""),
      goal("g3", 300, "A", ""),
    ]);

    const groupA = items.find(i => i.kind === "goals" && i.team === "A");
    const groupB = items.find(i => i.kind === "goals" && i.team === "B");
    expect(groupA).toMatchObject({ atSecs: [100, 300] });
    expect(groupB).toMatchObject({ atSecs: [200] });
  });

  it("keeps each card as an individual item", () => {
    const items = buildTimelineItems([
      card("c1", 100, "A"),
      card("c2", 200, "A"),
    ]);
    expect(items).toHaveLength(2);
    expect(items.every(i => i.kind === "card")).toBe(true);
  });

  it("orders lines by their most recent event, newest first", () => {
    const items = buildTimelineItems([
      goal("g1", 100, "A", "p1"), // p1 group becomes latest via g4
      card("c1", 500, "B"),
      goal("g2", 300, "B", "p2"),
      goal("g4", 900, "A", "p1"),
    ]);

    expect(
      items.map(i => (i.kind === "card" ? i.event.id : i.playerId)),
    ).toEqual(["p1", "c1", "p2"]);
  });

  it("breaks atSec ties by original registration order (higher index = newer)", () => {
    const items = buildTimelineItems([
      goal("g1", 300, "A", "p1"),
      goal("g2", 300, "B", "p2"), // same second, registered later → newer
    ]);
    expect(items.map(i => (i.kind === "goals" ? i.playerId : ""))).toEqual([
      "p2",
      "p1",
    ]);
  });

  it("points removal at the newest goal of the group (highest atSec, then index)", () => {
    const items = buildTimelineItems([
      goal("g1", 300, "A", "p1"),
      goal("g2", 300, "A", "p1"), // tie on atSec — g2 is newer by index
    ]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ kind: "goals", latestEventId: "g2" });
  });
});
