"use client";

import {
  AlertCircle,
  Banknote,
  Check,
  ChevronRight,
  Copy,
  CreditCard,
  ExternalLink,
  Loader2,
  Smartphone,
  Landmark,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PaymentMethod, TeamPaymentConfig } from "@/types/payments";

// ── Method metadata ───────────────────────────────────────────────────────────

function useMethodMeta(): Record<
  PaymentMethod,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    accent: string;
  }
> {
  const t = useTranslations("athleteRsvp.paymentMethodCard");
  return {
    stripe: {
      label: t("methods.stripe.label"),
      description: t("methods.stripe.desc"),
      icon: CreditCard,
      accent: "#6366f1",
    },
    mbway: {
      label: t("methods.mbway.label"),
      description: t("methods.mbway.desc"),
      icon: Smartphone,
      accent: "#ef4444",
    },
    cash: {
      label: t("methods.cash.label"),
      description: t("methods.cash.desc"),
      icon: Banknote,
      accent: "#22c55e",
    },
    transfer: {
      label: t("methods.transfer.label"),
      description: t("methods.transfer.desc"),
      icon: Landmark,
      accent: "#06b6d4",
    },
  };
}

export type PaymentMethodStatus = "idle" | "pending" | "paid" | "rejected";

interface MethodState {
  stripe: PaymentMethodStatus;
  mbway: PaymentMethodStatus;
  cash: PaymentMethodStatus;
  transfer: PaymentMethodStatus;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: PaymentMethodStatus }) {
  const t = useTranslations("athleteRsvp.paymentMethodCard");
  if (status === "idle") return null;
  const map = {
    pending: {
      label: t("status.pending"),
      cls: "text-arena-info bg-arena-info/10 border-arena-info/30",
    },
    paid: {
      label: t("status.paid"),
      cls: "text-arena-success bg-arena-success/10 border-arena-success/30",
    },
    rejected: {
      label: t("status.rejected"),
      cls: "text-arena-danger bg-arena-danger/10 border-arena-danger/30",
    },
  } as const;
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        s.cls,
      )}
    >
      {status === "paid" && <Check size={9} strokeWidth={3} />}
      {status === "pending" && <Loader2 size={9} className="animate-spin" />}
      {status === "rejected" && <AlertCircle size={9} />}
      {s.label}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const t = useTranslations("athleteRsvp.paymentMethodCard");
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex h-8 items-center gap-1.5 rounded-[8px] border border-arena-border bg-arena-surface-el px-3 text-[11px] font-semibold text-arena-text-sec transition-colors hover:border-arena-primary/30 hover:text-arena-primary"
      aria-label={t("copy")}
    >
      {copied ? (
        <Check size={12} className="text-arena-success" strokeWidth={2.5} />
      ) : (
        <Copy size={12} />
      )}
      {copied ? t("copied") : t("copy")}
    </button>
  );
}

// ── Method cards ──────────────────────────────────────────────────────────────

function StripeMethodCard({
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
  const isPaid = status === "paid";

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
          disabled={status === "pending"}
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] bg-[#6366f1] text-[13px] font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all hover:bg-[#5457e8] disabled:opacity-60"
        >
          {status === "pending" ? (
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

function MbwayMethodCard({
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

      {status === "paid" ? (
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
          disabled={status === "pending"}
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] border border-[#ef4444]/40 bg-[#ef4444]/10 text-[13px] font-bold text-[#ef4444] transition-all hover:bg-[#ef4444]/15 disabled:opacity-60"
        >
          {status === "pending" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Smartphone size={15} />
              {t("actions.sent")}
            </>
          )}
        </button>
      )}

      {status === "pending" && (
        <p className="text-center text-[11px] text-arena-text-muted">
          {t("methods.mbway.waitingMsg")}
        </p>
      )}
    </div>
  );
}

function CashMethodCard({
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

      {status === "paid" ? (
        <div className="flex items-center gap-2 rounded-[10px] border border-arena-success/30 bg-arena-success/10 px-3 py-2.5">
          <Check size={14} className="text-arena-success" strokeWidth={2.5} />
          <span className="text-[12px] font-semibold text-arena-success">
            {t("methods.cash.paidMsg")}
          </span>
        </div>
      ) : status === "pending" ? (
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

function formatIban(iban: string) {
  const clean = iban.replace(/\s+/g, "").toUpperCase();
  const parts = [];
  for (let i = 0; i < clean.length; i += 4) {
    parts.push(clean.substring(i, i + 4));
  }
  return parts.join(" ");
}

function TransferMethodCard({
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

      {status === "paid" ? (
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
          disabled={status === "pending"}
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] border border-arena-primary/40 bg-arena-primary/10 text-[13px] font-bold text-arena-primary transition-all hover:bg-arena-primary/15 disabled:opacity-60 press"
        >
          {status === "pending" ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Landmark size={15} />
              {t("actions.sent")}
            </>
          )}
        </button>
      )}

      {status === "pending" && (
        <p className="text-center text-[11px] text-arena-text-muted">
          {t("methods.transfer.waitingMsg")}
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

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
            {/* Method header / toggle */}
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

            {/* Method body */}
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
