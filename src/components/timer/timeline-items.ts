import type { MatchEvent, TeamSide } from "./types";

/**
 * Presentation grouping for the match timeline (spec:
 * docs/superpowers/specs/2026-07-15-group-player-goals-design.md).
 * Goals collapse into one line per team+player; cards stay individual.
 * Pure view-model transform — persisted events are never mutated.
 */

export interface GoalGroupItem {
  kind: "goals";
  key: string;
  team: TeamSide;
  playerId: string;
  /** Goal times in chronological order. */
  atSecs: number[];
  /** Most recent goal of the group — orders the timeline. */
  latestAtSec: number;
  /** Removal always targets the group's newest goal. */
  latestEventId: string;
}

export interface CardItem {
  kind: "card";
  key: string;
  event: MatchEvent;
  latestAtSec: number;
}

export type TimelineItem = GoalGroupItem | CardItem;

/** Registration order breaks atSec ties: higher original index = newer. */
interface Ranked {
  item: TimelineItem;
  latestIndex: number;
}

export function buildTimelineItems(events: MatchEvent[]): TimelineItem[] {
  const goalGroups = new Map<string, { item: GoalGroupItem; index: number }>();
  const ranked: Ranked[] = [];

  events.forEach((event, index) => {
    if (event.type === "card") {
      ranked.push({
        item: {
          kind: "card",
          key: `card:${event.id}`,
          event,
          latestAtSec: event.atSec,
        },
        latestIndex: index,
      });
      return;
    }

    const key = `goals:${event.team}:${event.playerId}`;
    const existing = goalGroups.get(key);
    if (!existing) {
      const item: GoalGroupItem = {
        kind: "goals",
        key,
        team: event.team,
        playerId: event.playerId,
        atSecs: [event.atSec],
        latestAtSec: event.atSec,
        latestEventId: event.id,
      };
      goalGroups.set(key, { item, index });
      ranked.push({ item, latestIndex: index });
      return;
    }

    existing.item.atSecs.push(event.atSec);
    const isNewer =
      event.atSec > existing.item.latestAtSec ||
      (event.atSec === existing.item.latestAtSec && index > existing.index);
    if (isNewer) {
      existing.item.latestAtSec = event.atSec;
      existing.item.latestEventId = event.id;
      existing.index = index;
      const rankedEntry = ranked.find(r => r.item === existing.item);
      if (rankedEntry) rankedEntry.latestIndex = index;
    }
  });

  for (const { item } of goalGroups.values()) {
    item.atSecs.sort((a, b) => a - b);
  }

  return ranked
    .sort(
      (a, b) =>
        b.item.latestAtSec - a.item.latestAtSec ||
        b.latestIndex - a.latestIndex,
    )
    .map(r => r.item);
}
