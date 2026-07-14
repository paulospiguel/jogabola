export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed;

  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let value = a;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: T[], rng: Rng): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }

  return shuffled;
}

export function drawPlayers(
  names: string[],
  teamCount: number,
  rng: Rng,
): string[][] {
  if (!Number.isInteger(teamCount) || teamCount <= 0) {
    throw new RangeError("teamCount must be a positive integer");
  }

  const teams = Array.from({ length: teamCount }, () => [] as string[]);

  shuffle(names, rng).forEach((name, index) => {
    teams[index % teamCount].push(name);
  });

  return teams;
}
