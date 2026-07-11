"use client";

import {
  Banknote,
  Check,
  CreditCard,
  ExternalLink,
  Landmark,
  Loader2,
  Smartphone,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { PAYMENT_STATUS } from "@/constants/payments";
import type { TeamPaymentConfig } from "@/types/payments";
import type { PaymentMethodStatus } from "./payment-method-shared";
import { CopyButton } from "./payment-method-shared";

function formatIban(iban: string): string {
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  const parts = [];
  for (let i = 0; i < clean.length; i += 4) {
    parts.push(clean.substring(i, i + 4));
  }
  return parts.join(" ");
}

export function StripeMethodCard({
  status,
  amountCents,
  currency,
  onPay,
}: {
  status: PaymentMethodStatus;
  amountCents: number;
  currency: string;
  onPay: () => void;
}) {
  const t = useTranslations("athleteRsvp.paymentMethodCard");
  const amount = `${(amountCents / 100).toFixed(2).replace(".", ",")} ${currency}`;
  const isPaid = status === PAYMENT_STATUS.PAID;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] text-arena-text-muted">
        {t("methods.stripe.info")}
      </p>
      {isPaid ? (
        <div className="flex items-center gap-2 rounded-[10px] border border-arena-success/30 bg-arena-success/10 px-3 py-2.5">
          <Check size={14} className="text-arena-success" strokeWidth={2.5} />
          <span className="text-[12px] font-semibold text-arena-success">
            {t("methods.stripe.confirmMsg", { amount })}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onPay}
          disabled={status === PAYMENT_STATUS.PENDING}
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#6366f1] text-[13px] font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all hover:bg-[#5457e8] disabled:opacity-60"
        >
          {status === PAYMENT_STATUS.PENDING ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <CreditCard size={15} />
              {t("actions.pay", { amount })}
              <ExternalLink size={13} className="opacity-70" />
            </>
          )}
        </button>
      )}
    </div>
  );
}

export function MbwayMethodCard({
  status,
  config,
  amountCents,
  currency,
  onProofSubmit,
}: {
  status: PaymentMethodStatus;
  config: TeamPaymentConfig["mbway"];
  amountCents: number;
  currency: string;
  onProofSubmit: () => void;
}) {
  const t = useTranslations("athleteRsvp.paymentMethodCard");
  const amount = `${(amountCents / 100).toFixed(2).replace(".", ",")} ${currency}`;

  return (
    <div className="flex flex-col gap-3">
      {config.phone && (
        <div className="rounded-[10px] border border-arena-border bg-arena-bg-sec/60 p-3">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
            {t("methods.mbway.sendTo")}
          </p>
          <div className="flex items-center justify-between gap-2">
            <div>
              {config.name && (
                <p className="text-[12px] font-semibold text-arena-text">
                  {config.name}
                </p>
              )}
              <p className="font-mono text-[15px] font-bold text-arena-primary">
                {config.phone}
              </p>
            </div>
            <CopyButton value={config.phone} />
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-arena-border pt-2">
            <span className="text-[11px] text-arena-text-muted">
              {t("methods.mbway.amount")}
            </span>
            <span className="text-[13px] font-bold text-arena-text">
              {amount}
            </span>
          </div>
        </div>
      )}

      {status === PAYMENT_STATUS.PAID ? (
        <div className="flex items-center gap-2 rounded-[10px] border border-arena-success/30 bg-arena-success/10 px-3 py-2.5">
          <Check size={14} className="text-arena-success" strokeWidth={2.5} />
          <span className="text-[12px] font-semibold text-arena-success">
            {t("methods.mbway.proofMsg")}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onProofSubmit}
          disabled={status === PAYMENT_STATUS.PENDING}
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] border border-[#ef4444]/40 bg-[#ef4444]/10 text-[13px] font-bold text-[#ef4444] transition-all hover:bg-[#ef4444]/15 disabled:opacity-60"
        >
          {status === PAYMENT_STATUS.PENDING ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Smartphone size={15} />
              {t("actions.sent")}
            </>
          )}
        </button>
      )}

      {status === PAYMENT_STATUS.PENDING && (
        <p className="text-center text-[11px] text-arena-text-muted">
          {t("methods.mbway.waitingMsg")}
        </p>
      )}
    </div>
  );
}

