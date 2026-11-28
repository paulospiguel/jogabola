export const frameInterval = 10;
export const formatOptions = [11, 7] as const;
export type MatchFormat = (typeof formatOptions)[number];

const formations = {
  "4-3-3": [4, 3, 3],
  "4-4-2": [4, 4, 2],
  "3-5-2": [3, 5, 2],
  "2-3-1": [2, 3, 1],
  "3-2-1": [3, 2, 1],
  "2-2-2": [2, 2, 2],
};
export type Formation = keyof typeof formations;

export function playerRole(formation: Formation, slot: number) {
  if (slot === 0) return "keeper";
  const [defenders, midfielders] = formations[formation];
  if (slot <= defenders) return "defender";
  if (slot <= defenders + midfielders) return "midfielder";
  return "forward";
}

export interface MatchFormatSettings {
  players: MatchFormat;
  squad: number[];
  duration: number;
  length: number;
  width: number;
  goalWidth: number;
  goalHeight: number;
  formations: readonly [Formation, Formation, Formation];
}

export const matchFormats: Record<MatchFormat, MatchFormatSettings> = {
  11: {
    players: 11,
    squad: Array.from({ length: 16 }, (_, index) => index + 1),
    duration: 90 * 60,
    length: 105,
    width: 68,
    goalWidth: 7.32,
    goalHeight: 2.44,
    formations: ["4-3-3", "4-4-2", "3-5-2"],
  },
  7: {
    players: 7,
    squad: Array.from({ length: 12 }, (_, index) => index + 1),
    duration: 60 * 60,
    length: 65,
    width: 45,
    goalWidth: 6,
    goalHeight: 2,
    formations: ["2-3-1", "3-2-1", "2-2-2"],
  },
};

export type Style = "balanced" | "highPress" | "lowBlock";
type Side = 0 | 1;
export type Point = { x: number; z: number };
export type Player = Point & { number: number; side: Side };

export interface Substitution {
  second: number;
  out: number;
  in: number;
}

export interface PositionChange {
  second: number;
  slot: number;
  depth: number;
  width: number;
}

export interface Scenario {
  format: MatchFormat;
  formation: Formation;
  lineup: number[];
  level: number;
  style: Style;
  seed: number;
  substitutions: Substitution[];
  moves: PositionChange[];
}

export type MatchEvent =
  | { second: number; kind: "substitution"; out: number; in: number }
  | { second: number; kind: "adjustment"; number: number }
  | { second: number; kind: "goal" | "shot" | "recovery"; side: Side };

export interface Frame {
  second: number;
  ball: Point;
  possession: Side;
  players: Player[];
  score: [number, number];
}

export function createScenario(format: MatchFormat): Scenario {
  const settings = matchFormats[format];
  return {
    format,
    formation: settings.formations[0],
    lineup: settings.squad.slice(0, settings.players),
    level: 3,
    style: "balanced",
    seed: 42,
    substitutions: [],
    moves: [],
  };
}

export const defaultScenario = createScenario(11);

export function opponentParameters(level: number) {
  return { pressing: 30 + level * 10, passing: 57 + level * 6 };
}

function slotPositions(
  formation: Formation,
  depthScale: number,
  widthScale: number,
): Point[] {
  return [
    { x: -47 * depthScale, z: 0 },
    ...formations[formation].flatMap((count, line) =>
      Array.from({ length: count }, (_, index) => ({
        x: (-29 + line * 17) * depthScale,
        z: ((index + 0.5) / count - 0.5) * 65 * widthScale,
      })),
    ),
  ];
}

const clamp = (value: number, limit: number) =>
  Math.max(-limit, Math.min(limit, value));

