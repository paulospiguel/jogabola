"use client";

import { ArrowLeft, Check, Clock, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePayment } from "@/hooks/use-payments";
import { cn } from "@/lib/utils";

interface PaymentResultClientProps {
  paymentId: number;
  eventId: number;
}

function formatMethod(method: string, t: ReturnType<typeof useTranslations<"paymentResult">>) {
  if (method === "mbway") return t("methods.mbway");
  if (method === "cash") return t("methods.cash");
  if (method === "stripe") return t("methods.stripe");
  return t("methods.unknown");
}

function formatCurrency(amountCents: number, currency: string) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: currency || "EUR",
  }).format(amountCents / 100);
}

type StatusConfig = {
  Icon: typeof Check | typeof Clock | typeof X;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
  titleKey: "paid.title" | "paid_unverified.title" | "failed.title" | "pending.title";
  captionKey: "paid.caption" | "paid_unverified.caption" | "failed.caption" | "pending.caption";
};

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case "paid":
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

export function PaymentResultClient({ paymentId, eventId }: PaymentResultClientProps) {
  const t = useTranslations("paymentResult");
  const { payment, isLoading, error } = usePayment(paymentId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-arena-bg flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-2 border-arena-primary/30 border-t-arena-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-arena-bg flex flex-col items-center justify-center px-5 gap-4">
        <p className="text-arena-text-muted text-sm text-center">
          {error instanceof Error ? error.message : t("loadError")}
        </p>
        <Link
          href={`/event/${eventId}`}
          className="flex items-center gap-1.5 text-arena-primary text-sm font-medium"
        >
          <ArrowLeft size={16} />
          {t("backToEvent")}
        </Link>
      </div>
    );
  }

  const status = payment.status ?? "pending";
  const { Icon, iconBg, iconColor, iconBorder, titleKey, captionKey } = getStatusConfig(status);
  const formattedCurrency = formatCurrency(payment.amountCents, payment.currency);

  return (
    <div className="min-h-screen bg-arena-bg flex flex-col max-w-[480px] mx-auto w-full">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <Link
          href={`/event/${eventId}`}
          className="flex items-center gap-1.5 text-arena-text-muted hover:text-arena-text text-sm transition-colors"
        >
          <ArrowLeft size={16} />
          {t("backToEvent")}
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-5 py-8">
        {/* Status icon */}
        <div
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center border-2",
            iconBg,
            iconBorder
          )}
        >
          <Icon size={44} className={iconColor} strokeWidth={2.5} />
        </div>

        {/* Text block */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-sora text-[22px] font-bold text-arena-text leading-tight">
            {t(titleKey)}
          </h1>
          <p className="text-[14px] text-arena-text-sec">
            {formattedCurrency} · {payment.eventTitle}
          </p>
          {t(captionKey) && (
            <p className="text-[13px] text-arena-text-muted mt-0.5">
              {t(captionKey)}
            </p>
          )}
        </div>

        {/* Detail card */}
        <div className="w-full bg-arena-surface border border-arena-border rounded-[16px] px-4 py-1">
          {/* De */}
          <div className="flex items-center justify-between py-2.5 border-b border-arena-border">
            <span className="text-[13px] text-arena-text-muted">{t("details.from")}</span>
            <span className="text-[13px] font-semibold text-arena-text">
              {payment.payerName ?? "—"}
            </span>
          </div>

          {/* Para */}
          <div className="flex items-center justify-between py-2.5 border-b border-arena-border">
            <span className="text-[13px] text-arena-text-muted">{t("details.to")}</span>
            <span className="text-[13px] font-semibold text-arena-text">{payment.teamName}</span>
          </div>

          {/* Método */}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-[13px] text-arena-text-muted">{t("details.method")}</span>
            <span className="text-[13px] font-semibold text-arena-text">
              {formatMethod(payment.method, t)}
            </span>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between pt-3 border-t border-arena-border pb-2.5">
            <span className="text-[13px] font-bold text-arena-text">{t("details.total")}</span>
            <span
              className={cn(
                "text-[16px] font-bold",
                status === "paid" ? "text-arena-primary" : "text-arena-warning"
              )}
            >
              {formattedCurrency}
            </span>
          </div>
        </div>

        {/* Back CTA */}
        <Link
          href={`/event/${eventId}`}
          className="w-full bg-arena-primary text-[#0B0F14] font-semibold text-[15px] py-3.5 rounded-[12px] text-center font-sora transition-opacity active:opacity-80"
        >
          {t("backToEvent")}
        </Link>
      </div>
    </div>
  );
}
