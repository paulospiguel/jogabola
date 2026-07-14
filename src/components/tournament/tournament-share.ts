import { computeStandings, computeTopScorers } from "./standings";
import type { Tournament } from "./types";

export interface TournamentSharedResult {
  name: string;
  teams: Array<{ id: string; n: string; c: string }>;
  s: Array<[teamId: string, points: number, gf: number, ga: number]>;
  top: Array<[name: string, goals: number]>;
}

const MAX_SHARE_LENGTH = 8192;
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;
const TEAM_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof window === "undefined") {
    return Buffer.from(bytes).toString("base64");
  }

  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 32_768) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32_768));
  }
  return window.btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  if (typeof window === "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }

  const binary = window.atob(base64);
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

function base64UrlEncode(value: string): string {
  const base64 = bytesToBase64(new TextEncoder().encode(value));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): string {
  const unpadded = value.replace(/-/g, "+").replace(/_/g, "/");
  const base64 = unpadded.padEnd(Math.ceil(unpadded.length / 4) * 4, "=");

  return new TextDecoder("utf-8", { fatal: true }).decode(
    base64ToBytes(base64),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBoundedString(value: unknown, maxLength: number): value is string {
  return (
    typeof value === "string" && value.length > 0 && value.length <= maxLength
  );
}

function isNonnegativeInteger(value: unknown): value is number {
  return (
    Number.isFinite(value) && Number.isInteger(value) && Number(value) >= 0
  );
}

function isTournamentSharedResult(
  value: unknown,
): value is TournamentSharedResult {
  if (
    !isRecord(value) ||
    !isBoundedString(value.name, 120) ||
    !Array.isArray(value.teams) ||
    value.teams.length < 1 ||
    value.teams.length > 6 ||
    !Array.isArray(value.s) ||
    value.s.length !== value.teams.length ||
    !Array.isArray(value.top)
  ) {
    return false;
  }

  const teamIds = new Set<string>();
  for (const team of value.teams) {
    if (
      !isRecord(team) ||
      !isBoundedString(team.id, 120) ||
      !isBoundedString(team.n, 80) ||
      typeof team.c !== "string" ||
      !TEAM_COLOR_PATTERN.test(team.c) ||
      teamIds.has(team.id)
    ) {
      return false;
    }
    teamIds.add(team.id);
  }

  const standingIds = new Set<string>();
  for (const standing of value.s) {
    if (
      !Array.isArray(standing) ||
      standing.length !== 4 ||
      typeof standing[0] !== "string" ||
      !teamIds.has(standing[0]) ||
      standingIds.has(standing[0]) ||
      !isNonnegativeInteger(standing[1]) ||
      !isNonnegativeInteger(standing[2]) ||
      !isNonnegativeInteger(standing[3])
    ) {
      return false;
    }
    standingIds.add(standing[0]);
  }

  const topGoals = value.top[0]?.[1];
  return value.top.every(
    scorer =>
      Array.isArray(scorer) &&
      scorer.length === 2 &&
      isBoundedString(scorer[0], 80) &&
      Number.isFinite(scorer[1]) &&
      Number.isInteger(scorer[1]) &&
      Number(scorer[1]) > 0 &&
      scorer[1] === topGoals,
  );
}

function isCanonicalPayload(data: string): boolean {
  return (
    data.length > 0 &&
    data.length <= MAX_SHARE_LENGTH &&
    BASE64URL_PATTERN.test(data) &&
    data.length % 4 !== 1
  );
}

export function buildTournamentSharedResult(
  tournament: Tournament,
): TournamentSharedResult {
  const scorers = computeTopScorers(tournament);
  const maxGoals = scorers[0]?.goals ?? 0;

  return {
    name: tournament.name ?? "Torneio",
    teams: tournament.teams.map(team => ({
      id: team.id,
      n: team.name,
      c: team.color,
    })),
    s: computeStandings(tournament).map(standing => [
      standing.teamId,
      standing.points,
      standing.gf,
      standing.ga,
    ]),
    top:
      maxGoals > 0
        ? scorers
            .filter(scorer => scorer.goals === maxGoals)
            .map(scorer => [scorer.name, scorer.goals])
        : [],
  };
}

export function encodeTournamentResult(tournament: Tournament): string {
  const result = buildTournamentSharedResult(tournament);
  if (!isTournamentSharedResult(result)) {
    throw new RangeError("Tournament result payload is invalid for sharing");
  }

  const encoded = base64UrlEncode(JSON.stringify(result));
  if (encoded.length > MAX_SHARE_LENGTH) {
    throw new RangeError("Tournament result payload exceeds share limit");
  }

  return encoded;
}

export function decodeTournamentResult(
  data: string,
): TournamentSharedResult | null {
  if (!isCanonicalPayload(data)) {
    return null;
  }

  try {
    const decoded = base64UrlDecode(data);
    if (base64UrlEncode(decoded) !== data) {
      return null;
    }

    const result: unknown = JSON.parse(decoded);
    return isTournamentSharedResult(result) ? result : null;
  } catch {
    return null;
  }
}

export function tournamentOgTitle(result: TournamentSharedResult): string {
  const name = isBoundedString(result?.name, 120) ? result.name : "Torneio";
  const championId = Array.isArray(result?.s) ? result.s[0]?.[0] : undefined;
  const champion = Array.isArray(result?.teams)
    ? result.teams.find(team => team?.id === championId)?.n
    : undefined;

  return champion
    ? `${champion} venceu o ${name} · JogaBola`
    : `${name} · JogaBola`;
}

export function tournamentOgDescription(
  result: TournamentSharedResult,
): string {
  const teamCount = Array.isArray(result?.teams) ? result.teams.length : 0;
  const top = Array.isArray(result?.top) ? result.top : [];
  const base = `${teamCount} equipas · Torneio registado com o Cronómetro JogaBola — sem login.`;
  const goals = top[0]?.[1];
  if (!goals) {
    return base;
  }

  const names = top.map(([name]) => name).join(", ");
  const plural = goals === 1 ? "golo" : "golos";
  return `Artilheiro: ${names} (${goals} ${plural}) · ${base}`;
}
