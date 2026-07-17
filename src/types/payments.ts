export type { PaymentStatus } from "@/constants/payments";

export type PaymentMethod = "stripe" | "mbway" | "cash" | "transfer";

export type AiPaymentCheck = {
  decision: "likely_valid" | "needs_review" | "likely_invalid";
  confidence: number;
  extractedAmount?: number;
  extractedDate?: string;
  extractedRecipient?: string;
  riskFlags: string[];
};

export interface TeamPaymentConfig {
  stripe: {
    enabled: boolean;
    accountId?: string;
  };
  mbway: {
    enabled: boolean;
    phone?: string;
    name?: string;
  };
  cash: {
    enabled: boolean;
    instructions?: string;
  };
  transfer: {
    enabled: boolean;
    iban?: string;
    name?: string;
  };
}

export const DEFAULT_PAYMENT_CONFIG: TeamPaymentConfig = {
  stripe: { enabled: false },
  mbway: { enabled: false },
  cash: { enabled: true, instructions: "Paga ao capitão no início do jogo." },
  transfer: { enabled: false },
};
