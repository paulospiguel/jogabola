import type { PendingTransfer } from "@/actions/team-transfer.actions";

/**
 * Client-safe presentation helpers for team ownership transfer. These only
 * decide what to show; every transfer action is authorized server-side.
 */

/** react-query key for the caller's incoming transfer requests. */
export const INCOMING_TRANSFERS_QUERY_KEY = ["incoming-transfers"] as const;

const TRANSFER_ERROR_CODES = new Set([
  "FORBIDDEN",
  "TEAM_NAME_MISMATCH",
  "TRANSFER_ALREADY_PENDING",
  "TRANSFER_NOT_FOUND",
  "TRANSFER_EXPIRED",
  "TRANSFER_NOT_FOR_YOU",
  "EMAIL_NOT_VERIFIED",
  "TEAM_LIMIT_REACHED",
  "CANNOT_TRANSFER_TO_SELF",
  "RECIPIENT_NOT_MEMBER",
  "TEAM_NOT_FOUND",
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
]);

/** Maps a transfer action error code to a `teamTransfer.errors.*` key. */
export function transferErrorKey(code: string | undefined): string {
  return code && TRANSFER_ERROR_CODES.has(code)
    ? `errors.${code}`
    : "errors.UNKNOWN";
}

/**
 * Mirrors the server check: the typed name, trimmed, must equal the team
 * name exactly (case-sensitive).
 */
export function teamNameMatches(typed: string, teamName: string): boolean {
  return teamName.length > 0 && typed.trim() === teamName;
}

export interface TransferCandidate {
  userId: string;
  name: string;
  image: string | null;
}

/** Owner-only data behind the "Transferir equipa" entry. */
export interface OwnerTransferData {
  teamName: string;
  candidates: TransferCandidate[];
  initialPending: PendingTransfer | null;
}

/**
 * Possible recipients: registered roster athletes ∪ staff, without the
 * owner, deduplicated by user and sorted by name.
 */
export function buildTransferCandidates(
  roster: readonly TransferCandidate[],
  staff: readonly TransferCandidate[],
  selfId: string,
): TransferCandidate[] {
  const byId = new Map<string, TransferCandidate>();
  for (const candidate of [...staff, ...roster]) {
    if (candidate.userId === selfId || byId.has(candidate.userId)) continue;
    byId.set(candidate.userId, candidate);
  }
  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/** Basic shape check so the submit stays disabled for obvious typos. */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
