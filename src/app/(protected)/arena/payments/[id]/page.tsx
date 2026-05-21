"use client";

import {
  ArrowLeft,
  Calendar,
  Check,
  Download,
  ExternalLink,
  FileWarning,
  History,
  Loader2,
  Mail,
  Pencil,
  ShieldCheck,
  Undo2,
  User,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  requestPaymentProof,
  updatePaymentStatus,
} from "@/actions/payments.actions";
import { JbAvatar } from "@/components/arena/jb-avatar";
import { type BadgeStatus, JbBadge } from "@/components/arena/jb-badge";
import { JbScoreBar, type ScoreLevel } from "@/components/arena/jb-score-bar";
import { VerifiedBadge } from "@/components/arena/verified-badge";
import { Button } from "@/components/ui/button";
import { usePayments } from "@/hooks/use-payments";
import { cn } from "@/lib/utils";

type Feedback = { type: "success" | "error"; message: string } | null;
const PAYMENT_STATUSES = [
  "pending",
  "validating",
  "confirmed",
  "refused",
] as const satisfies BadgeStatus[];

const STATUS_DOT_CLASS: Record<(typeof PAYMENT_STATUSES)[number], string> = {
  pending: "bg-arena-text-muted",
  validating: "bg-arena-warning",
  confirmed: "bg-arena-success",
  refused: "bg-arena-danger",
};

