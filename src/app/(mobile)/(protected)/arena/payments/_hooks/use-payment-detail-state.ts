"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";
import {
  requestPaymentProof,
  updatePaymentStatus,
} from "@/actions/payments/payments.actions";
import {
  PAYMENT_OVERVIEW_STATUS,
  PAYMENT_REVIEW_STATUS,
  PAYMENT_STATUS,
  type PaymentOverviewStatus,
  type PaymentReviewStatus,
  type PaymentStatus,
} from "@/constants/payments";
import { usePayments } from "@/hooks/use-payments";

type Feedback = { type: "success" | "error"; message: string } | null;
type PendingAction = "approve" | "reject" | "proof" | null;

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

export function usePaymentDetailState() {
  const { id } = useParams();
  const t = useTranslations("arenaPayments");
  const { payments, isLoading, refetch } = usePayments();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isEditingDecision, setIsEditingDecision] = useState(false);
  const [isPending, startTransition] = useTransition();

  const paymentId = parsePaymentId(id);
  const payment = payments.find(
    payment => payment.id === (Array.isArray(id) ? id[0] : id),
  );
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

  function requestProof() {
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

  return {
    actionDisabled,
    approvePayment: () => runStatusAction(PAYMENT_REVIEW_STATUS.APPROVED),
    feedback,
    hasFinalDecision,
    isApproved,
    isEditingDecision,
    isLoading,
    isRejected,
    payment,
    paymentId,
    pendingAction,
    rejectPayment: () => runStatusAction(PAYMENT_REVIEW_STATUS.REJECTED),
    requestProof,
    setIsEditingDecision,
    showDecisionActions,
  };
}
