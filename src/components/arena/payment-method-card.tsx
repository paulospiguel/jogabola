"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PaymentMethod, TeamPaymentConfig } from "@/types/payments";
import {
  CashMethodCard,
  MbwayMethodCard,
  StripeMethodCard,
  TransferMethodCard,
} from "./payment-method-cards";
import {
  StatusPill,
  useMethodMeta,
} from "./payment-method-shared";
import type { MethodState, PaymentMethodStatus } from "./payment-method-shared";

export type { PaymentMethodStatus };

interface PaymentMethodCardProps {
  config: TeamPaymentConfig;
  amountCents: number;
  currency?: string;
  initialStatus?: Partial<MethodState>;
  onStripeCheckout?: () => void;
  onMbwayProof?: () => void;
  onCashIntent?: () => void;
  onTransferProof?: () => void;
}

export function PaymentMethodCard({
  config,
  amountCents,
  currency = "EUR",
  initialStatus,
  onStripeCheckout,
  onMbwayProof,
  onCashIntent,
  onTransferProof,
}: PaymentMethodCardProps) {
  const t = useTranslations("athleteRsvp.paymentMethodCard");
  const methodMeta = useMethodMeta();

  const enabledMethods: PaymentMethod[] = (
    ["stripe", "mbway", "transfer", "cash"] as PaymentMethod[]
  ).filter(m => config[m]?.enabled);

  const [expanded, setExpanded] = useState<PaymentMethod | null>(
    enabledMethods[0] ?? null,
  );

  const [status, setStatus] = useState<MethodState>({
    stripe: initialStatus?.stripe ?? "idle",
    mbway: initialStatus?.mbway ?? "idle",
    cash: initialStatus?.cash ?? "idle",
    transfer: initialStatus?.transfer ?? "idle",
  });

  if (enabledMethods.length === 0) {
    return (
      <div className="rounded-[14px] border border-arena-border bg-arena-surface p-4 text-center text-[13px] text-arena-text-muted">
        {t("noMethods")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-[16px] border border-arena-border bg-arena-surface">
      <div className="border-b border-arena-border px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-arena-text-muted">
          {t("title")}
        </p>
      </div>

      {enabledMethods.map((method, idx) => {
        const meta = methodMeta[method];
        const Icon = meta.icon;
        const isOpen = expanded === method;
        const s = status[method];
        const isLast = idx === enabledMethods.length - 1;

        return (
          <div
            key={method}
            className={cn(!isLast && "border-b border-arena-border")}
          >
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : method)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-arena-surface-el"
            >
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border"
                style={{
                  backgroundColor: `${meta.accent}18`,
                  borderColor: `${meta.accent}30`,
                  color: meta.accent,
                }}
              >
                <Icon size={17} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-arena-text">
                    {meta.label}
                  </span>
                  <StatusPill status={s} />
                </div>
                {!isOpen && (
                  <p className="text-[11px] text-arena-text-muted">
                    {meta.description}
                  </p>
                )}
              </div>
              <ChevronRight
                size={15}
                className={cn(
                  "shrink-0 text-arena-text-muted transition-transform",
                  isOpen && "rotate-90",
                )}
              />
            </button>

            {isOpen && (
              <div className="border-t border-arena-border bg-arena-bg-sec/40 px-4 pb-4 pt-3">
                {method === "stripe" && (
                  <StripeMethodCard
                    status={s}
                    amountCents={amountCents}
                    currency={currency}
                    onPay={() => {
                      setStatus(prev => ({ ...prev, stripe: "pending" }));
                      onStripeCheckout?.();
                    }}
                  />
                )}
                {method === "mbway" && (
                  <MbwayMethodCard
                    status={s}
                    config={config.mbway}
                    amountCents={amountCents}
                    currency={currency}
                    onProofSubmit={() => {
                      setStatus(prev => ({ ...prev, mbway: "pending" }));
                      onMbwayProof?.();
                    }}
                  />
                )}
                {method === "cash" && (
                  <CashMethodCard
                    status={s}
                    config={config.cash}
                    amountCents={amountCents}
                    currency={currency}
                    onConfirmIntent={() => {
                      setStatus(prev => ({ ...prev, cash: "pending" }));
                      onCashIntent?.();
                    }}
                  />
                )}
                {method === "transfer" && (
                  <TransferMethodCard
                    status={s}
                    config={config.transfer}
                    amountCents={amountCents}
                    currency={currency}
                    onProofSubmit={() => {
                      setStatus(prev => ({ ...prev, transfer: "pending" }));
                      onTransferProof?.();
                    }}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
