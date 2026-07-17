import type { TeamPaymentConfig } from "@/types/payments";

type PublicTeamPaymentSettings = {
  stripeEnabled: boolean;
  stripeAccountId: string | null;
  mbwayEnabled: boolean;
  mbwayPhone: string | null;
  mbwayName: string | null;
  cashEnabled: boolean;
  cashInstructions: string | null;
  transferEnabled: boolean;
  transferIban: string | null;
  transferName: string | null;
};

interface BuildRsvpPaymentConfigParams {
  cashAllowed: boolean;
  cashInstructions: string;
  settings?: PublicTeamPaymentSettings | null;
}

export function buildRsvpPaymentConfig({
  cashAllowed,
  cashInstructions,
  settings,
}: BuildRsvpPaymentConfigParams): TeamPaymentConfig {
  if (!settings) {
    return {
      stripe: { enabled: false },
      mbway: { enabled: false },
      cash: { enabled: cashAllowed, instructions: cashInstructions },
      transfer: { enabled: false },
    };
  }

  return {
    stripe: {
      enabled: settings.stripeEnabled,
      accountId: settings.stripeAccountId ?? undefined,
    },
    mbway: {
      enabled: settings.mbwayEnabled,
      phone: settings.mbwayPhone ?? undefined,
      name: settings.mbwayName ?? undefined,
    },
    cash: {
      enabled: settings.cashEnabled && cashAllowed,
      instructions: settings.cashInstructions ?? undefined,
    },
    transfer: {
      enabled: settings.transferEnabled,
      iban: settings.transferIban ?? undefined,
      name: settings.transferName ?? undefined,
    },
  };
}
