"use client";

import {
  AlertCircle,
  Banknote,
  Check,
  Copy,
  CreditCard,
  Landmark,
  Loader2,
  Smartphone,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { PAYMENT_STATUS } from "@/constants/payments";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/payments";

export type PaymentMethodStatus = "idle" | "pending" | "paid" | "rejected";

export interface MethodState {
  stripe: PaymentMethodStatus;
  mbway: PaymentMethodStatus;
  cash: PaymentMethodStatus;
  transfer: PaymentMethodStatus;
}

export function useMethodMeta(): Record<
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

export function StatusPill({ status }: { status: PaymentMethodStatus }) {
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
      {status === PAYMENT_STATUS.PAID && <Check size={9} strokeWidth={3} />}
      {status === PAYMENT_STATUS.PENDING && (
        <Loader2 size={9} className="animate-spin" />
      )}
      {status === PAYMENT_STATUS.REJECTED && <AlertCircle size={9} />}
      {s.label}
    </span>
  );
}

export function CopyButton({ value }: { value: string }) {
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
