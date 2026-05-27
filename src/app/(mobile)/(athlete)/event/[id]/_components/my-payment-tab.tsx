"use client";

import { Check, Clock, Info, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMyPaymentForEvent } from "@/hooks/use-my-payment-for-event";
import { PAYMENT_STATUS } from "@/constants/payments";
import { cn } from "@/lib/utils";

interface MyPaymentTabProps {
  eventId: number;
}

type StatusConfig = {
  Icon: typeof Check | typeof Clock | typeof X;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
  titleKey:
    | "paid.title"
    | "paid_unverified.title"
    | "failed.title"
    | "pending.title";
  captionKey:
    | "paid.caption"
    | "paid_unverified.caption"
    | "failed.caption"
    | "pending.caption";
};

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case "paid":
    case "approved":
      return {
        Icon: Check,
        iconBg: "bg-arena-success/15",
        iconColor: "text-arena-success",
        iconBorder: "border-arena-success/30",
        titleKey: "paid.title",
        captionKey: "paid.caption",
      };
    case "paid_unverified":
      return {
        Icon: Clock,
        iconBg: "bg-arena-warning/15",
        iconColor: "text-arena-warning",
        iconBorder: "border-arena-warning/30",
        titleKey: "paid_unverified.title",
        captionKey: "paid_unverified.caption",
      };
    case "failed":
    case "rejected":
    case "refunded":
      return {
        Icon: X,
        iconBg: "bg-arena-danger/15",
        iconColor: "text-arena-danger",
        iconBorder: "border-arena-danger/30",
        titleKey: "failed.title",
        captionKey: "failed.caption",
      };
    default:
      return {
        Icon: Clock,
        iconBg: "bg-arena-warning/15",
        iconColor: "text-arena-warning",
        iconBorder: "border-arena-warning/30",
        titleKey: "pending.title",
        captionKey: "pending.caption",
      };
  }
}

function formatCurrency(amountCents: number, currency: string) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: currency || "EUR",
  }).format(amountCents / 100);
}

function formatMethod(
  method: string,
  t: ReturnType<typeof useTranslations<"paymentResult">>,
) {
  if (method === "mbway") return t("methods.mbway");
  if (method === "cash") return t("methods.cash");
  if (method === "stripe") return t("methods.stripe");
  return t("methods.unknown");
}

export function MyPaymentTab({ eventId }: MyPaymentTabProps) {
  const t = useTranslations("paymentResult");
  const { payment, isLoading, error } = useMyPaymentForEvent(eventId);

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center text-arena-text-muted text-sm px-4 py-4">
        A carregar...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-32 items-center justify-center text-arena-danger text-sm px-4 py-4">
        {error instanceof Error
          ? error.message
          : t("loadError")}
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-arena-surface border border-arena-border mb-3 text-arena-text-muted">
          <Info size={24} />
        </div>
        <p className="text-[14px] font-semibold text-arena-text">
          Ainda não pagaste
        </p>
        <p className="text-[13px] text-arena-text-muted mt-1">
          Confirma a presença e escolhe o método de pagamento para garantir a
          tua vaga.
        </p>
      </div>
    );
  }

  const status = payment.status ?? "pending";
  const { Icon, iconBg, iconColor, iconBorder, titleKey, captionKey } =
    getStatusConfig(status);
  const formattedCurrency = formatCurrency(
    payment.amountCents,
    payment.currency,
  );

  return (
    <div className="px-4 py-6">
      <div className="flex flex-col items-center gap-5">
        {/* Status icon */}
        <div
          className={cn(
            "flex size-20 items-center justify-center rounded-full border-2",
            iconBg,
            iconBorder,
          )}
        >
          <Icon size={36} className={iconColor} strokeWidth={2.5} />
        </div>

        {/* Text block */}
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h2 className="font-sora text-[20px] font-bold leading-tight text-arena-text">
            {t(titleKey)}
          </h2>
          {t(captionKey) && (
            <p className="text-[13px] text-arena-text-muted max-w-[280px]">
              {t(captionKey)}
            </p>
          )}
        </div>

        {/* Detail card */}
        <div className="w-full mt-2 rounded-[16px] border border-arena-border bg-arena-surface px-4 py-1">
          <div className="flex items-center justify-between py-2.5 border-b border-arena-border">
            <span className="text-[13px] text-arena-text-muted">
              {t("details.method")}
            </span>
            <span className="text-[13px] font-semibold text-arena-text">
              {formatMethod(payment.method, t)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5 border-b border-arena-border">
            <span className="text-[13px] text-arena-text-muted">
              {t("details.date")}
            </span>
            <span className="text-[13px] font-semibold text-arena-text">
              {payment.createdAt
                ? new Date(payment.createdAt).toLocaleDateString("pt-PT")
                : "—"}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2.5 pt-3">
            <span className="text-[13px] font-bold text-arena-text">
              {t("details.total")}
            </span>
            <span
              className={cn(
                "text-[16px] font-bold",
                status === "paid" || status === PAYMENT_STATUS.APPROVED
                  ? "text-arena-primary"
                  : "text-arena-warning",
              )}
            >
              {formattedCurrency}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
