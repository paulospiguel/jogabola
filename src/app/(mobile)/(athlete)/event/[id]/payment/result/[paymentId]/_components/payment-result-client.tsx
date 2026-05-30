"use client";

import {
  ArrowLeft,
  Check,
  Clock,
  FileText,
  ImagePlus,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { submitPaymentProof } from "@/actions/payments.actions";
import { PAYMENT_STATUS } from "@/constants/payments";
import { usePayment } from "@/hooks/use-payments";
import { useProofUpload } from "@/hooks/use-proof-upload";
import { cn } from "@/lib/utils";

interface PaymentResultClientProps {
  paymentId: number;
  eventId: number;
}

function formatMethod(
  method: string,
  t: ReturnType<typeof useTranslations<"paymentResult">>,
) {
  if (method === "mbway") return t("methods.mbway");
  if (method === "cash") return t("methods.cash");
  if (method === "stripe") return t("methods.stripe");
  if (method === "transfer") return t("methods.transfer");
  return t("methods.unknown");
}

function formatCurrency(amountCents: number, currency: string) {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: currency || "EUR",
  }).format(amountCents / 100);
}

type StatusConfig = {
  Icon: typeof Check | typeof Clock | typeof X;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
  titleKey:
    | "paid.title"
    | "paid_unverified.title"
    | "failed.title"
    | "pending.title";
  captionKey:
    | "paid.caption"
    | "paid_unverified.caption"
    | "failed.caption"
    | "pending.caption";
};

function getStatusConfig(status: string): StatusConfig {
  switch (status) {
    case PAYMENT_STATUS.PAID:
    case PAYMENT_STATUS.APPROVED:
      return {
        Icon: Check,
        iconBg: "bg-arena-success/15",
        iconColor: "text-arena-success",
        iconBorder: "border-arena-success/30",
        titleKey: "paid.title",
        captionKey: "paid.caption",
      };
    case PAYMENT_STATUS.PAID_UNVERIFIED:
      return {
        Icon: Clock,
        iconBg: "bg-arena-warning/15",
        iconColor: "text-arena-warning",
        iconBorder: "border-arena-warning/30",
        titleKey: "paid_unverified.title",
        captionKey: "paid_unverified.caption",
      };
    case PAYMENT_STATUS.FAILED:
    case PAYMENT_STATUS.REJECTED:
    case PAYMENT_STATUS.REFUNDED:
      return {
        Icon: X,
        iconBg: "bg-arena-danger/15",
        iconColor: "text-arena-danger",
        iconBorder: "border-arena-danger/30",
        titleKey: "failed.title",
        captionKey: "failed.caption",
      };
    default:
      return {
        Icon: Clock,
        iconBg: "bg-arena-warning/15",
        iconColor: "text-arena-warning",
        iconBorder: "border-arena-warning/30",
        titleKey: "pending.title",
        captionKey: "pending.caption",
      };
  }
}

// ─── Proof Upload Component ────────────────────────────────────────────────

interface ProofUploadProps {
  paymentId: number;
  onUploaded: () => void;
}

