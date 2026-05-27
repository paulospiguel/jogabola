"use client";

import {
  Check,
  ExternalLink,
  Loader2,
  Mail,
  ShieldCheck,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import {
  requestPaymentProof,
  updatePaymentStatus,
} from "@/actions/payments.actions";
import { JbAvatar } from "@/components/arena/avatar";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import type { Payment } from "@/hooks/use-payments";
import { PAYMENT_REVIEW_STATUS } from "@/constants/payments";
import { cn } from "@/lib/utils";

interface ProofReviewSheetProps {
  payment: Payment;
  onClose: () => void;
  onSuccess?: () => void;
}

function isImageProof(url?: string): boolean {
  if (!url) return false;
  const cleanUrl = url.toLowerCase();
  return (
    cleanUrl.startsWith("http") &&
    (cleanUrl.includes(".png") ||
      cleanUrl.includes(".jpg") ||
      cleanUrl.includes(".jpeg") ||
      cleanUrl.includes(".webp") ||
      cleanUrl.includes(".gif") ||
      cleanUrl.includes("image"))
  );
}

export function ProofReviewSheet({
  payment,
  onClose,
  onSuccess,
}: ProofReviewSheetProps) {
  const t = useTranslations("arenaPayments.proofReview");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "approve" | "reject" | "proof" | null
  >(null);
  const [isPending, startTransition] = useTransition();

  const paymentId = Number(payment.id.replace(/^PAY-/i, ""));
  const actionDisabled = isPending || !paymentId;

  function runStatusAction(
    status: typeof PAYMENT_REVIEW_STATUS.APPROVED | typeof PAYMENT_REVIEW_STATUS.REJECTED,
  ) {
    setPendingAction(
      status === PAYMENT_REVIEW_STATUS.APPROVED ? "approve" : "reject",
    );
    setFeedback(null);

    startTransition(async () => {
      const result = await updatePaymentStatus({ paymentId, status });
      if (result.success) {
        setFeedback({
          type: "success",
          message:
            status === PAYMENT_REVIEW_STATUS.APPROVED
              ? t("approveSuccess")
              : t("rejectSuccess"),
        });
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        setFeedback({ type: "error", message: t("error") });
      }
      setPendingAction(null);
    });
  }

  function runProofRequest() {
    setPendingAction("proof");
    setFeedback(null);

    startTransition(async () => {
      const result = await requestPaymentProof({ paymentId });
      if (result.success) {
        setFeedback({
          type: "success",
          message: t("requestProofSuccess"),
        });
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        setFeedback({ type: "error", message: t("error") });
      }
      setPendingAction(null);
    });
  }

  return (
    <BottomSheet title={t("title")} onClose={onClose} noPad>
      <div className="flex flex-col gap-4 px-5 py-4 pb-8 max-h-[82vh] overflow-y-auto">
        {feedback && (
          <div
            className={`rounded-xl border px-3.5 py-2.5 text-[12px] font-semibold leading-relaxed ${
              feedback.type === "success"
                ? "border-arena-success/30 bg-arena-success/10 text-arena-success"
                : "border-arena-danger/30 bg-arena-danger/10 text-arena-danger"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* 1. Atleta & Evento Info Card */}
        <div className="rounded-2xl border border-arena-border bg-arena-surface/40 p-4 flex items-center gap-3.5 min-w-0">
          <JbAvatar
            id={payment.player.id}
            name={payment.player.name}
            image={payment.player.image ?? null}
            size={42}
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-arena-text text-sm truncate">
                {payment.player.name}
              </span>
              {payment.player.isVerified && (
                <div className="flex size-[14px] shrink-0 items-center justify-center rounded-full bg-arena-success text-arena-bg">
                  <Check size={9} strokeWidth={3.5} />
                </div>
              )}
            </div>
            <p className="text-[11px] text-arena-text-sec truncate mt-0.5 leading-none">
              {payment.event.title} · {payment.amount}
            </p>
          </div>
        </div>

        {/* 2. Bloco Inteligência Artificial (IA Pre-validado) */}
        <div
          className={cn(
            "rounded-2xl border p-4 flex items-center justify-between gap-3 min-w-0",
            payment.score === "low"
              ? "border-arena-success/20 bg-arena-success/5 text-arena-success"
              : payment.score === "medium"
                ? "border-arena-warning/20 bg-arena-warning/5 text-arena-warning"
                : "border-arena-danger/20 bg-arena-danger/5 text-arena-danger",
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {payment.score === "low" ? (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-arena-success/15 text-arena-success">
                <ShieldCheck size={18} strokeWidth={2} />
              </div>
            ) : payment.score === "medium" ? (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-arena-warning/15 text-arena-warning">
                <ShieldCheck size={18} strokeWidth={2} />
              </div>
            ) : (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-arena-danger/15 text-arena-danger">
                <ShieldCheck size={18} strokeWidth={2} />
              </div>
            )}
            <div className="min-w-0">
              <span className="block text-xs font-black uppercase tracking-wide leading-none">
                {payment.score === "low"
                  ? t("ia.lowTitle")
                  : payment.score === "medium"
                    ? t("ia.mediumTitle")
                    : t("ia.highTitle")}
              </span>
              <span className="block text-[10px] opacity-75 mt-1 truncate leading-none">
                {payment.score === "low"
                  ? t("ia.lowDesc")
                  : payment.score === "medium"
                    ? t("ia.mediumDesc")
                    : t("ia.highDesc")}
              </span>
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border shrink-0",
              payment.score === "low"
                ? "bg-[#7CFF4F]/10 border-[#7CFF4F]/30 text-[#7CFF4F]"
                : payment.score === "medium"
                  ? "bg-arena-warning/10 border-arena-warning/30 text-arena-warning"
                  : "bg-arena-danger/10 border-arena-danger/30 text-arena-danger",
            )}
          >
            PRO
          </span>
        </div>

        {/* 3. Visualizador do Comprovativo (Com listras diagonais premium) */}
        <div className="relative flex flex-col items-center justify-center aspect-[4/3] w-full rounded-2xl border-2 border-dashed border-arena-border bg-[#0B0F14]/40 overflow-hidden">
          {/* Diagonal stripes gradient */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,#111827,#111827_6px,#151c26_6px,#151c26_12px)] opacity-40" />

          <div className="relative flex flex-col items-center justify-center w-full h-full p-6 text-center">
            {payment.proofUrl ? (
              isImageProof(payment.proofUrl) ? (
                <div className="relative flex flex-col items-center gap-2 max-w-[85%] max-h-[85%]">
                  <div
                    className="aspect-[4/3] w-56 rounded-xl border border-arena-border bg-arena-bg bg-contain bg-center bg-no-repeat transition-transform hover:scale-[1.02]"
                    style={{ backgroundImage: `url(${payment.proofUrl})` }}
                  />
                  <a
                    href={payment.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-1 text-[11px] font-bold text-arena-text-sec transition-colors hover:text-arena-primary"
                  >
                    <ExternalLink size={12} />
                    {t("viewFull")}
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-arena-bg/75 border border-arena-border/50 backdrop-blur-md shadow-2xl max-w-[80%]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="size-10 text-arena-text-sec/60"
                    role="img"
                    aria-label="file-icon"
                  >
                    <title>{t("documentTitle")}</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                  <span className="mt-2.5 text-[11px] font-bold text-arena-text-sec uppercase tracking-widest leading-none">
                    {t("documentLabel")}
                  </span>
                  <span className="text-[10px] text-arena-text-muted mt-1.5 leading-none">
                    {payment.method.toUpperCase()} {payment.amount}
                  </span>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center py-8 text-center text-arena-text-muted">
                <ShieldCheck className="size-8 text-arena-text-muted/40 mb-2" />
                <p className="text-xs font-semibold">{t("error")}</p>
              </div>
            )}
          </div>
        </div>

        {/* 4. Painel de Ações Rápidas */}
        <div className="flex flex-col gap-2 mt-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={actionDisabled}
              onClick={() => runStatusAction(PAYMENT_REVIEW_STATUS.REJECTED)}
              className="press flex h-11 items-center justify-center gap-1.5 rounded-[12px] border border-arena-danger/30 bg-arena-danger/10 text-xs font-bold text-arena-danger transition-colors hover:bg-arena-danger/15 disabled:opacity-50"
            >
              {pendingAction === "reject" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <X className="size-3.5" />
              )}
              {t("reject")}
            </button>

            <button
              type="button"
              disabled={actionDisabled}
              onClick={() => runStatusAction(PAYMENT_REVIEW_STATUS.APPROVED)}
              className="press flex h-11 items-center justify-center gap-1.5 rounded-[12px] bg-arena-primary text-xs font-bold text-arena-bg transition-colors hover:bg-arena-primary/95 disabled:opacity-50"
            >
              {pendingAction === "approve" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" strokeWidth={2.5} />
              )}
              {t("approve")}
            </button>
          </div>

          <button
            type="button"
            disabled={actionDisabled}
            onClick={runProofRequest}
            className="press flex h-10 items-center justify-center gap-1.5 rounded-[12px] border border-arena-border bg-arena-surface text-xs font-bold text-arena-text-sec transition-colors hover:border-arena-primary/30 hover:text-arena-primary disabled:opacity-50"
          >
            {pendingAction === "proof" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Mail className="size-3.5" />
            )}
            {t("requestProof")}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
