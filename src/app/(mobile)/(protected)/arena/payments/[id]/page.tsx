"use client";

import {
  ArrowLeft,
  Check,
  FileWarning,
  Loader2,
  Pencil,
  Undo2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PaymentDetailSidebar } from "../_components/payment-detail-sidebar";
import { PaymentProofViewer } from "../_components/payment-proof-viewer";
import { PaymentSummaryCard } from "../_components/payment-summary-card";
import { usePaymentDetailState } from "../_hooks/use-payment-detail-state";

export default function PaymentDetailPage() {
  const router = useRouter();
  const t = useTranslations("arenaPayments");
  const badgeT = useTranslations("arenaBadges");
  const {
    actionDisabled,
    approvePayment,
    feedback,
    hasFinalDecision,
    isApproved,
    isEditingDecision,
    isLoading,
    isRejected,
    payment,
    paymentId,
    pendingAction,
    rejectPayment,
    requestProof,
    setIsEditingDecision,
    showDecisionActions,
  } = usePaymentDetailState();

  if (isLoading) {
    return (
      <div className="jb-page flex items-center justify-center">
        <div className="flex items-center gap-3 text-arena-text-muted">
          <Loader2 size={18} className="animate-spin text-arena-primary" />
          {t("loading")}
        </div>
      </div>
    );
  }

  if (!payment || !paymentId) {
    return (
      <div className="jb-page">
        <div className="jb-page-inner flex min-h-[52vh] items-center justify-center text-center">
          <div className="max-w-sm rounded-[18px] border border-arena-border bg-arena-surface p-8">
            <FileWarning
              className="mx-auto mb-4 text-arena-warning"
              size={34}
            />
            <h1 className="font-sora text-xl font-bold text-arena-text">
              {t("notFound")}
            </h1>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mt-4 text-arena-text-sec hover:text-arena-primary"
            >
              <ArrowLeft className="mr-2" size={16} />
              {t("actions.back")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="jb-page">
      <div className="jb-page-inner">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full border border-arena-border bg-arena-surface text-arena-text-sec hover:bg-arena-primary/10 hover:text-arena-primary"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <div className="jb-kicker uppercase">{payment.id}</div>
              <h1 className="jb-title">{t("detail.title")}</h1>
            </div>
          </div>

          {showDecisionActions ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              {hasFinalDecision && isEditingDecision && (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label={t("detail.closeStatusEdit")}
                  title={t("detail.closeStatusEdit")}
                  onClick={() => setIsEditingDecision(false)}
                  className="size-11 rounded-[14px] border-arena-border bg-arena-surface text-arena-text-sec hover:border-arena-primary/50 hover:bg-arena-primary/10 hover:text-arena-primary"
                >
                  <Undo2 size={17} />
                </Button>
              )}
              <Button
                type="button"
                onClick={rejectPayment}
                disabled={actionDisabled || isRejected}
                variant="outline"
                className="rounded-[14px] border-arena-danger/35 bg-arena-danger/8 px-5 text-[13px] font-bold text-arena-danger hover:bg-arena-danger/14"
              >
                {pendingAction === "reject" ? (
                  <Loader2 className="mr-2 animate-spin" size={16} />
                ) : (
                  <X className="mr-2" size={16} />
                )}
                {t("detail.reject")}
              </Button>
              <Button
                type="button"
                onClick={approvePayment}
                disabled={actionDisabled || isApproved}
                className="rounded-[14px] bg-arena-primary px-5 text-[13px] font-bold text-arena-bg hover:bg-arena-primary/90"
              >
                {pendingAction === "approve" ? (
                  <Loader2 className="mr-2 animate-spin" size={16} />
                ) : (
                  <Check className="mr-2" size={16} />
                )}
                {t("detail.accept")}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="icon"
              variant="outline"
              aria-label={t("detail.editStatus")}
              title={t("detail.editStatus")}
              onClick={() => setIsEditingDecision(true)}
              className="size-11 rounded-[14px] border-arena-border bg-arena-surface text-arena-text-sec hover:border-arena-primary/50 hover:bg-arena-primary/10 hover:text-arena-primary"
            >
              <Pencil size={17} />
            </Button>
          )}
        </header>

        {feedback && (
          <div
            className={cn(
              "mb-5 rounded-[14px] border px-4 py-3 text-[13px] font-semibold",
              feedback.type === "success"
                ? "border-arena-success/30 bg-arena-success/10 text-arena-success"
                : "border-arena-danger/30 bg-arena-danger/10 text-arena-danger",
            )}
          >
            {feedback.message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <PaymentSummaryCard payment={payment} t={t} />

            <section className="jb-card overflow-hidden">
              <div className="border-b border-arena-border bg-arena-surface-el/45 px-6 py-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-arena-text-muted">
                  {t("detail.proof")}
                </h2>
              </div>
              <div className="p-6">
                <PaymentProofViewer
                  proofUrl={payment.proofUrl}
                  alt={t("detail.proofAlt")}
                  onRequest={requestProof}
                  requesting={pendingAction === "proof"}
                  requestLabel={t("detail.requestProof")}
                  requestAgainLabel={t("detail.requestProofAgain")}
                  missingTitle={t("detail.noProof")}
                  missingDescription={t("detail.noProofSub")}
                  brokenTitle={t("detail.brokenProof")}
                  brokenDescription={t("detail.brokenProofSub")}
                  openLabel={t("detail.viewProof")}
                  downloadLabel={t("actions.download")}
                  loadingLabel={t("detail.loadingProof")}
                  receivedKicker={t("detail.proofReceivedKicker")}
                  receivedTitle={t("detail.proofReceivedTitle")}
                  receivedDescription={t("detail.proofReceivedDescription")}
                />
              </div>
            </section>
          </div>

          <PaymentDetailSidebar badgeT={badgeT} payment={payment} t={t} />
        </div>
      </div>
    </div>
  );
}
