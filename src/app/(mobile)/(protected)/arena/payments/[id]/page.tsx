"use client";

import {
  ArrowLeft,
  Calendar,
  Check,
  FileWarning,
  Loader2,
  Pencil,
  Undo2,
  Wallet,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import {
  requestPaymentProof,
  updatePaymentStatus,
} from "@/actions/payments.actions";
import { type BadgeStatus, JbBadge } from "@/components/arena/badge";
import { Button } from "@/components/ui/button";
import {
  PAYMENT_OVERVIEW_STATUS,
  PAYMENT_REVIEW_STATUS,
  PAYMENT_STATUS,
  type PaymentOverviewStatus,
  type PaymentReviewStatus,
  type PaymentStatus,
} from "@/constants/payments";
import { usePayments } from "@/hooks/use-payments";
import { cn } from "@/lib/utils";
import { PaymentDetailSidebar } from "../_components/payment-detail-sidebar";
import { PaymentProofViewer } from "../_components/payment-proof-viewer";

type Feedback = { type: "success" | "error"; message: string } | null;

function parsePaymentId(id: string | string[] | undefined) {
  const raw = Array.isArray(id) ? id[0] : id;
  if (!raw) return null;
  const numeric = Number(raw.replace(/^PAY-/i, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function statusToDb(status: PaymentOverviewStatus): PaymentStatus {
  if (status === PAYMENT_OVERVIEW_STATUS.CONFIRMED) {
    return PAYMENT_STATUS.APPROVED;
  }
  if (status === PAYMENT_OVERVIEW_STATUS.REFUSED) {
    return PAYMENT_STATUS.REJECTED;
  }
  if (status === PAYMENT_OVERVIEW_STATUS.VALIDATING) {
    return PAYMENT_STATUS.PAID_UNVERIFIED;
  }
  return status;
}

export default function PaymentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const t = useTranslations("arenaPayments");
  const badgeT = useTranslations("arenaBadges");
  const { payments, isLoading, refetch } = usePayments();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pendingAction, setPendingAction] = useState<
    "approve" | "reject" | "proof" | null
  >(null);
  const [isEditingDecision, setIsEditingDecision] = useState(false);
  const [isPending, startTransition] = useTransition();

  const paymentId = parsePaymentId(id);
  const payment = payments.find(p => p.id === (Array.isArray(id) ? id[0] : id));
  const dbStatus = useMemo(
    () => (payment ? statusToDb(payment.status) : ""),
    [payment],
  );
  const isApproved = dbStatus === PAYMENT_STATUS.APPROVED;
  const isRejected = dbStatus === PAYMENT_STATUS.REJECTED;
  const hasFinalDecision = isApproved || isRejected;
  const showDecisionActions = !hasFinalDecision || isEditingDecision;
  const actionDisabled = isPending || !paymentId;

  function runStatusAction(status: PaymentReviewStatus) {
    if (!paymentId) return;
    setPendingAction(
      status === PAYMENT_REVIEW_STATUS.APPROVED ? "approve" : "reject",
    );
    setFeedback(null);

    startTransition(async () => {
      const result = await updatePaymentStatus({ paymentId, status });
      if (result.success) {
        setIsEditingDecision(false);
        setFeedback({
          type: "success",
          message:
            status === PAYMENT_REVIEW_STATUS.APPROVED
              ? t("detail.approveSuccess")
              : t("detail.rejectSuccess"),
        });
        await refetch();
      } else {
        setFeedback({ type: "error", message: t("detail.actionError") });
      }
      setPendingAction(null);
    });
  }

  function runProofRequest() {
    if (!paymentId) return;
    setPendingAction("proof");
    setFeedback(null);

    startTransition(async () => {
      const result = await requestPaymentProof({ paymentId });
      setFeedback({
        type: result.success ? "success" : "error",
        message: result.success
          ? t("detail.requestProofSuccess")
          : t("detail.requestProofError"),
      });
      setPendingAction(null);
    });
  }

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
                onClick={() => runStatusAction("rejected")}
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
                onClick={() => runStatusAction("approved")}
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
            <section className="jb-card overflow-hidden">
              <div className="border-b border-arena-border bg-arena-surface-el/45 px-6 py-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-arena-text-muted">
                  {t("detail.summary")}
                </h2>
              </div>
              <div className="grid gap-x-10 gap-y-5 p-6 md:grid-cols-2">
                {[
                  [t("table.amount"), payment.amount],
                  [t("table.event"), payment.event.title],
                  [t("table.status"), payment.status],
                  [t("table.date"), payment.date],
                  [t("table.method"), payment.method],
                  [t("table.risk"), payment.score],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 border-b border-arena-border/55 pb-3"
                  >
                    <span className="text-[13px] text-arena-text-muted">
                      {label}
                    </span>
                    {label === t("table.amount") ? (
                      <span className="font-sora text-2xl font-extrabold text-arena-primary">
                        {value}
                      </span>
                    ) : label === t("table.status") ? (
                      <JbBadge status={payment.status as BadgeStatus} animate />
                    ) : label === t("table.method") ? (
                      <span className="flex items-center gap-2 font-bold text-arena-text">
                        <Wallet size={16} className="text-arena-primary" />
                        {value}
                      </span>
                    ) : label === t("table.date") ? (
                      <span className="flex items-center gap-2 font-bold text-arena-text">
                        <Calendar size={16} className="text-arena-text-muted" />
                        {value}
                      </span>
                    ) : label === t("table.risk") ? (
                      <JbBadge status={payment.score as BadgeStatus} />
                    ) : (
                      <span className="text-right font-bold text-arena-text">
                        {value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>

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
                  onRequest={runProofRequest}
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