export function CashMethodCard({
  status,
  config,
  amountCents,
  currency,
  onConfirmIntent,
}: {
  status: PaymentMethodStatus;
  config: TeamPaymentConfig["cash"];
  amountCents: number;
  currency: string;
  onConfirmIntent: () => void;
}) {
  const t = useTranslations("athleteRsvp.paymentMethodCard");
  const amount = `${(amountCents / 100).toFixed(2).replace(".", ",")} ${currency}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-[10px] border border-arena-border bg-arena-bg-sec/60 px-3 py-3">
        <p className="text-[12px] text-arena-text-sec">
          {config.instructions ?? t("methods.cash.defaultInstructions")}
        </p>
        <p className="mt-2 text-[11px] text-arena-text-muted">
          {t("methods.cash.amount")}:{" "}
          <strong className="text-arena-text">{amount}</strong>
        </p>
      </div>

      {status === PAYMENT_STATUS.PAID ? (
        <div className="flex items-center gap-2 rounded-[10px] border border-arena-success/30 bg-arena-success/10 px-3 py-2.5">
          <Check size={14} className="text-arena-success" strokeWidth={2.5} />
          <span className="text-[12px] font-semibold text-arena-success">
            {t("methods.cash.paidMsg")}
          </span>
        </div>
      ) : status === PAYMENT_STATUS.PENDING ? (
        <div className="flex items-center gap-2 rounded-[10px] border border-arena-info/30 bg-arena-info/10 px-3 py-2.5">
          <Loader2 size={14} className="animate-spin text-arena-info" />
          <span className="text-[12px] font-semibold text-arena-info">
            {t("methods.mbway.waitingMsg")}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onConfirmIntent}
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] border border-arena-success/40 bg-arena-success/10 text-[13px] font-bold text-arena-success transition-all hover:bg-arena-success/15"
        >
          <Banknote size={15} />
          {t("actions.willPayCash")}
        </button>
      )}
    </div>
  );
}

export function TransferMethodCard({
  status,
  config,
  amountCents,
  currency,
  onProofSubmit,
}: {
  status: PaymentMethodStatus;
  config: TeamPaymentConfig["transfer"];
  amountCents: number;
  currency: string;
  onProofSubmit: () => void;
}) {
  const t = useTranslations("athleteRsvp.paymentMethodCard");
  const amount = `${(amountCents / 100).toFixed(2).replace(".", ",")} ${currency}`;
  const formattedIban = config.iban ? formatIban(config.iban) : "";

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-[10px] border border-arena-border bg-arena-bg-sec/60 p-3">
        {config.name && (
          <div className="mb-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
              {t("methods.transfer.holder")}
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] font-semibold text-arena-text">
                {config.name}
              </span>
              <CopyButton value={config.name} />
            </div>
          </div>
        )}

        {config.iban && (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
              {t("methods.transfer.iban")}
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[13px] font-bold text-arena-primary break-all">
                {formattedIban}
              </span>
              <CopyButton value={config.iban} />
            </div>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-arena-border pt-2">
          <span className="text-[11px] text-arena-text-muted">
            {t("methods.mbway.amount")}
          </span>
          <span className="text-[13px] font-bold text-arena-text">
            {amount}
          </span>
        </div>
      </div>

      {status === PAYMENT_STATUS.PAID ? (
        <div className="flex items-center gap-2 rounded-[10px] border border-arena-success/30 bg-arena-success/10 px-3 py-2.5">
          <Check size={14} className="text-arena-success" strokeWidth={2.5} />
          <span className="text-[12px] font-semibold text-arena-success">
            {t("methods.transfer.proofMsg")}
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onProofSubmit}
          disabled={status === PAYMENT_STATUS.PENDING}
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] border border-arena-primary/40 bg-arena-primary/10 text-[13px] font-bold text-arena-primary transition-all hover:bg-arena-primary/15 disabled:opacity-60 press"
        >
          {status === PAYMENT_STATUS.PENDING ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Landmark size={15} />
              {t("actions.sent")}
            </>
          )}
        </button>
      )}

      {status === PAYMENT_STATUS.PENDING && (
        <p className="text-center text-[11px] text-arena-text-muted">
          {t("methods.transfer.waitingMsg")}
        </p>
      )}
    </div>
  );
}
