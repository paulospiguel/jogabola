"use client";

import {
  AlertCircle,
  Banknote,
  ChevronRight,
  Clock,
  Coins,
  CreditCard,
  Landmark,
  Settings2,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { MetricCard } from "@/components/arena/metric-card";
import { PaymentSettingsSheet } from "@/components/arena/payment-settings-sheet";
import { ProofReviewSheet } from "@/components/arena/proof-review-sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { PaymentsListTab } from "./_components/payments-list-tab";
import {
  type PaymentsTab,
  usePaymentsPageState,
} from "./_hooks/use-payments-page-state";

export default function PaymentsPage() {
  const t = useTranslations("arenaPayments");
  const badgeT = useTranslations("arenaBadges");
  const {
    activeFilter,
    activeTab,
    activeTeamId,
    filteredPayments,
    isLoading,
    refetch,
    refetchSettings,
    selectedProofPayment,
    setActiveFilter,
    setActiveTab,
    setSelectedProofPayment,
    setShowSettings,
    settings,
    showSettings,
    statusCounts,
    totals,
  } = usePaymentsPageState();

  return (
    <div className="jb-page">
      <div className="jb-page-inner pb-24">
        {/* Header */}
        <header className="jb-topbar flex gap-2 ">
          <div>
            <div className="jb-kicker">{t("kicker")}</div>
            <strong className="font-sora text-3xl font-black tracking-tight text-arena-text">
              €{totals.received.toFixed(2).replace(".", ",")}
              <span className="text-xs font-semibold text-arena-text-muted ml-1.5">
                / €{totals.expected.toFixed(2).replace(".", ",")}{" "}
                {t("stats.received")}
              </span>
            </strong>
          </div>
        </header>

        {/* Dynamic Metric Cards Strip */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <MetricCard
            label={t("stats.toValidate").toUpperCase()}
            value={statusCounts.validating}
            tone="warning"
            icon={Clock}
          />
          <MetricCard
            label={t("stats.overdue").toUpperCase()}
            value={statusCounts.pending}
            tone="danger"
            icon={AlertCircle}
          />
          <MetricCard
            label={t("stats.paid").toUpperCase()}
            value={statusCounts.confirmed}
            tone="success"
            icon={CheckCircleIcon}
          />
        </div>

        <Tabs
          value={activeTab}
          onValueChange={val => setActiveTab(val as PaymentsTab)}
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

          <TabsContent value="payments" className="mt-0 outline-none">
            <PaymentsListTab
              activeFilter={activeFilter}
              badgeT={badgeT}
              filteredPayments={filteredPayments}
              isLoading={isLoading}
              onSelectProofPayment={setSelectedProofPayment}
              setActiveFilter={setActiveFilter}
              t={t}
            />
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
