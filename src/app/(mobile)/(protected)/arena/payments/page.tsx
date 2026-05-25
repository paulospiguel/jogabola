"use client";

import {
  AlertCircle,
  Banknote,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  FileText,
  Landmark,
  Settings2,
  Smartphone,
  Sparkles,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { JbAvatar } from "@/components/arena/avatar";
import { ArenaEmptyState } from "@/components/arena/empty-state";
import { MetricCard } from "@/components/arena/metric-card";
import { PaymentSettingsSheet } from "@/components/arena/payment-settings-sheet";
import { ProofReviewSheet } from "@/components/arena/proof-review-sheet";
import { VerifiedBadge } from "@/components/arena/verified-badge";
import { ButtonGroup } from "@/components/ui/button-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PAYMENT_OVERVIEW_STATUS,
  type PaymentOverviewStatus,
} from "@/constants/payments";
import { type Payment, usePayments } from "@/hooks/use-payments";
import { useTeamPaymentSettings } from "@/hooks/use-team-payment-settings";
import { useTeams } from "@/hooks/use-teams";
import { cn } from "@/lib/utils";

export default function PaymentsPage() {
  const t = useTranslations("arenaPayments");
  const badgeT = useTranslations("arenaBadges");
  const { payments, isLoading, refetch } = usePayments();
  const { activeTeamId } = useTeams();
  const { settings, refetch: refetchSettings } = useTeamPaymentSettings(
    activeTeamId ?? undefined,
  );

  const [activeTab, setActiveTab] = useState<"payments" | "methods" | "iapro">(
    "payments",
  );
  const [activeFilter, setActiveFilter] = useState<
    "all" | PaymentOverviewStatus
  >("all");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProofPayment, setSelectedProofPayment] =
    useState<Payment | null>(null);

  // Helper to parse amount strings like "€5.00" to Float
  const parseAmount = (amountStr: string) => {
    const cleaned = amountStr.replace(/[^\d,.-]/g, "").replace(",", ".");
    return parseFloat(cleaned) || 0;
  };

  // 1. Dynamic volume calculations
  const totalReceived = payments
    .filter(p => p.status === PAYMENT_OVERVIEW_STATUS.CONFIRMED)
    .reduce((sum, p) => sum + parseAmount(p.amount), 0);

  const totalExpected = payments.reduce(
    (sum, p) => sum + parseAmount(p.amount),
    0,
  );

  // Status counts for Metric Cards
  const validatingCount = payments.filter(
    p => p.status === PAYMENT_OVERVIEW_STATUS.VALIDATING,
  ).length;
  const pendingCount = payments.filter(
    p => p.status === PAYMENT_OVERVIEW_STATUS.PENDING,
  ).length;
  const confirmedCount = payments.filter(
    p => p.status === PAYMENT_OVERVIEW_STATUS.CONFIRMED,
  ).length;

  // Filter payments
  const filteredPayments = payments.filter(p => {
    if (activeFilter === "all") return true;
    return p.status === activeFilter;
  });

  // Get active methods count and info
  const activeMethodsList = [];
  if (settings?.mbwayEnabled) {
    activeMethodsList.push({
      type: "mbway",
      title: t("settings.mbway.title"),
      icon: Smartphone,
      color: "#ef4444",
      detail: settings.mbwayPhone || t("settings.noNumber"),
      status: "active",
    });
  }
  if (settings?.transferEnabled) {
    const cleanIban = settings.transferIban
      ? settings.transferIban.replace(/\s+/g, "").toUpperCase()
      : "";
    const formattedIban = cleanIban
      ? cleanIban.replace(/(.{4})/g, "$1 ").trim()
      : "";
    activeMethodsList.push({
      type: "transfer",
      title: t("settings.transfer.title"),
      icon: Landmark,
      color: "#06b6d4",
      detail: formattedIban || t("settings.notConfigured"),
      status: "active",
    });
  }
  const isCashActive = settings ? settings.cashEnabled : true;
  if (isCashActive) {
    activeMethodsList.push({
      type: "cash",
      title: t("settings.cash.title"),
      icon: Banknote,
      color: "#22c55e",
      detail: settings?.cashInstructions || t("methods.cashSub"),
      status: "active",
    });
  }

  return (
    <div className="jb-page">
      <div className="jb-page-inner pb-24">
        {/* Header */}
        <header className="jb-topbar flex gap-2 ">
          <div>
            <div className="jb-kicker">{t("kicker")}</div>
            <strong className="font-sora text-3xl font-black tracking-tight text-arena-text">
              €{totalReceived.toFixed(2).replace(".", ",")}
              <span className="text-xs font-semibold text-arena-text-muted ml-1.5">
                / €{totalExpected.toFixed(2).replace(".", ",")}{" "}
                {t("stats.received")}
              </span>
            </strong>
          </div>
        </header>

        {/* Dynamic Metric Cards Strip */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <MetricCard
            label={t("stats.toValidate").toUpperCase()}
            value={validatingCount}
            tone="warning"
            icon={Clock}
          />
          <MetricCard
            label={t("stats.overdue").toUpperCase()}
            value={pendingCount}
            tone="danger"
            icon={AlertCircle}
          />
          <MetricCard
            label={t("stats.paid").toUpperCase()}
            value={confirmedCount}
            tone="success"
            icon={CheckCircleIcon}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={val =>
            setActiveTab(val as "payments" | "methods" | "iapro")
          }
          className="w-full mt-6"
        >
          <div className="flex justify-center">
            <TabsList className="!bg-arena-surface !border !border-arena-border !rounded-[10px] !p-0.75 w-full max-w-sm flex h-10">
              <TabsTrigger
                value="payments"
                className={cn(
                  "flex-1 text-[11px] font-bold tracking-wide rounded-[8px] transition-all py-2",
                  "data-[state=active]:!bg-arena-primary data-[state=active]:!text-arena-bg data-[state=active]:!font-extrabold",
                  "data-[state=inactive]:text-arena-text-sec hover:data-[state=inactive]:text-arena-text dark:data-[state=active]:!bg-arena-primary dark:data-[state=active]:!text-arena-bg",
                )}
              >
                {t("tabs.payments")}
              </TabsTrigger>
              <TabsTrigger
                value="methods"
                className={cn(
                  "flex-1 text-[11px] font-bold tracking-wide rounded-[8px] transition-all py-2",
                  "data-[state=active]:!bg-arena-primary data-[state=active]:!text-arena-bg data-[state=active]:!font-extrabold",
                  "data-[state=inactive]:text-arena-text-sec hover:data-[state=inactive]:text-arena-text dark:data-[state=active]:!bg-arena-primary dark:data-[state=active]:!text-arena-bg",
                )}
              >
                {t("tabs.methods")}
              </TabsTrigger>
              <TabsTrigger
                value="iapro"
                className={cn(
                  "flex-1 text-[11px] font-bold tracking-wide rounded-[8px] transition-all py-2",
                  "data-[state=active]:!bg-arena-primary data-[state=active]:!text-arena-bg data-[state=active]:!font-extrabold",
                  "data-[state=inactive]:text-arena-text-sec hover:data-[state=inactive]:text-arena-text dark:data-[state=active]:!bg-arena-primary dark:data-[state=active]:!text-arena-bg",
                )}
              >
                {t("tabs.iapro")}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: Payments List */}
          <TabsContent value="payments" className="mt-0 outline-none">
            {/* Filter Pills using ButtonGroup */}
            <div className="overflow-x-auto pb-3 scrollbar-none w-full">
              <ButtonGroup className="!flex border border-arena-border rounded-[10px] p-[3px] bg-arena-surface min-w-max w-full">
                {(
                  [
                    "all",
                    PAYMENT_OVERVIEW_STATUS.VALIDATING,
                    PAYMENT_OVERVIEW_STATUS.PENDING,
                    PAYMENT_OVERVIEW_STATUS.CONFIRMED,
                    PAYMENT_OVERVIEW_STATUS.REFUSED,
                  ] as const
                ).map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setActiveFilter(f)}
                    className={cn(
                      "press flex-1 text-center py-2 px-3 text-[11px] font-bold tracking-wide rounded-[8px] transition-all cursor-pointer whitespace-nowrap",
                      activeFilter === f
                        ? "bg-arena-primary text-arena-bg font-extrabold"
                        : "text-arena-text-sec hover:text-arena-text",
                    )}
                  >
                    {f === "all"
                      ? t("filters.all")
                      : f === PAYMENT_OVERVIEW_STATUS.VALIDATING
                        ? t("filters.validating")
                        : f === PAYMENT_OVERVIEW_STATUS.PENDING
                          ? t("filters.pending")
                          : f === PAYMENT_OVERVIEW_STATUS.CONFIRMED
                            ? t("filters.confirmed")
                            : t("filters.overdue")}
                  </button>
                ))}
              </ButtonGroup>
            </div>

            <div className="grid gap-3 mt-2">
              {isLoading ? (
                <div className="jb-card flex items-center justify-center p-12 text-arena-text-muted">
                  <span className="animate-pulse">{t("loading")}</span>
                </div>
              ) : filteredPayments.length === 0 ? (
                <ArenaEmptyState
                  icon={Wallet}
                  title={t("noPayments")}
                  description={t("noPaymentsSub")}
                />
              ) : (
                filteredPayments.map((payment: Payment) => {
                  const isVal =
                    payment.status === PAYMENT_OVERVIEW_STATUS.VALIDATING;
                  const isConf =
                    payment.status === PAYMENT_OVERVIEW_STATUS.CONFIRMED;
                  const isPend =
                    payment.status === PAYMENT_OVERVIEW_STATUS.PENDING;
                  const isRef =
                    payment.status === PAYMENT_OVERVIEW_STATUS.REFUSED;

                  return (
                    <div
                      key={payment.id}
                      className="jb-card group relative overflow-hidden p-3.5 transition-all hover:border-arena-primary/30"
                    >
                      <div className="flex flex-col gap-3">
                        {/* Upper row: Avatar, Info, and Amount */}
                        <div className="flex items-center gap-3">
                          <JbAvatar
                            id={payment.player.id}
                            name={payment.player.name}
                            size={40}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="truncate text-xs font-bold text-arena-text">
                                {payment.player.name}
                              </span>
                              <VerifiedBadge
                                verified={payment.player.isVerified}
                                variant="icon"
                              />
                            </div>
                            <p className="text-[11px] text-arena-text-muted truncate mt-0.5">
                              {t(`methods.${payment.method}`)} ·{" "}
                              {payment.event.title}
                            </p>
                          </div>

                          <div className="text-right">
                            <strong className="font-sora text-base font-black text-arena-primary">
                              {payment.amount}
                            </strong>
                            <p className="text-[9px] text-arena-text-muted mt-0.5">
                              {t("ago", {
                                time:
                                  payment.id === "PAY-1"
                                    ? "1h"
                                    : payment.id === "PAY-2"
                                      ? "30 min"
                                      : payment.id === "PAY-3"
                                        ? "3h"
                                        : "2h",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Lower row: Badges and Buttons */}
                        <div className="flex flex-wrap gap-2 items-center justify-between border-t border-arena-border/30 pt-3">
                          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                            {isConf && (
                              <span className="rounded-full bg-arena-success/15 border border-arena-success/35 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-arena-success">
                                {badgeT("confirmed")}
                              </span>
                            )}
                            {isVal && (
                              <span className="rounded-full bg-arena-warning/15 border border-arena-warning/35 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-arena-warning">
                                {badgeT("validating")}
                              </span>
                            )}
                            {isPend && (
                              <span className="rounded-full bg-arena-danger/15 border border-arena-danger/35 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-arena-danger">
                                {badgeT("pending")}
                              </span>
                            )}
                            {isRef && (
                              <span className="rounded-full bg-arena-danger/15 border border-arena-danger/35 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-arena-danger">
                                {badgeT("refused")}
                              </span>
                            )}

                            {/* IA Risk Score badge */}
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border",
                                payment.score === "low"
                                  ? "bg-arena-success/10 border-arena-success/30 text-arena-success"
                                  : payment.score === "medium"
                                    ? "bg-arena-warning/10 border-arena-warning/30 text-arena-warning"
                                    : "bg-arena-danger/10 border-arena-danger/30 text-arena-danger",
                              )}
                            >
                              {payment.score === "low"
                                ? badgeT("low")
                                : payment.score === "medium"
                                  ? badgeT("medium")
                                  : badgeT("high")}
                            </span>
                          </div>

                          {/* Quick review CTA */}
                          {isVal && (
                            <button
                              type="button"
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedProofPayment(payment);
                              }}
                              className="press flex items-center gap-1 rounded-lg border border-arena-primary/30 bg-arena-primary/5 px-2.5 py-1 text-[10px] font-bold text-arena-primary transition-all hover:bg-arena-primary/15"
                            >
                              <FileText size={11} />
                              {t("verifyProof")}
                            </button>
                          )}
                          {!isVal && (
                            <Link
                              href={`/arena/payments/${payment.id}`}
                              className="press flex items-center gap-0.5 text-[10px] font-bold text-arena-text-sec hover:text-arena-primary"
                            >
                              {t("viewDetail")}
                              <ChevronRight size={10} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* TAB 2: Active Payment Methods */}
          <TabsContent value="methods" className="mt-0 outline-none">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-arena-text-muted">
                {t("methodsTitle")}
              </span>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="press inline-flex items-center gap-1 rounded-lg border border-arena-border bg-arena-surface px-2.5 py-1 text-[11px] font-bold text-arena-text-sec transition-colors hover:border-arena-primary/40 hover:text-arena-primary"
              >
                <Settings2 size={12} />
                {t("configureBtn")}
              </button>
            </div>

            <div className="grid gap-3">
              {/* MBWay Card */}
              <div className="rounded-[14px] border border-arena-border bg-arena-surface p-3.5 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-red-500/15 text-red-500 border border-red-500/30">
                  <Smartphone size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-arena-text">
                      {t("methods.mbway")}
                    </span>
                    {settings?.mbwayEnabled ? (
                      <span className="rounded-full bg-arena-success/15 border border-arena-success/35 px-1.5 py-0.5 text-[8px] font-bold text-arena-success">
                        {t("statusActive")}
                      </span>
                    ) : (
                      <span className="rounded-full bg-arena-surface-el px-1.5 py-0.5 text-[8px] font-bold text-arena-text-muted border border-arena-border">
                        {t("statusInactive")}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-arena-text-muted mt-0.5 truncate">
                    {settings?.mbwayEnabled
                      ? settings.mbwayPhone
                      : t("statusDisabled")}
                  </p>
                </div>
                <ChevronRight size={14} className="text-arena-text-muted" />
              </div>

              {/* Transfer Card */}
              <div className="rounded-[14px] border border-arena-border bg-arena-surface p-3.5 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/15 text-cyan-500 border border-cyan-500/30">
                  <Landmark size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-arena-text">
                      {t("methods.transfer")}
                    </span>
                    {settings?.transferEnabled ? (
                      <span className="rounded-full bg-arena-success/15 border border-arena-success/35 px-1.5 py-0.5 text-[8px] font-bold text-arena-success">
                        {t("statusActive")}
                      </span>
                    ) : (
                      <span className="rounded-full bg-arena-surface-el px-1.5 py-0.5 text-[8px] font-bold text-arena-text-muted border border-arena-border">
                        {t("statusInactive")}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-arena-text-muted mt-0.5 truncate font-mono">
                    {settings?.transferEnabled
                      ? settings.transferIban
                      : t("statusDisabled")}
                  </p>
                </div>
                <ChevronRight size={14} className="text-arena-text-muted" />
              </div>

              {/* Cash Card */}
              <div className="rounded-[14px] border border-arena-border bg-arena-surface p-3.5 flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-green-500/15 text-green-500 border border-green-500/30">
                  <Banknote size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-arena-text">
                      {t("methods.cash")}
                    </span>
                    <span className="rounded-full bg-arena-success/15 border border-arena-success/35 px-1.5 py-0.5 text-[8px] font-bold text-arena-success">
                      {t("statusActive")}
                    </span>
                  </div>
                  <p className="text-[11px] text-arena-text-muted mt-0.5 truncate">
                    {t("methods.cashSub")}
                  </p>
                </div>
                <ChevronRight size={14} className="text-arena-text-muted" />
              </div>

              {/* Stripe Card - Coming soon */}
              <div className="rounded-[14px] border border-arena-border/60 bg-arena-surface/50 p-3.5 flex items-center gap-3 opacity-60">
                <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400/70 border border-arena-border">
                  <CreditCard size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-arena-text/70">
                      Stripe
                    </span>
                    <span className="rounded-full bg-arena-border px-1.5 py-0.5 text-[8px] font-bold text-arena-text-muted">
                      {t("statusSoon")}
                    </span>
                  </div>
                  <p className="text-[11px] text-arena-text-muted mt-0.5 truncate">
                    {t("stripeSoon")}
                  </p>
                </div>
                <ChevronRight size={14} className="text-arena-text-muted/50" />
              </div>

              {/* USDC Card - Coming soon */}
              <div className="rounded-[14px] border border-arena-border/60 bg-arena-surface/50 p-3.5 flex items-center gap-3 opacity-60">
                <div className="flex size-9 items-center justify-center rounded-xl bg-yellow-500/10 text-yellow-400/70 border border-arena-border">
                  <Coins size={17} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-arena-text/70">
                      USDC
                    </span>
                    <span className="rounded-full bg-arena-border px-1.5 py-0.5 text-[8px] font-bold text-arena-text-muted">
                      {t("statusSoon")}
                    </span>
                  </div>
                  <p className="text-[11px] text-arena-text-muted mt-0.5 truncate">
                    {t("usdcSoon")}
                  </p>
                </div>
                <ChevronRight size={14} className="text-arena-text-muted/50" />
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: AI PRO Promotion */}
          <TabsContent value="iapro" className="mt-0 outline-none">
            <div className="rounded-[22px] border border-arena-primary/30 bg-gradient-to-b from-arena-primary/10 via-arena-surface/90 to-arena-surface p-6 shadow-2xl relative overflow-hidden">
              {/* Glow effects */}
              <div className="absolute -top-12 -right-12 size-24 rounded-full bg-arena-primary/20 blur-2xl" />

              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-arena-primary/15 text-arena-primary border border-arena-primary/30">
                  <Sparkles className="size-5 fill-arena-primary/10 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-sora text-[17px] font-black text-arena-text">
                      {t("iapro.title")}
                    </h3>
                    <span className="rounded-full bg-arena-primary px-2 py-0.5 text-[8px] font-black text-arena-bg tracking-widest uppercase">
                      {t("iapro.premium")}
                    </span>
                  </div>
                  <p className="text-[11px] text-arena-text-muted mt-0.5">
                    {t("iapro.subtitle")}
                  </p>
                </div>
              </div>

              <p className="text-xs text-arena-text-sec leading-relaxed mt-2.5">
                {t("iapro.description")}
              </p>

              {/* Feature bullet list */}
              <div className="flex flex-col gap-3 mt-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-arena-primary/15 text-arena-primary">
                    <span className="text-[11px] font-black">✓</span>
                  </div>
                  <span className="text-xs font-bold text-arena-text">
                    {t("iapro.feature1")}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-arena-primary/15 text-arena-primary">
                    <span className="text-[11px] font-black">✓</span>
                  </div>
                  <span className="text-xs font-bold text-arena-text">
                    {t("iapro.feature2")}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-arena-primary/15 text-arena-primary">
                    <span className="text-[11px] font-black">✓</span>
                  </div>
                  <span className="text-xs font-bold text-arena-text">
                    {t("iapro.feature3")}
                  </span>
                </div>
              </div>

              {/* CTA button */}
              <button
                type="button"
                className="press mt-8 flex h-[48px] w-full items-center justify-center gap-2 rounded-[14px] bg-arena-primary text-xs font-bold text-arena-bg shadow-[0_0_20px_rgba(124,255,79,0.25)] transition-all hover:bg-arena-primary/95"
              >
                <Sparkles className="size-4" />
                {t("iapro.cta")}
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Render Proof Review bottom sheet when selected */}
      {selectedProofPayment && (
        <ProofReviewSheet
          payment={selectedProofPayment}
          onClose={() => setSelectedProofPayment(null)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Settings sheet */}
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
                  transferEnabled: settings.transferEnabled,
                  transferIban: settings.transferIban ?? undefined,
                  transferName: settings.transferName ?? undefined,
                }
              : undefined
          }
          onClose={() => setShowSettings(false)}
          onSaved={() => {
            refetchSettings();
          }}
        />
      )}
    </div>
  );
}

// Inline fallback for CheckCircle
function CheckCircleIcon({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      className={className}
      width={size ?? 16}
      height={size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Confirmado"
    >
      <title>Confirmado</title>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
