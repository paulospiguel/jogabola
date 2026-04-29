export type PaymentStatus =
  | "pending"
  | "paid_auto"
  | "paid_unverified"
  | "review_required"
  | "approved"
  | "rejected"
  | "refunded";

export type PaymentMethod = "manual_mbway" | "stripe" | "paypal";

export type AiPaymentCheck = {
  decision: "likely_valid" | "needs_review" | "likely_invalid";
  confidence: number;
  extractedAmount?: number;
  extractedDate?: string;
  extractedRecipient?: string;
  riskFlags: string[];
};