// Each event consumes fixed draws so alternative scenarios share the same random inputs.
function randomSource(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function simulateMatch(scenario: Scenario) {
  const random = randomSource(scenario.seed);
  const opposition = opponentParameters(scenario.level);
  const home = [...scenario.lineup];
  const settings = matchFormats[scenario.format];
  const depthScale = settings.length / matchFormats[11].length;
  const widthScale = settings.width / matchFormats[11].width;
  const formation = settings.formations.includes(scenario.formation)
    ? scenario.formation
    : settings.formations[0];
  const homeShape = slotPositions(formation, depthScale, widthScale);
  const awayShape = slotPositions(
    settings.formations[1],
    depthScale,
    widthScale,
  );
  const onPitch = (point: Point): Point => ({
    x: clamp(point.x, 51 * depthScale),
    z: clamp(point.z, 32 * widthScale),
  });
  const positions = [homeShape, awayShape];
  const frames: Frame[] = [];
  const events: MatchEvent[] = [];
  const score: [number, number] = [0, 0];
  let possession: Side = 0;
  let ball = { x: 0, z: 0 };
  let phase = 0;
  let restart: Point | undefined;

  for (let second = 0; second <= settings.duration; second += frameInterval) {
    for (const move of scenario.moves.filter(
      move =>
        move.second === second &&
        move.slot >= 0 &&
        move.slot < settings.players,
    )) {
      homeShape[move.slot] = onPitch({
        x: homeShape[move.slot].x + move.depth,
        z: homeShape[move.slot].z + move.width,
      });
      events.push({ second, kind: "adjustment", number: home[move.slot] });
    }

    for (const sub of scenario.substitutions.filter(
      sub => sub.second === second,
    )) {
      if (
        home.includes(sub.out) &&
        !home.includes(sub.in) &&
        settings.squad.includes(sub.in)
      ) {
        home[home.indexOf(sub.out)] = sub.in;
        events.push({ ...sub, kind: "substitution" });
      }
    }

    if (restart) {
      ball = restart;
      restart = undefined;
    }
    if (second > 0 && second % 40 === 0) {
      const action = random();
      const lane = random();
      const finish = random();
      const direction = possession === 0 ? 1 : -1;
      const defending: Side = possession === 0 ? 1 : 0;
      const style =
        scenario.style === "highPress"
          ? 0.08
          : scenario.style === "lowBlock"
            ? -0.06
            : 0;
      const shape = positions[possession];
      const outlets = shape
        .slice(1)
        .filter(point => Math.abs(point.z - ball.z) < 20 * widthScale).length;
      const press = defending === 1 ? opposition.pressing / 100 + style : 0.6;
      const passing = possession === 1 ? opposition.passing / 100 : 0.77;
      const fresh =
        possession === 0 &&
        home.some(number => !scenario.lineup.includes(number))
          ? 0.035
          : 0;
      const turnover =
        (1 - passing) * 0.42 + press * 0.2 - outlets * 0.008 - fresh;
      if (ball.x * direction > 30 * depthScale && action < 0.64) {
        const blockPenalty =
          defending === 1 && scenario.style === "lowBlock" ? 0.07 : 0;
        const goal = finish < 0.34 - Math.abs(ball.z) / 150 - blockPenalty;
        events.push({ second, kind: goal ? "goal" : "shot", side: possession });
        if (goal) score[possession] += 1;
        possession = defending;
        ball = {
          x: direction * (settings.length / 2 + 0.5),
          z: goal
            ? (lane - 0.5) * (settings.goalWidth - 1.32)
            : (lane > 0.5 ? 1 : -1) * 8,
        };
        restart = goal
          ? { x: 0, z: 0 }
          : { x: direction * 43 * depthScale, z: 0 };
      } else if (action < turnover) {
        possession = defending;
        events.push({ second, kind: "recovery", side: possession });
      } else {
        const supported = shape[1 + Math.floor(lane * (settings.players - 1))];
        const depth =
          (8 + passing * 8 + fresh * 100) * depthScale + supported.x / 7;
        ball = onPitch({
          x: ball.x + direction * depth,
          z: ball.z * 0.6 + supported.z * 0.4,
        });
      }
      phase += 1;
    }

    const players = positions.flatMap((shape, index) => {
      const side = index as Side;
      const direction = side === 0 ? 1 : -1;
      const pressing = side === 1 && scenario.style === "highPress" ? 6 : 0;
      const block = side === 1 && scenario.style === "lowBlock" ? -7 : 0;
      const shift = possession === side ? 10 : 1 + pressing + block;
      return shape.map(
        (point, slot): Player => ({
          ...onPitch(
            slot === 0
              ? {
                  x: point.x * direction,
                  z: point.z * direction + ball.z * 0.17,
                }
              : {
                  x: (point.x + shift * depthScale) * direction + ball.x * 0.24,
                  z:
                    point.z * direction * (possession === side ? 1 : 0.83) +
                    ball.z * 0.21 +
                    Math.sin(phase + slot) * 1.8,
                },
          ),
          side,
          number: side === 0 ? home[slot] : slot + 1,
        }),
      );
    });
    // One outfield player supports the ball in the visualised phase.
    const support = restart
      ? undefined
      : players
          .filter(
            (player, index) =>
              player.side === possession && index % settings.players !== 0,
          )
          .reduce((closest, player) =>
            Math.hypot(player.x - ball.x, player.z - ball.z) <
            Math.hypot(closest.x - ball.x, closest.z - ball.z)
              ? player
              : closest,
          );
    if (support) {
      support.x = ball.x - (possession === 0 ? 0.8 : -0.8);
      support.z = ball.z;
    }
    frames.push({ second, players, ball, possession, score: [...score] });
  }

  return { frames, events };
}

export type Match = ReturnType<typeof simulateMatch>;
