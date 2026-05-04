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
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PaymentMethod, TeamPaymentConfig } from "@/types/payments";

// ── Method metadata ───────────────────────────────────────────────────────────

const METHOD_META: Record<
  PaymentMethod,
  {
    label: string;
    description: string;
    icon: React.ElementType;
    accent: string;
  }
> = {
  stripe: {
    label: "Cartão",
    description: "Débito ou crédito — pagamento imediato",
    icon: CreditCard,
    accent: "#6366f1",
  },
  mbway: {
    label: "MBWay",
    description: "Transferência pelo telemóvel",
    icon: Smartphone,
    accent: "#ef4444",
  },
  cash: {
    label: "Dinheiro",
    description: "Paga presencialmente",
    icon: Banknote,
    accent: "#22c55e",
  },
};

export type PaymentMethodStatus = "idle" | "pending" | "paid" | "rejected";

interface MethodState {
  stripe: PaymentMethodStatus;
  mbway: PaymentMethodStatus;
  cash: PaymentMethodStatus;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: PaymentMethodStatus }) {
  if (status === "idle") return null;
  const map = {
    pending: {
      label: "A aguardar",
      cls: "text-arena-info bg-arena-info/10 border-arena-info/30",
    },
    paid: {
      label: "Pago",
      cls: "text-arena-success bg-arena-success/10 border-arena-success/30",
    },
    rejected: {
      label: "Recusado",
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
      aria-label="Copiar"
    >
      {copied ? (
        <Check size={12} className="text-arena-success" strokeWidth={2.5} />
      ) : (
        <Copy size={12} />
      )}
      {copied ? "Copiado!" : "Copiar"}
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
  const amount = `${(amountCents / 100).toFixed(2).replace(".", ",")} ${currency}`;
  const isPaid = status === "paid";

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] text-arena-text-muted">
        Paga com cartão de forma imediata e segura via Stripe.
      </p>
      {isPaid ? (
        <div className="flex items-center gap-2 rounded-[10px] border border-arena-success/30 bg-arena-success/10 px-3 py-2.5">
          <Check size={14} className="text-arena-success" strokeWidth={2.5} />
          <span className="text-[12px] font-semibold text-arena-success">
            Pagamento confirmado — {amount}
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
              Pagar {amount}
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
  const amount = `${(amountCents / 100).toFixed(2).replace(".", ",")} ${currency}`;

  return (
    <div className="flex flex-col gap-3">
      {config.phone && (
        <div className="rounded-[10px] border border-arena-border bg-arena-bg-sec/60 p-3">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-arena-text-muted">
            Envia para
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
            <span className="text-[11px] text-arena-text-muted">Valor</span>
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
            Comprovativo recebido — a verificar
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
              Enviei o pagamento
            </>
          )}
        </button>
      )}

      {status === "pending" && (
        <p className="text-center text-[11px] text-arena-text-muted">
          A aguardar confirmação do capitão
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
  const amount = `${(amountCents / 100).toFixed(2).replace(".", ",")} ${currency}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-[10px] border border-arena-border bg-arena-bg-sec/60 px-3 py-3">
        <p className="text-[12px] text-arena-text-sec">
          {config.instructions ?? "Paga ao capitão no início do jogo."}
        </p>
        <p className="mt-2 text-[11px] text-arena-text-muted">
          Valor: <strong className="text-arena-text">{amount}</strong>
        </p>
      </div>

      {status === "paid" ? (
        <div className="flex items-center gap-2 rounded-[10px] border border-arena-success/30 bg-arena-success/10 px-3 py-2.5">
          <Check size={14} className="text-arena-success" strokeWidth={2.5} />
          <span className="text-[12px] font-semibold text-arena-success">
            Marcado como pago pelo capitão
          </span>
        </div>
      ) : status === "pending" ? (
        <div className="flex items-center gap-2 rounded-[10px] border border-arena-info/30 bg-arena-info/10 px-3 py-2.5">
          <Loader2 size={14} className="animate-spin text-arena-info" />
          <span className="text-[12px] font-semibold text-arena-info">
            A aguardar confirmação do capitão
          </span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onConfirmIntent}
          className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[12px] border border-arena-success/40 bg-arena-success/10 text-[13px] font-bold text-arena-success transition-all hover:bg-arena-success/15"
        >
          <Banknote size={15} />
          Vou pagar em dinheiro
        </button>
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
}

export function PaymentMethodCard({
  config,
  amountCents,
  currency = "EUR",
  initialStatus,
  onStripeCheckout,
  onMbwayProof,
  onCashIntent,
}: PaymentMethodCardProps) {
  const enabledMethods: PaymentMethod[] = (
    ["stripe", "mbway", "cash"] as PaymentMethod[]
  ).filter(m => config[m].enabled);

  const [expanded, setExpanded] = useState<PaymentMethod | null>(
    enabledMethods[0] ?? null,
  );

  const [status, setStatus] = useState<MethodState>({
    stripe: initialStatus?.stripe ?? "idle",
    mbway: initialStatus?.mbway ?? "idle",
    cash: initialStatus?.cash ?? "idle",
  });

  if (enabledMethods.length === 0) {
    return (
      <div className="rounded-[14px] border border-arena-border bg-arena-surface p-4 text-center text-[13px] text-arena-text-muted">
        Nenhum método de pagamento configurado pelo capitão.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-[16px] border border-arena-border bg-arena-surface">
      <div className="border-b border-arena-border px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-arena-text-muted">
          Como queres pagar?
        </p>
      </div>

      {enabledMethods.map((method, idx) => {
        const meta = METHOD_META[method];
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
