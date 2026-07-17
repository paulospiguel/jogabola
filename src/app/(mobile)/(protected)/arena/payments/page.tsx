"use client";

import { AlertCircle, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { MetricCard } from "@/components/arena/metric-card";
import { PaymentSettingsSheet } from "@/components/arena/payment-settings-sheet";
import { ProofReviewSheet } from "@/components/arena/proof-review-sheet";
import { deriveQueryViewState } from "@/components/arena/query-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AiProTab } from "./_components/ai-pro-tab";
import { PaymentMethodsTab } from "./_components/payment-methods-tab";
import { PaymentsListTab } from "./_components/payments-list-tab";
import {
  type PaymentsTab,
  usePaymentsPageState,
} from "./_hooks/use-payments-page-state";

/**
 * Placeholder matching `MetricCard`'s footprint (`min-h-[92px]`,
 * `rounded-[14px]`, `border-arena-border`, `bg-arena-surface/70`) so the
 * strip doesn't jump size while its real value is still unknown. Used
 * whenever the payments query hasn't settled with real data yet — during
 * the initial fetch, or after an error with nothing to show — so a
 * counter never renders "0" as if it were a trustworthy answer.
 */
function MetricCardSkeleton() {
  return (
    <div
      className="flex min-h-[92px] min-w-0 flex-col justify-between rounded-[14px] border border-arena-border bg-arena-surface/70 p-3"
      aria-hidden="true"
    >
      <div className="h-3 w-16 animate-pulse rounded-full bg-arena-surface-el" />
      <div className="h-6 w-10 animate-pulse rounded-lg bg-arena-surface-el" />
    </div>
  );
}

export default function PaymentsPage() {
  const t = useTranslations("arenaPayments");
  const badgeT = useTranslations("arenaBadges");
  const {
    activeFilter,
    activeTab,
    activeTeamId,
    filteredPayments,
    paymentsState,
    selectedProofPayment,
    setActiveFilter,
    setActiveTab,
    setSelectedProofPayment,
    setShowSettings,
    settingsState,
    showSettings,
    statusCounts,
    totals,
  } = usePaymentsPageState();

  // Metrics (header total + strip) are derived straight from `payments`,
  // so they must follow the same loading/error/empty/success precedence as
  // the list itself — a genuine zero (`empty`/`success`) is a trustworthy
  // "€0,00", but `loading`/`error` never render a number at all, so a
  // skeleton is never mistaken for "no payments yet".
  const paymentsViewState = deriveQueryViewState({
    hasData: paymentsState.payments.length > 0,
    isInitialLoading: paymentsState.isInitialLoading,
    isFetching: paymentsState.isFetching,
    error: paymentsState.error,
  });
  const metricsReady =
    paymentsViewState.status === "empty" ||
    paymentsViewState.status === "success";

  return (
    <div className="jb-page">
      <div className="jb-page-inner pb-24">
        {/* Header */}
        <header className="jb-topbar flex gap-2 ">
          <div>
            <div className="jb-kicker">{t("kicker")}</div>
            {metricsReady ? (
              <strong className="font-sora text-3xl font-black tracking-tight text-arena-text">
                €{totals.received.toFixed(2).replace(".", ",")}
                <span className="text-xs font-semibold text-arena-text-muted ml-1.5">
                  / €{totals.expected.toFixed(2).replace(".", ",")}{" "}
                  {t("stats.received")}
                </span>
              </strong>
            ) : (
              <div
                className="mt-1 h-8 w-44 animate-pulse rounded-lg bg-arena-surface-el"
                aria-hidden="true"
              />
            )}
          </div>
        </header>

        {/* Dynamic Metric Cards Strip */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {metricsReady ? (
            <>
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
            </>
          ) : (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          )}
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
              onSelectProofPayment={setSelectedProofPayment}
              paymentsState={paymentsState}
              setActiveFilter={setActiveFilter}
              t={t}
            />
          </TabsContent>

          <TabsContent value="methods" className="mt-0 outline-none">
            <PaymentMethodsTab
              onConfigure={() => setShowSettings(true)}
              settings={settingsState.settings}
              t={t}
            />
          </TabsContent>

          <TabsContent value="iapro" className="mt-0 outline-none">
            <AiProTab t={t} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Render Proof Review bottom sheet when selected */}
      {selectedProofPayment && (
        <ProofReviewSheet
          payment={selectedProofPayment}
          onClose={() => setSelectedProofPayment(null)}
          onSuccess={() => {
            paymentsState.refetch();
          }}
        />
      )}

      {/* Settings sheet */}
      {showSettings && activeTeamId && (
        <PaymentSettingsSheet
          teamId={activeTeamId}
          initial={
            settingsState.settings
              ? {
                  stripeEnabled: settingsState.settings.stripeEnabled,
                  mbwayEnabled: settingsState.settings.mbwayEnabled,
                  mbwayPhone: settingsState.settings.mbwayPhone ?? undefined,
                  mbwayName: settingsState.settings.mbwayName ?? undefined,
                  cashEnabled: settingsState.settings.cashEnabled,
                  cashInstructions:
                    settingsState.settings.cashInstructions ?? undefined,
                  transferEnabled: settingsState.settings.transferEnabled,
                  transferIban:
                    settingsState.settings.transferIban ?? undefined,
                  transferName:
                    settingsState.settings.transferName ?? undefined,
                }
              : undefined
          }
          onClose={() => setShowSettings(false)}
          onSaved={() => {
            settingsState.refetch();
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
  const t = useTranslations("arenaPayments");
  const label = t("stats.paid");
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
      aria-label={label}
    >
      <title>{label}</title>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
