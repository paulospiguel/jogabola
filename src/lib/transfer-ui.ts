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
  "RECIPIENT_NOT_ELIGIBLE",
  "EMAIL_SEND_FAILED",
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

/** Codes where the link was opened with the wrong (or unverified) account. */
const SWITCH_ACCOUNT_CODES = new Set([
  "TRANSFER_NOT_FOR_YOU",
  "EMAIL_NOT_VERIFIED",
]);

/** Whether the landing should offer "sign in with another account". */
export function canSwitchAccount(code: string): boolean {
  return SWITCH_ACCOUNT_CODES.has(code);
}

/**
 * Request payload and toast label for the chosen mode: the member picked in
 * member mode, otherwise the typed email (even if a member was picked
 * before switching modes).
 */
export function resolveRequestRecipient(
  mode: "member" | "email",
  selected: TransferCandidate | null,
  email: string,
):
  | { payload: { toUserId: string }; label: string }
  | { payload: { toEmail: string }; label: string } {
  if (mode === "member" && selected) {
    return { payload: { toUserId: selected.userId }, label: selected.name };
  }
  const toEmail = email.trim();
  return { payload: { toEmail }, label: toEmail };
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
