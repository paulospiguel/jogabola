import { formatMinute } from "./format";
import type { Match } from "./types";
import { score } from "./use-match-store";

export interface SharedResult {
  t: "jogo" | "treino";
  a: { n: string; c: string };
  b: { n: string; c: string };
  sa: number;
  sb: number;
  /** goals: [side, minute, scorer, assist?] */
  g: Array<[string, number, string, string?]>;
  /** cards: [side, minute, player, color] */
  k: Array<[string, number, string, string]>;
}

function b64urlEncode(str: string): string {
  const b64 =
    typeof window === "undefined"
      ? Buffer.from(str, "utf-8").toString("base64")
      : window.btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): string {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  return typeof window === "undefined"
    ? Buffer.from(b64, "base64").toString("utf-8")
    : decodeURIComponent(escape(window.atob(b64)));
}

function nameOf(
  match: Match,
  side: "A" | "B",
  id: string,
  fallback: string,
): string {
  return match.teams[side].players.find(p => p.id === id)?.name ?? fallback;
}

export function buildSharedResult(match: Match): SharedResult {
  const s = score(match);
  const g: SharedResult["g"] = [];
  const k: SharedResult["k"] = [];
  for (const e of [...match.events].sort((x, y) => x.atSec - y.atSec)) {
    if (e.type === "goal") {
      g.push([
        e.team,
        Math.floor(e.atSec / 60),
        nameOf(match, e.team, e.playerId, "Golo"),
        e.assistId ? nameOf(match, e.team, e.assistId, "") : undefined,
      ]);
    } else {
      k.push([
        e.team,
        Math.floor(e.atSec / 60),
        nameOf(match, e.team, e.playerId, "—"),
        e.card ?? "yellow",
      ]);
    }
  }
  return {
    t: match.type,
    a: { n: match.teams.A.name, c: match.teams.A.color },
    b: { n: match.teams.B.name, c: match.teams.B.color },
    sa: s.A,
    sb: s.B,
    g,
    k,
  };
}

export function encodeResult(match: Match): string {
  return b64urlEncode(JSON.stringify(buildSharedResult(match)));
}

export function decodeResult(data: string): SharedResult | null {
  try {
    return JSON.parse(b64urlDecode(data)) as SharedResult;
  } catch {
    return null;
  }
}

export function resultText(match: Match): string {
  const r = buildSharedResult(match);
  const lines = [`${r.a.n} ${r.sa} - ${r.sb} ${r.b.n}`];
  for (const [side, min, name] of r.g) {
    const team = side === "A" ? r.a.n : r.b.n;
    lines.push(`⚽ ${formatMinute(min * 60)} ${name} (${team})`);
  }
  lines.push("via jogabola.app/timer");
  return lines.join("\n");
}

export function resultOgTitle(r: SharedResult): string {
  return `${r.a.n} ${r.sa}–${r.sb} ${r.b.n} · JogaBola`;
}

export function resultOgDescription(r: SharedResult): string {
  const base =
    "Resultado registado ao vivo com o Cronómetro JogaBola — sem login.";
  if (r.g.length === 0) return base;
  const plural = r.g.length === 1 ? "golo" : "golos";
  return `${r.g.length} ${plural} · ${base}`;
}
