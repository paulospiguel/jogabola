"use client";

import { Banknote, Clock, CreditCard, Smartphone, X } from "lucide-react";
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
  // Hide rejected/refunded from other participants
  const effectiveStatus =
    !canViewRejected && (status === "rejected" || status === "refunded")
      ? "pending"
      : status;

  const isPaid =
    effectiveStatus === "approved" || effectiveStatus === "paid_unverified";
  const isReview = effectiveStatus === "review_required";
  const isRejected =
    effectiveStatus === "rejected" || effectiveStatus === "refunded";
  const isPending = effectiveStatus === "pending";

  const MethodIcon = method ? (METHOD_ICONS[method] ?? CreditCard) : null;

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      title={STATUS_LABEL[effectiveStatus]}
    >
      {/* Status dot */}
      <div
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full",
          isPaid && "bg-arena-success/20",
          isReview && "bg-amber-500/20",
          isRejected && "bg-arena-danger/20",
          isPending && "bg-arena-text-muted/15",
        )}
      >
        {isPaid && (
          <div className="size-2.5 rounded-full bg-arena-success" />
        )}
        {isReview && (
          <Clock size={10} className="text-amber-500" />
        )}
        {isRejected && (
          <X size={10} className="text-arena-danger" />
        )}
        {isPending && (
          <div className="size-2 rounded-full bg-arena-text-muted/50" />
        )}
      </div>

      {/* Method icon — only when paid */}
      {isPaid && MethodIcon && (
        <MethodIcon
          size={12}
          className="text-arena-text-muted"
        />
      )}
    </div>
  );
}

const STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: "Pagamento pendente",
  paid_unverified: "Pagamento em validação",
  review_required: "Pagamento em revisão",
  approved: "Pagamento aprovado",
  rejected: "Pagamento rejeitado",
  refunded: "Pagamento reembolsado",
};
