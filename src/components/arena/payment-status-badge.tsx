"use client";

import { AlertTriangle, Banknote, CircleDollarSign, Clock, CreditCard, Hourglass, Smartphone, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { PAYMENT_STATUS } from "@/constants/payments";
import { cn } from "@/lib/utils";
import type { PaymentMethod, PaymentStatus } from "@/types/payments";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
  method?: PaymentMethod | string;
  /** Show full detail (for self / manager view). Others see rejected as "pending". */
  canViewRejected?: boolean;
  className?: string;
}

const METHOD_ICONS: Record<string, React.ElementType> = {
  stripe: CreditCard,
  mbway: Smartphone,
  cash: Banknote,
  transfer: Banknote,
  other: CreditCard,
};

export function PaymentStatusBadge({
  status,
  method,
  canViewRejected = false,
  className,
}: PaymentStatusBadgeProps) {
  const t = useTranslations("payment");

  // Hide rejected/refunded from other participants
  const effectiveStatus =
    !canViewRejected &&
    (status === PAYMENT_STATUS.REJECTED || status === PAYMENT_STATUS.REFUNDED)
      ? PAYMENT_STATUS.PENDING
      : status;

  const MethodIcon = method ? (METHOD_ICONS[method] ?? CreditCard) : null;
  const statusLabel = t(`statusBadge.${effectiveStatus}`);

  return (
    <div
      className={cn("flex items-center gap-1.5", className)}
      title={statusLabel}
    >
      {/* Status Badge Icon */}
      {effectiveStatus === PAYMENT_STATUS.APPROVED && (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-arena-success/30 bg-arena-success/15 text-arena-success shadow-[0_0_12px_rgba(76,175,80,0.15)] transition-transform hover:scale-105">
          <CircleDollarSign size={13} strokeWidth={2.5} />
        </div>
      )}

      {effectiveStatus === PAYMENT_STATUS.PAID_UNVERIFIED && (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)] animate-pulse">
          <Hourglass size={12} strokeWidth={2.5} />
        </div>
      )}

      {effectiveStatus === PAYMENT_STATUS.PENDING && (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-arena-border bg-arena-surface-el text-arena-text-muted/60">
          <Clock size={12} strokeWidth={2} />
        </div>
      )}

      {effectiveStatus === PAYMENT_STATUS.REVIEW_REQUIRED && (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-arena-warning/30 bg-arena-warning/15 text-arena-warning animate-pulse">
          <AlertTriangle size={12} strokeWidth={2} />
        </div>
      )}

      {(effectiveStatus === PAYMENT_STATUS.REJECTED || effectiveStatus === PAYMENT_STATUS.REFUNDED) && (
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-arena-danger/25 bg-arena-danger/10 text-arena-danger">
          <X size={12} strokeWidth={2.5} />
        </div>
      )}

      {/* Method icon — only when paid or verifying */}
      {(effectiveStatus === PAYMENT_STATUS.APPROVED || effectiveStatus === PAYMENT_STATUS.PAID_UNVERIFIED) && MethodIcon && (
        <MethodIcon size={12} className="text-arena-text-muted transition-colors hover:text-arena-text" />
      )}
    </div>
  );
}

