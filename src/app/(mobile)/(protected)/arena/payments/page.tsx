"use client";

import { AlertCircle, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { MetricCard } from "@/components/arena/metric-card";
import { PaymentSettingsSheet } from "@/components/arena/payment-settings-sheet";
import { ProofReviewSheet } from "@/components/arena/proof-review-sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AiProTab } from "./_components/ai-pro-tab";
import { PaymentMethodsTab } from "./_components/payment-methods-tab";
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

          <TabsContent value="methods" className="mt-0 outline-none">
            <PaymentMethodsTab
              onConfigure={() => setShowSettings(true)}
              settings={settings}
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