function ProofUpload({ paymentId, onUploaded }: ProofUploadProps) {
  const t = useTranslations("paymentResult");
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [done, setDone] = useState(false);

  const { state, upload, reset } = useProofUpload({
    paymentId,
    onSuccess: async publicUrl => {
      // After R2 upload succeeds, record the proof URL in our DB
      setSubmitting(true);
      const res = await submitPaymentProof({ paymentId, fileUrl: publicUrl });
      setSubmitting(false);

      if (res.success) {
        setDone(true);
        setTimeout(() => onUploaded(), 1200);
      } else {
        setSubmitError(t("proof.submitError"));
      }
    },
  });

  const handleFile = useCallback(
    (file: File) => {
      const fileIsPdf = file.type === "application/pdf";
      const fileIsImage = file.type.startsWith("image/");
      if (!fileIsImage && !fileIsPdf) {
        setSubmitError(t("proof.invalidType"));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setSubmitError(t("proof.tooLarge"));
        return;
      }
      setIsPdf(fileIsPdf);
      setPreview(URL.createObjectURL(file));
      setSubmitError("");
      reset();
      void upload(file);
    },
    [upload, reset, t],
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // reset so same file can be picked again
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const isUploading = state.status === "uploading" || submitting;
  const uploadError =
    state.status === "error" ? state.message : submitError || "";

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[14px] border border-arena-success/30 bg-arena-success/8 px-4 py-5 text-center">
        <div className="flex size-10 items-center justify-center rounded-full bg-arena-success/20 text-arena-success">
          <Check size={20} strokeWidth={2.5} />
        </div>
        <p className="text-[13px] font-semibold text-arena-success">
          {t("proof.successMessage")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[12px] font-bold uppercase tracking-wider text-arena-text-muted">
        {t("proof.title")}
      </p>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onKeyDown={e => e.key === "Enter" && inputRef.current?.click()}
        className={cn(
          "relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-[14px] border-2 border-dashed transition-all",
          isUploading
            ? "border-arena-primary/40 bg-arena-primary/5"
            : "border-arena-border bg-arena-surface hover:border-arena-primary/40 hover:bg-arena-primary/5",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="sr-only"
          onChange={handleInputChange}
          disabled={isUploading}
        />

        {preview ? (
          /* Preview thumbnail */
          <div className="relative h-full w-full">
            {isPdf ? (
              <div className="absolute inset-0 flex items-center justify-center bg-arena-surface-el/40">
                <FileText size={48} className="text-arena-primary/30" />
              </div>
            ) : (
              <Image
                src={preview}
                alt={t("proof.imageAlt")}
                fill
                className="object-cover opacity-30"
              />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              {isUploading ? (
                <>
                  <Loader2
                    size={28}
                    className="animate-spin text-arena-primary"
                  />
                  <p className="text-[12px] font-semibold text-arena-primary">
                    {state.status === "uploading"
                      ? t("proof.uploading")
                      : t("proof.registering")}
                  </p>
                </>
              ) : (
                <>
                  <Upload size={22} className="text-arena-primary" />
                  <p className="text-[12px] font-semibold text-arena-text">
                    {t("proof.changeFile")}
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex size-12 items-center justify-center rounded-[12px] border border-arena-border bg-arena-surface-el text-arena-primary">
              <ImagePlus size={22} strokeWidth={2} />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-arena-text">
                {t("proof.dropzone")}
              </p>
              <p className="text-[11px] text-arena-text-muted">
                {t("proof.formats")}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Progress bar */}
      {state.status === "uploading" && (
        <div className="h-1 w-full overflow-hidden rounded-full bg-arena-border">
          <div
            className="h-full rounded-full bg-arena-primary transition-all duration-500"
            style={{ width: `${state.progress}%` }}
          />
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <p className="rounded-[10px] bg-arena-danger/10 px-3 py-2 text-[12px] text-arena-danger">
          {uploadError}
        </p>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export function PaymentResultClient({
  paymentId,
  eventId,
}: PaymentResultClientProps) {
  const t = useTranslations("paymentResult");
  const tRsvp = useTranslations("athleteRsvpSheet");
  const { payment, isLoading, error, refetch } = usePayment(paymentId);
  const [proofUploaded, setProofUploaded] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-arena-bg">
        <div className="size-10 animate-spin rounded-full border-2 border-arena-primary/30 border-t-arena-primary" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-arena-bg px-5">
        <p className="text-center text-sm text-arena-text-muted">
          {error instanceof Error ? error.message : t("loadError")}
        </p>
        <Link
          href={`/event/${eventId}`}
          className="flex items-center gap-1.5 text-sm font-medium text-arena-primary"
        >
          <ArrowLeft size={16} />
          {t("backToEvent")}
        </Link>
      </div>
    );
  }

  const status = payment.status ?? PAYMENT_STATUS.PENDING;
  const { Icon, iconBg, iconColor, iconBorder, titleKey, captionKey } =
    getStatusConfig(proofUploaded ? PAYMENT_STATUS.PAID_UNVERIFIED : status);
  const formattedCurrency = formatCurrency(
    payment.amountCents,
    payment.currency,
  );

  // Show upload section when payment is pending (mbway/transfer) and proof not yet uploaded
  const showUpload =
    !proofUploaded &&
    (status === PAYMENT_STATUS.PENDING ||
      status === PAYMENT_STATUS.PAID_UNVERIFIED) &&
    (payment.method === "mbway" ||
      (payment.method === "transfer" && payment.transferRequiresProof));

  let caption = t(captionKey);
  if (payment.method === "transfer") {
    if (status === PAYMENT_STATUS.PAID_UNVERIFIED || proofUploaded) {
      caption = payment.transferRequiresProof
        ? tRsvp("payment.methods.transfer.waitingMsg")
        : tRsvp("payment.methods.transfer.waitingMsgNoProof");
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-arena-bg">
      <PaymentStatusChangeAnimation paymentId={payment.id} status={status} />
      {/* Back header */}
      <div className="px-5 pb-2 pt-6">
        <Link
          href={`/event/${eventId}`}
          className="flex items-center gap-1.5 text-sm text-arena-text-muted transition-colors hover:text-arena-text"
        >
          <ArrowLeft size={16} />
          {t("backToEvent")}
        </Link>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 py-8">
        {/* Status icon */}
        <div
          className={cn(
            "flex size-24 items-center justify-center rounded-full border-2",
            iconBg,
            iconBorder,
          )}
        >
          <Icon size={44} className={iconColor} strokeWidth={2.5} />
        </div>

        {/* Text block */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="font-sora text-[22px] font-bold leading-tight text-arena-text">
            {t(titleKey)}
          </h1>
          <p className="text-[14px] text-arena-text-sec">
            {formattedCurrency} · {payment.eventTitle}
          </p>
          {caption && (
            <p className="mt-0.5 text-[13px] text-arena-text-muted">
              {caption}
            </p>
          )}
        </div>

        {/* ── Proof upload (mbway/transfer pending) ── */}
        {showUpload && (
          <div className="w-full">
            <ProofUpload
              paymentId={paymentId}
              onUploaded={() => {
                setProofUploaded(true);
                void refetch();
              }}
            />
          </div>
        )}

        {/* Detail card */}
        <div className="w-full rounded-[16px] border border-arena-border bg-arena-surface px-4 py-1">
          <div className="flex items-center justify-between border-b border-arena-border py-2.5">
            <span className="text-[13px] text-arena-text-muted">
              {t("details.from")}
            </span>
            <span className="text-[13px] font-semibold text-arena-text">
              {payment.payerName ?? "—"}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-arena-border py-2.5">
            <span className="text-[13px] text-arena-text-muted">
              {t("details.to")}
            </span>
            <span className="text-[13px] font-semibold text-arena-text">
              {payment.teamName}
            </span>
          </div>

          <div className="flex items-center justify-between py-2.5">
            <span className="text-[13px] text-arena-text-muted">
              {t("details.method")}
            </span>
            <span className="text-[13px] font-semibold text-arena-text">
              {formatMethod(payment.method, t)}
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-arena-border pb-2.5 pt-3">
            <span className="text-[13px] font-bold text-arena-text">
              {t("details.total")}
            </span>
            <span
              className={cn(
                "text-[16px] font-bold",
                status === PAYMENT_STATUS.PAID ||
                  status === PAYMENT_STATUS.APPROVED
                  ? "text-arena-primary"
                  : "text-arena-warning",
              )}
            >
              {formattedCurrency}
            </span>
          </div>
        </div>

        {/* Back CTA */}
        <Link
          href={`/event/${eventId}`}
          className="w-full rounded-[12px] bg-arena-primary py-3.5 text-center font-sora text-[15px] font-semibold text-[#0B0F14] transition-opacity active:opacity-80"
        >
          {t("backToEvent")}
        </Link>
      </div>
    </div>
  );
}
