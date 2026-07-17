import { type Rng, shuffle } from "./draw";

export const TOURNAMENT_NAME_MAX_LENGTH = 80;

export function parsePlayerNames(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map(name => name.trim().slice(0, TOURNAMENT_NAME_MAX_LENGTH))
    .filter(Boolean);
}

export function resolveStartingOrder<T>(
  items: T[],
  shouldShuffle: boolean,
  rng: Rng,
): T[] {
  return shouldShuffle ? shuffle(items, rng) : items;
}
