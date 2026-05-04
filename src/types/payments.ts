export type PaymentStatus =
  | "pending"
  | "paid_unverified"
  | "review_required"
  | "approved"
  | "rejected"
  | "refunded";

export type PaymentMethod = "stripe" | "mbway" | "cash";

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
}

export const DEFAULT_PAYMENT_CONFIG: TeamPaymentConfig = {
  stripe: { enabled: false },
  mbway: { enabled: false },
  cash: { enabled: true, instructions: "Paga ao capitão no início do jogo." },
};
