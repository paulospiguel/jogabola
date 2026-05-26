"use client";

import { CheckIcon } from "@animateicons/react/lucide";
import { useTranslations } from "next-intl";
import { PaymentMethodCard } from "@/components/arena/payment-method-card";
import type { TeamPaymentConfig } from "@/types/payments";

interface RsvpPaymentStepProps {
  amountCents: number;
  currency: string;
  paymentConfig: TeamPaymentConfig;
  onCashIntent: () => Promise<void>;
  onMbwayProof: () => Promise<void>;
  onTransferProof: () => Promise<void>;
  onPayLater: () => void;
}

export function RsvpPaymentStep({
  amountCents,
  currency,
  paymentConfig,
  onCashIntent,
  onMbwayProof,
  onTransferProof,
  onPayLater,
}: RsvpPaymentStepProps) {
  const t = useTranslations("athleteRsvp");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 rounded-[12px] border border-arena-primary/20 bg-arena-primary/5 p-3.5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-arena-primary text-arena-bg">
            <CheckIcon size={14} color="currentColor" />
          </div>
          <p className="text-[13px] font-bold text-arena-text">
            {t("paymentReservedTitle")}
          </p>
        </div>
        <p className="text-[12px] text-arena-text-muted">
          {t("paymentReservedSubtitle")}
        </p>
      </div>

      <PaymentMethodCard
        config={paymentConfig}
        amountCents={amountCents}
        currency={currency}
        onCashIntent={onCashIntent}
        onMbwayProof={onMbwayProof}
        onTransferProof={onTransferProof}
      />

      <button
        type="button"
        onClick={onPayLater}
        className="mt-2 text-center text-[12px] font-bold text-arena-text-muted hover:text-arena-text"
      >
        {t("payLater")}
      </button>
    </div>
  );
}
