"use client";

import {
  Banknote,
  ChevronRight,
  Clock,
  CreditCard,
  Landmark,
  Settings2,
  Smartphone,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { type BadgeStatus, JbBadge } from "@/components/arena/jb-badge";
import { JbUserMenu } from "@/components/arena/jb-user-menu";
import { PaymentSettingsSheet } from "@/components/arena/payment-settings-sheet";
import { VerifiedBadge } from "@/components/arena/verified-badge";
import { type Payment, usePayments } from "@/hooks/use-payments";
import { useTeamPaymentSettings } from "@/hooks/use-team-payment-settings";
import { useTeams } from "@/hooks/use-teams";
import type { PaymentMethod } from "@/types/payments";

const METHOD_META: Record<
  PaymentMethod,
  { label: string; icon: React.ElementType; color: string }
> = {
  stripe: { label: "Stripe", icon: CreditCard, color: "#6366f1" },
  mbway: { label: "MBWay", icon: Smartphone, color: "#ef4444" },
  cash: { label: "Numerário", icon: Banknote, color: "#22c55e" },
  transfer: { label: "Transferência", icon: Landmark, color: "#06b6d4" },
};

function MethodBadge({ method }: { method: string }) {
  const t = useTranslations("arenaPayments.methods");
  const meta: Record<
    PaymentMethod,
    { labelKey: string; icon: React.ElementType; color: string }
  > = {
    stripe: { labelKey: "stripe", icon: CreditCard, color: "#6366f1" },
    mbway: { labelKey: "mbway", icon: Smartphone, color: "#ef4444" },
    cash: { labelKey: "cash", icon: Banknote, color: "#22c55e" },
    transfer: { labelKey: "transfer", icon: Landmark, color: "#06b6d4" },
  };

  const data = meta[method as PaymentMethod];
  if (!data)
    return <span className="text-[11px] text-arena-text-muted">{method}</span>;
  const Icon = data.icon;
  return (
    <span className="flex items-center gap-1" style={{ color: data.color }}>
      <Icon size={11} />
      <span className="text-[11px] font-semibold">{t(data.labelKey)}</span>
    </span>
  );
}

export default function PaymentsPage() {
  const t = useTranslations("arenaPayments");
  const { payments, isLoading } = usePayments();
  const { activeTeamId } = useTeams();
  const { settings, refetch } = useTeamPaymentSettings(
    activeTeamId ?? undefined,
  );
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="jb-page">
      <div className="jb-page-inner">
        {/* Header */}
        <header className="jb-topbar">
          <div>
            <div className="jb-kicker">{t("kicker")}</div>
            <div className="flex items-center gap-2.5">
              <Wallet className="size-6 text-arena-primary" />
              <h1 className="jb-title">{t("title")}</h1>
            </div>
            <p className="mt-0.5 text-[12px] text-arena-text-muted">
              {t("titleSub")}
            </p>
          </div>
          <JbUserMenu onlyAvatar className="hidden md:block" />
        </header>

        {/* Methods config card */}
        <section className="jb-card overflow-hidden p-0">
          <div className="flex flex-col gap-3 border-arena-border border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-arena-text-muted">
              {t("settings.methods")}
            </span>
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              className="inline-flex w-fit items-center gap-1.5 rounded-[8px] border border-arena-border bg-arena-surface-el px-3 py-1.5 text-[11px] font-bold text-arena-text-sec transition-colors hover:border-arena-primary/40 hover:text-arena-primary"
            >
              <Settings2 size={12} />
              {t("configureBtn")}
            </button>
          </div>

          <div className="grid divide-y divide-arena-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {/* MBWay */}
            <div className="flex flex-1 flex-col gap-1.5 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <Smartphone size={13} style={{ color: "#ef4444" }} />
                <span className="text-[11px] font-bold text-arena-text">
                  {t("settings.mbway.title")}
                </span>
                {settings?.mbwayEnabled ? (
                  <span className="rounded-full bg-arena-success/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-arena-success">
                    {t("settings.active")}
                  </span>
                ) : (
                  <span className="rounded-full bg-arena-border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-arena-text-muted">
                    {t("settings.inactive")}
                  </span>
                )}
              </div>
              {settings?.mbwayEnabled && settings.mbwayPhone ? (
                <p className="font-mono text-[12px] text-arena-text-sec">
                  {settings.mbwayPhone}
                </p>
              ) : (
                <p className="text-[11px] text-arena-text-muted">
                  {settings?.mbwayEnabled ? t("settings.noNumber") : t("settings.notConfigured")}
                </p>
              )}
            </div>

            {/* Cash */}
            <div className="flex flex-1 flex-col gap-1.5 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <Banknote size={13} style={{ color: "#22c55e" }} />
                <span className="text-[11px] font-bold text-arena-text">
                  {t("settings.cash.title")}
                </span>
                {settings?.cashEnabled !== false ? (
                  <span className="rounded-full bg-arena-success/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-arena-success">
                    {t("settings.active")}
                  </span>
                ) : (
                  <span className="rounded-full bg-arena-border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-arena-text-muted">
                    {t("settings.inactive")}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-arena-text-muted">
                {t("methods.cashSub")}
              </p>
            </div>

            {/* Stripe — em breve */}
            <div className="flex flex-1 flex-col gap-1.5 px-4 py-3 opacity-50">
              <div className="flex items-center gap-1.5">
                <CreditCard size={13} style={{ color: "#6366f1" }} />
                <span className="text-[11px] font-bold text-arena-text">
                  {t("settings.stripe.title")}
                </span>
                <span className="flex items-center gap-0.5 rounded-full bg-arena-info/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-arena-info">
                  <Clock size={8} />
                  {t("settings.soon")}
                </span>
              </div>
              <p className="text-[11px] text-arena-text-muted">
                {t("methods.creditCard")}
              </p>
            </div>
          </div>
        </section>

        {/* Payments list */}
        <section className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-arena-text-muted">
              {t("table.title")}
            </h2>
          </div>

          <div className="grid gap-3">
            {isLoading ? (
              <div className="jb-card flex items-center justify-center p-12 text-arena-text-muted">
                <span className="animate-pulse">{t("loading")}</span>
              </div>
            ) : payments.length === 0 ? (
              <div className="jb-card flex flex-col items-center justify-center gap-2 p-12 text-center">
                <Wallet size={28} className="text-arena-text-muted/40" />
                <p className="text-[13px] text-arena-text-muted">
                  {t("noPayments")}
                </p>
              </div>
            ) : (
              payments.map((payment: Payment) => (
                <Link
                  key={payment.id}
                  href={`/arena/payments/${payment.id}`}
                  className="jb-card group relative overflow-hidden transition-all hover:border-arena-primary/30"
                >
                  <div className="flex flex-col gap-2.5 p-3 sm:p-4">
                    {/* Header: avatar + info + chevron */}
                    <div className="flex min-w-0 items-center gap-3">
                      <JbAvatar
                        id={payment.player.id}
                        name={payment.player.name}
                        size={40}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span className="truncate text-[13px] font-bold text-arena-text transition-colors group-hover:text-arena-primary">
                            {payment.player.name}
                          </span>
                          <VerifiedBadge
                            verified={payment.player.isVerified}
                            variant="icon"
                          />
                        </div>
                        <div className="flex min-w-0 items-center gap-1.5 text-xs text-arena-text-muted">
                          <MethodBadge method={payment.method} />
                          <span className="text-arena-border">·</span>
                          <span className="min-w-0 truncate text-[11px]">
                            {payment.event.title}
                          </span>
                        </div>
                      </div>
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-arena-surface-el text-arena-text-muted transition-all group-hover:bg-arena-primary group-hover:text-arena-bg">
                        <ChevronRight size={15} />
                      </div>
                    </div>

                    {/* Stats row: always 3 equal columns */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="flex min-w-0 flex-col gap-1 rounded-[10px] border border-arena-border/60 bg-arena-bg/25 px-2 py-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-arena-text-muted">
                          {t("table.status")}
                        </span>
                        <JbBadge
                          status={payment.status as BadgeStatus}
                          size="sm"
                          animate
                        />
                      </div>

                      <div className="flex min-w-0 flex-col gap-1 rounded-[10px] border border-arena-border/60 bg-arena-bg/25 px-2 py-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-arena-text-muted">
                          {t("table.risk")}
                        </span>
                        <JbBadge status={payment.score as BadgeStatus} size="sm" />
                      </div>

                      <div className="flex min-w-0 flex-col gap-1 overflow-hidden rounded-[10px] border border-arena-border/60 bg-arena-bg/25 px-2 py-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-arena-text-muted">
                          {t("table.amount")}
                        </span>
                        <span className="text-base font-black text-arena-primary">
                          {payment.amount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-arena-primary/0 via-arena-primary/5 to-arena-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      {showSettings && activeTeamId && (
        <PaymentSettingsSheet
          teamId={activeTeamId}
          initial={
            settings
              ? {
                stripeEnabled: settings.stripeEnabled,
                mbwayEnabled: settings.mbwayEnabled,
                mbwayPhone: settings.mbwayPhone ?? undefined,
                mbwayName: settings.mbwayName ?? undefined,
                cashEnabled: settings.cashEnabled,
                cashInstructions: settings.cashInstructions ?? undefined,
              }
              : undefined
          }
          onClose={() => setShowSettings(false)}
          onSaved={() => refetch()}
        />
      )}
    </div>
  );
}
