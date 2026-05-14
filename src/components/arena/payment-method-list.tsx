"use client";

import { Banknote, ChevronRight, CreditCard, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type PaymentMethodType = "stripe" | "mbway" | "cash";

export interface PaymentMethodConfig {
  type: PaymentMethodType;
  enabled: boolean;
  summary?: string;
}

interface PaymentMethodListProps {
  methods: PaymentMethodConfig[];
  onMethodClick: (type: PaymentMethodType) => void;
  onToggle: (type: PaymentMethodType, enabled: boolean) => void;
}

export function PaymentMethodList({
  methods,
  onMethodClick,
  onToggle,
}: PaymentMethodListProps) {
  const t = useTranslations("arenaPayments.settings");

  const meta: Record<
    PaymentMethodType,
    {
      labelKey: string;
      descKey: string;
      icon: React.ElementType;
      color: string;
    }
  > = {
    stripe: {
      labelKey: "stripe.title",
      descKey: "stripe.description",
      icon: CreditCard,
      color: "#6366f1",
    },
    mbway: {
      labelKey: "mbway.title",
      descKey: "mbway.description",
      icon: Smartphone,
      color: "#ef4444",
    },
    cash: {
      labelKey: "cash.title",
      descKey: "cash.description",
      icon: Banknote,
      color: "#22c55e",
    },
  };

  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-arena-text-muted">
        {t("methods")}
      </p>

      {methods.map(m => {
        const mData = meta[m.type];
        const Icon = mData.icon;

        return (
          <div
            key={m.type}
            className={cn(
              "flex items-center gap-3 rounded-[12px] border p-3.5 transition-all",
              m.enabled
                ? "border-opacity-40 bg-opacity-10"
                : "border-arena-border bg-arena-surface",
            )}
            style={
              m.enabled
                ? {
                  borderColor: `${mData.color}50`,
                  backgroundColor: `${mData.color}08`,
                }
                : {}
            }
          >
            {/* Icon */}
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-[9px] border"
              style={{
                backgroundColor: `${mData.color}15`,
                borderColor: `${mData.color}30`,
                color: mData.color,
              }}
            >
              <Icon size={17} />
            </div>

            {/* Info — click to open detail */}
            <button
              type="button"
              className="flex flex-1 min-w-0 flex-col text-left"
              onClick={() => onMethodClick(m.type)}
            >
              <p className="text-[13px] font-bold text-arena-text">
                {t(mData.labelKey)}
              </p>
              <p className="truncate text-[11px] text-arena-text-muted">
                {m.enabled && m.summary ? m.summary : t(mData.descKey)}
              </p>
            </button>

            {/* Configure chevron */}
            {m.enabled && (
              <button
                type="button"
                onClick={() => onMethodClick(m.type)}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg text-arena-text-muted transition-colors hover:text-arena-text"
              >
                <ChevronRight size={15} />
              </button>
            )}

            {/* Toggle */}
            <button
              type="button"
              onClick={() => onToggle(m.type, !m.enabled)}
              className={cn(
                "relative ml-1 h-5 w-9 shrink-0 rounded-full transition-colors duration-200",
                m.enabled ? "bg-arena-primary" : "bg-arena-border",
              )}
              aria-label={m.enabled ? t("inactive") : t("active")}
            >
              <div
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all duration-200",
                  m.enabled ? "left-[18px]" : "left-0.5",
                )}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
