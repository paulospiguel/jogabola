import { encodeTournamentResult } from "./tournament-share";
import type { Tournament } from "./types";

// QR byte mode at error-correction level L tops out near 2953 bytes. Keep
// enough margin for renderer/version differences while retaining useful links.
const MAX_TOURNAMENT_QR_BYTES = 2800;

export type TournamentShareUrlResult =
  | { ok: true; url: string }
  | { ok: false };

export function buildTournamentShareUrl(
  origin: string,
  tournament: Tournament,
): TournamentShareUrlResult {
  try {
    const encoded = encodeTournamentResult(tournament);
    const url = new URL("/timer/tournament/resultado", origin);
    url.searchParams.set("d", encoded);
    return { ok: true, url: url.toString() };
  } catch {
    return { ok: false };
  }
}

export function canRenderTournamentQr(url: string): boolean {
  return (
    url.length > 0 &&
    new TextEncoder().encode(url).byteLength <= MAX_TOURNAMENT_QR_BYTES
  );
}
