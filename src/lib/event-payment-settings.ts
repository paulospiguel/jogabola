/**
 * Payment-settings payload written as a side effect of the event form.
 *
 * The form only edits MB WAY (on/off and, optionally, the phone). Every other
 * method keeps its stored on/off state, and detail fields the form did not
 * supply are left out so the stored values are kept. Stripe account ids are
 * never carried forward from a read (they are masked or wiped after a
 * transfer — see ADR 0006).
 */
export function buildEventFormPaymentSettings(
  teamId: number,
  existing:
    | {
        cashEnabled?: boolean | null;
        stripeEnabled?: boolean | null;
        transferEnabled?: boolean | null;
      }
    | null
    | undefined,
  form: { mbwayEnabled: boolean; mbwayPhone?: string },
) {
  const phone = form.mbwayPhone?.trim();
  return {
    teamId,
    mbwayEnabled: form.mbwayEnabled,
    ...(phone ? { mbwayPhone: phone } : {}),
    cashEnabled: existing?.cashEnabled ?? true,
    stripeEnabled: existing?.stripeEnabled ?? false,
    transferEnabled: existing?.transferEnabled ?? false,
  };
}
