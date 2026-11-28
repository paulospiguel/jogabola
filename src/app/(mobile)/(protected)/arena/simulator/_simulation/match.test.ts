import { describe, expect, it } from "vitest";
import {
  createScenario,
  defaultScenario,
  matchFormats,
  simulateMatch,
} from "./match";

describe("match simulation", () => {
  it("reproduces the same scenario and reacts to opponent settings", () => {
    const baseline = simulateMatch(defaultScenario);
    expect(simulateMatch(defaultScenario)).toEqual(baseline);
    expect(simulateMatch({ ...defaultScenario, level: 5 })).not.toEqual(
      baseline,
    );
    expect(
      simulateMatch({ ...defaultScenario, level: 5, style: "highPress" }),
    ).not.toEqual(baseline);
  });

  it("applies a substitution at the scheduled minute without rewriting earlier frames", () => {
    const baseline = simulateMatch(defaultScenario);
    const changed = simulateMatch({
      ...defaultScenario,
      substitutions: [{ second: 3600, out: 11, in: 12 }],
    });

    const frame = changed.frames.find(frame => frame.second === 3600);
    expect(frame?.players.slice(0, 11).map(player => player.number)).toContain(
      12,
    );
    expect(
      frame?.players.some(player => player.side === 0 && player.number === 11),
    ).toBe(false);
    expect(changed.frames.filter(frame => frame.second < 3600)).toEqual(
      baseline.frames.filter(frame => frame.second < 3600),
    );
  });

  it("applies tactical adjustments at playback time and keeps lineups valid", () => {
    const changed = simulateMatch({
      ...defaultScenario,
      moves: [{ second: 120, slot: 10, depth: -12, width: 4 }],
      substitutions: [
        { second: 120, out: 11, in: 12 },
        { second: 120, out: 10, in: 12 },
      ],
    });
    expect(
      changed.events.filter(event => event.kind === "substitution"),
    ).toHaveLength(1);
    expect(changed.events.some(event => event.kind === "adjustment")).toBe(
      true,
    );
    expect(changed.frames.every(frame => frame.players.length === 22)).toBe(
      true,
    );
    expect(changed.frames.at(-1)?.second).toBe(5400);
  });

  it("moves the goalkeeper laterally and sends the ball to goal before restarting", () => {
    const match = simulateMatch({
      ...defaultScenario,
      moves: [{ second: 0, slot: 0, depth: 0, width: 5 }],
    });
    expect(match.frames[0].players[0].z).toBe(5);
    const goal = match.events.find(event => event.kind === "goal");
    expect(goal).toBeDefined();
    const index = match.frames.findIndex(
      frame => frame.second === goal?.second,
    );
    expect(Math.abs(match.frames[index].ball.x)).toBeGreaterThan(52.5);
    expect(match.frames[index + 1].ball).toEqual({ x: 0, z: 0 });
  });

  it("runs football 7 with seven players per side, its own pitch and clock", () => {
    const scenario = createScenario(7);
    const config = matchFormats[7];
    const match = simulateMatch({
      ...scenario,
      substitutions: [{ second: 2400, out: 7, in: 8 }],
      moves: [{ second: 0, slot: 0, depth: -15, width: 15 }],
    });

    expect(scenario.formation).toBe("2-3-1");
    expect(config.formations).toEqual(["2-3-1", "3-2-1", "2-2-2"]);
    expect(match.frames.at(-1)?.second).toBe(60 * 60);
    expect(
      match.frames.every(
        frame =>
          frame.players.length === 14 &&
          frame.players.every(
            player =>
              Number.isFinite(player.x) &&
              Number.isFinite(player.z) &&
              Math.abs(player.x) <= 65 / 2 &&
              Math.abs(player.z) <= 45 / 2,
          ),
      ),
    ).toBe(true);
    const adjusted = match.frames.find(frame => frame.second === 2400);
    expect(
      adjusted?.players
        .filter(player => player.side === 0)
        .map(player => player.number),
    ).toEqual([1, 2, 3, 4, 5, 6, 8]);
    expect(
      match.events.filter(event => event.kind === "substitution"),
    ).toHaveLength(1);
  });

  it("uses seven players even if a football 11 formation is passed to a football 7 scenario", () => {
    const match = simulateMatch({ ...createScenario(7), formation: "4-3-3" });
    expect(match.frames.every(frame => frame.players.length === 14)).toBe(true);
  });
});