function parsePaymentId(id: string | string[] | undefined) {
  const raw = Array.isArray(id) ? id[0] : id;
  if (!raw) return null;
  const numeric = Number(raw.replace(/^PAY-/i, ""));
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function statusToDb(status: string) {
  if (status === "confirmed") return "approved";
  if (status === "refused") return "rejected";
  if (status === "validating") return "paid_unverified";
  return status;
}

interface ProofViewerProps {
  proofUrl?: string;
  alt: string;
  onRequest: () => void;
  requesting: boolean;
  requestLabel: string;
  requestAgainLabel: string;
  missingTitle: string;
  missingDescription: string;
  brokenTitle: string;
  brokenDescription: string;
  openLabel: string;
  downloadLabel: string;
  loadingLabel: string;
  receivedKicker: string;
  receivedTitle: string;
  receivedDescription: string;
}

function ProofViewer({
  proofUrl,
  alt,
  onRequest,
  requesting,
  requestLabel,
  requestAgainLabel,
  missingTitle,
  missingDescription,
  brokenTitle,
  brokenDescription,
  openLabel,
  downloadLabel,
  loadingLabel,
  receivedKicker,
  receivedTitle,
  receivedDescription,
}: ProofViewerProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    setImageFailed(false);
    setImageReady(false);
    if (!proofUrl) return;

    const image = new window.Image();
    image.onload = () => setImageReady(true);
    image.onerror = () => setImageFailed(true);
    image.src = proofUrl;
  }, [proofUrl]);

  const hasUsableProof = Boolean(proofUrl) && imageReady && !imageFailed;

  if (proofUrl && !imageReady && !imageFailed) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-[16px] border border-arena-border bg-arena-bg/45 text-arena-text-sec">
        <Loader2 className="mr-2 animate-spin text-arena-primary" size={18} />
        {loadingLabel}
      </div>
    );
  }

  if (!hasUsableProof) {
    const hasBrokenProof = Boolean(proofUrl) && imageFailed;

    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[16px] border border-dashed border-arena-border bg-arena-bg/45 px-6 py-12 text-center">
        <div
          className={cn(
            "mb-4 flex size-14 items-center justify-center rounded-[16px] border",
            hasBrokenProof
              ? "border-arena-warning/30 bg-arena-warning/10 text-arena-warning"
              : "border-arena-primary/25 bg-arena-primary/10 text-arena-primary",
          )}
        >
          {hasBrokenProof ? (
            <FileWarning size={26} />
          ) : (
            <ShieldCheck size={26} />
          )}
        </div>
        <h3 className="font-sora text-[17px] font-bold text-arena-text">
          {hasBrokenProof ? brokenTitle : missingTitle}
        </h3>
        <p className="mt-2 max-w-md text-[13px] leading-relaxed text-arena-text-sec">
          {hasBrokenProof ? brokenDescription : missingDescription}
        </p>
        <Button
          type="button"
          onClick={onRequest}
          disabled={requesting}
          className="mt-6 rounded-[14px] bg-arena-primary px-5 text-[13px] font-bold text-arena-bg hover:bg-arena-primary/90"
        >
          {requesting ? (
            <Loader2 className="mr-2 animate-spin" size={16} />
          ) : (
            <Mail className="mr-2" size={16} />
          )}
          {hasBrokenProof ? requestAgainLabel : requestLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(320px,520px)_1fr]">
      <div
        role="img"
        aria-label={alt}
        className="relative aspect-[4/5] overflow-hidden rounded-[18px] border border-arena-border bg-arena-bg bg-contain bg-center bg-no-repeat shadow-[0_32px_80px_-56px_rgba(0,0,0,.95)]"
        style={{ backgroundImage: `url(${proofUrl})` }}
      />
      <div className="flex flex-col justify-between rounded-[16px] border border-arena-border bg-arena-bg/45 p-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-arena-text-muted">
            {receivedKicker}
          </p>
          <h3 className="mt-2 font-sora text-[18px] font-bold text-arena-text">
            {receivedTitle}
          </h3>
          <p className="mt-2 text-[13px] leading-relaxed text-arena-text-sec">
            {receivedDescription}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            asChild
            variant="outline"
            className="rounded-[12px] border-arena-border bg-arena-surface text-arena-text hover:border-arena-primary/40 hover:bg-arena-primary/10 hover:text-arena-primary"
          >
            <a href={proofUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2" size={16} />
              {openLabel}
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            className="rounded-[12px] text-arena-text-sec hover:bg-arena-surface-el hover:text-arena-text"
          >
            <a href={proofUrl} download>
              <Download className="mr-2" size={16} />
              {downloadLabel}
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
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
  const isApproved = dbStatus === "approved";
  const isRejected = dbStatus === "rejected";
  const hasFinalDecision = isApproved || isRejected;
  const showDecisionActions = !hasFinalDecision || isEditingDecision;
  const actionDisabled = isPending || !paymentId;

  function runStatusAction(status: "approved" | "rejected") {
    if (!paymentId) return;
    setPendingAction(status === "approved" ? "approve" : "reject");
    setFeedback(null);

    startTransition(async () => {
      const result = await updatePaymentStatus({ paymentId, status });
      if (result.success) {
        setIsEditingDecision(false);
        setFeedback({
          type: "success",
          message:
            status === "approved"
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
                <ProofViewer
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

          <aside className="space-y-6">
            <section className="jb-card p-6">
              <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-arena-text-muted">
                {t("detail.athlete")}
              </h2>
              <div className="flex flex-col items-center text-center">
                <JbAvatar
                  id={payment.player.id}
                  name={payment.player.name}
                  image={payment.player.image}
                  size={80}
                />
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <h3 className="font-sora text-lg font-bold text-arena-text">
                    {payment.player.name}
                  </h3>
                  <VerifiedBadge verified={payment.player.isVerified} />
                </div>
                <p className="mt-1 text-sm text-arena-text-muted">
                  {t("detail.memberSince", {
                    year: new Date(payment.player.createdAt).getFullYear(),
                  })}
                </p>

                <div className="mt-8 grid w-full gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-[12px] border-arena-border bg-arena-surface text-arena-text hover:border-arena-primary/40 hover:bg-arena-primary/10 hover:text-arena-primary"
                  >
                    <Link href={`/arena/squads/player/${payment.player.id}`}>
                      <User className="mr-2" size={16} />
                      {t("table.viewProfile")}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className="rounded-[12px] text-arena-text-muted hover:bg-arena-surface-el hover:text-arena-text"
                  >
                    <Link
                      href={`/arena/squads/player/${payment.player.id}#history`}
                    >
                      <History className="mr-2" size={16} />
                      {t("detail.history")}
                    </Link>
                  </Button>
                </div>
              </div>
            </section>

            <section className="jb-card p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xs font-bold uppercase tracking-widest text-arena-text-muted">
                  {t("detail.status")}
                </h2>
              </div>
              <div className="rounded-[14px] border border-arena-primary/35 bg-arena-primary/8 px-4 py-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-arena-text-muted">
                  {t("detail.currentStatus")}
                </div>
                <JbBadge status={payment.status as BadgeStatus} animate />
              </div>
              <div className="mt-3">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-arena-text-muted">
                  {t("detail.possibleStatuses")}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-2">
                  {PAYMENT_STATUSES.map(status => (
                    <span
                      key={status}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[10px] font-semibold text-arena-text-muted",
                        payment.status === status && "text-arena-text",
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          STATUS_DOT_CLASS[status],
                        )}
                      />
                      {badgeT(status)}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="jb-card px-5 pb-5 pt-4">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-arena-text-muted">
                {t("table.risk")}
              </h2>
              <JbScoreBar score={payment.score as ScoreLevel} />
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
