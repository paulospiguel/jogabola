/**
 * Payout reconfiguration after an ownership transfer (ADR 0006).
 *
 * Accepting a transfer sets `payout_reconfigure_required_at`. While it is set
 * the previous owner's MB WAY / IBAN / Stripe details stay stored but are
 * never returned to clients, online methods read as disabled, and only the
 * new owner can turn MB WAY or bank transfer back on, by entering fresh
 * details. Stripe stays off: there is no in-app Connect flow to obtain a new
 * account id. The owner's first save with fresh details clears the flag and
 * deletes every stale detail that save did not replace (always the Stripe
 * account), so the old owner's data can never be unmasked or re-enabled.
 *
 * Pure and framework-free so it can be unit-tested and shared.
 */

interface PayoutFields {
  stripeEnabled: boolean;
  stripeAccountId: string | null;
  mbwayEnabled: boolean;
  mbwayPhone: string | null;
  mbwayName: string | null;
  transferEnabled: boolean;
  transferIban: string | null;
  transferName: string | null;
  payoutReconfigureRequiredAt: Date | null;
}

export type MaskedPayoutSettings<T> = T & {
  /** True until the new owner enters fresh payout details. */
  payoutReconfigureRequired: boolean;
};

/** Masks payout details while the team still needs reconfiguring. */
export function maskPayoutSettings<T extends PayoutFields>(
  settings: T | null | undefined,
): MaskedPayoutSettings<T> | null {
  if (!settings) return null;
  if (!settings.payoutReconfigureRequiredAt) {
    return { ...settings, payoutReconfigureRequired: false };
  }
  return {
    ...settings,
    stripeEnabled: false,
    stripeAccountId: null,
    mbwayEnabled: false,
    mbwayPhone: null,
    mbwayName: null,
    transferEnabled: false,
    transferIban: null,
    transferName: null,
    payoutReconfigureRequired: true,
  };
}

/**
 * Fields of an upsert payload this rule looks at; others pass through.
 * `null` detail values only appear in the decision output (stale wipe).
 */
export interface PayoutPayload {
  stripeEnabled?: boolean;
  stripeAccountId?: string | null;
  mbwayEnabled?: boolean;
  mbwayPhone?: string | null;
  mbwayName?: string | null;
  transferEnabled?: boolean;
  transferIban?: string | null;
  transferName?: string | null;
}

type PayoutKey = keyof PayoutPayload;

/** The input payload with the payout fields widened to accept the wipe. */
export type DecidedPayload<P> = Omit<P, PayoutKey> & PayoutPayload;

const DETAIL_FIELDS = [
  "stripeAccountId",
  "mbwayPhone",
  "mbwayName",
  "transferIban",
  "transferName",
] as const;

const filled = (value: string | null | undefined) =>
  typeof value === "string" && value.trim().length > 0;

export type PayoutDecision<P> =
  | { allowed: false }
  | { allowed: true; clearFlag: boolean; payload: P | DecidedPayload<P> };

/**
 * Decides whether a payment-settings write may go through while flagged and
 * what it may write. Empty detail fields are dropped so the stored (stale)
 * values are kept rather than wiped; Stripe account ids are always dropped.
 */
export function decidePayoutUpdate<P extends PayoutPayload>(input: {
  flagged: boolean;
  isOwner: boolean;
  payload: P;
}): PayoutDecision<P> {
  const { flagged, isOwner, payload } = input;
  if (!flagged) return { allowed: true, clearFlag: false, payload };

  const freshMbway = filled(payload.mbwayPhone) && filled(payload.mbwayName);
  const freshTransfer =
    filled(payload.transferIban) && filled(payload.transferName);
  const typedDetails = DETAIL_FIELDS.some(field => filled(payload[field]));

  if (payload.stripeEnabled === true) return { allowed: false };
  if (!isOwner) {
    if (payload.mbwayEnabled === true || payload.transferEnabled === true) {
      return { allowed: false };
    }
    if (typedDetails) return { allowed: false };
  } else {
    if (payload.mbwayEnabled === true && !freshMbway) return { allowed: false };
    if (payload.transferEnabled === true && !freshTransfer) {
      return { allowed: false };
    }
  }

  const sanitized: DecidedPayload<P> = { ...payload };
  for (const field of DETAIL_FIELDS) {
    if (field === "stripeAccountId" || !filled(sanitized[field])) {
      delete sanitized[field];
    }
  }

  const clearFlag = isOwner && (freshMbway || freshTransfer);
  if (clearFlag) {
    // Unmasking must never expose the old owner's data: delete whatever
    // this save did not replace. Stripe always goes (no Connect flow).
    Object.assign(sanitized, { stripeEnabled: false, stripeAccountId: null });
    if (!freshMbway) {
      Object.assign(sanitized, {
        mbwayEnabled: false,
        mbwayPhone: null,
        mbwayName: null,
      });
    }
    if (!freshTransfer) {
      Object.assign(sanitized, {
        transferEnabled: false,
        transferIban: null,
        transferName: null,
      });
    }
  }

  return { allowed: true, clearFlag, payload: sanitized };
}
