"use client";

import {
  CheckIcon,
  LoaderIcon,
  LoginIcon,
  MailIcon,
  UserIcon,
} from "@animateicons/react/lucide";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { confirmUserAttendance } from "@/actions/attendance.actions";
import { requestAuthSignInOTP } from "@/actions/auth-otp.actions";
import { requestGuestOTP, verifyGuestOTP } from "@/actions/guest-rsvp.actions";
import { createPayment, submitPaymentProof } from "@/actions/payments.actions";
import { JbBottomSheet } from "@/components/arena/jb-bottom-sheet";
import { PaymentMethodCard } from "@/components/arena/payment-method-card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useEvent } from "@/hooks/use-events";
import { usePublicTeamPaymentSettings } from "@/hooks/use-team-payment-settings";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { PaymentMethod, TeamPaymentConfig } from "@/types/payments";

type Step =
  | "choose"
  | "login-email"
  | "login-otp"
  | "guest-info"
  | "guest-otp"
  | "payment"
  | "success";

interface AthleteRsvpSheetProps {
  eventId: number;
  userId?: string | null;
  onClose: () => void;
  onSuccess: (status: string, reservationId?: number) => void;
  /** When true the user is already confirmed — skip confirmUserAttendance and just fetch reservationId */
  resumePayment?: boolean;
  guestReservationId?: number | null;
}

function BackButton({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-1 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-arena-primary hover:text-arena-primary/80"
    >
      <ArrowLeft size={13} />
      {label}
    </button>
  );
}

function EmailInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <InputGroup className="h-[50px] rounded-[12px]  border-arena-border">
      <InputGroupInput
        type="email"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="email@email.com"
        className="w-full"
        required
        autoComplete="email"
      />
      <InputGroupAddon>
        <MailIcon size={17} color="currentColor" />
      </InputGroupAddon>
    </InputGroup>
  );
}

function OtpField({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex justify-center py-2">
      <InputOTP
        maxLength={6}
        value={value}
        onChange={onChange}
        inputMode="numeric"
        autoComplete="one-time-code"
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}

function SubmitBtn({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-arena-primary text-[14px] font-bold text-arena-bg shadow-[0_0_20px_rgba(124,255,79,0.2)] transition-all hover:bg-arena-primary/90 disabled:opacity-60"
    >
      {loading ? <LoaderIcon size={18} color="currentColor" /> : children}
    </button>
  );
}

const RESEND_SECONDS = 30;
const EMAIL_ERROR_CODES = new Set([
  "RESEND_API_KEY_MISSING",
  "RESEND_API_KEY_INVALID",
  "RESEND_FROM_INVALID",
  "RESEND_DOMAIN_NOT_VERIFIED",
  "RESEND_DEV_DOMAIN_RESTRICTED",
  "EMAIL_SEND_FAILED",
]);

function getGuestOtpErrorMessage(
  t: ReturnType<typeof useTranslations>,
  res: { error?: string; errorCode?: string },
  fallback: string,
) {
  if (res.errorCode && EMAIL_ERROR_CODES.has(res.errorCode)) {
    return t(`errors.email.${res.errorCode}`);
  }

  return res.error || fallback;
}

function getAttendanceErrorMessage(
  t: ReturnType<typeof useTranslations>,
  error: string | undefined,
  fallback: string,
) {
  if (error === "EVENT_ROSTER_ONLY") return t("errors.rosterOnly");
  if (error === "EVENT_CANCELLED") return t("errors.eventCancelled");
  return error || fallback;
}

function useResendTimer() {
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setSeconds(RESEND_SECONDS);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          const id = intervalRef.current;
          if (id) clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    start();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [start]);

  return { seconds, canResend: seconds === 0, restart: start };
}

function ResendTimer({
  onResend,
  loading,
  resendCodeLabel,
  resendInLabel,
}: {
  onResend: () => Promise<void>;
  loading: boolean;
  resendCodeLabel: string;
  resendInLabel: (seconds: number) => string;
}) {
  const { seconds, canResend, restart } = useResendTimer();
  const [resending, setResending] = useState(false);

  async function handleResend() {
    setResending(true);
    await onResend();
    setResending(false);
    restart();
  }

  const circumference = 2 * Math.PI * 10; // r=10
  const progress = (seconds / RESEND_SECONDS) * circumference;

  return (
    <div className="flex items-center justify-center gap-2.5 pt-1">
      {canResend ? (
        <button
          type="button"
          disabled={loading || resending}
          onClick={handleResend}
          className="flex items-center gap-1.5 rounded-[10px] border border-arena-border bg-arena-surface px-4 py-2 text-[12px] font-bold text-arena-primary transition-all hover:bg-arena-primary/10 disabled:opacity-50"
        >
          {resending ? (
            <LoaderIcon size={14} color="currentColor" />
          ) : (
            <RotateCcw size={13} strokeWidth={2.5} />
          )}
          {resendCodeLabel}
        </button>
      ) : (
        <div className="flex items-center gap-2 text-[12px] text-arena-text-muted">
          {/* Circular countdown */}
          <div className="relative flex size-7 items-center justify-center">
            <svg
              width="28"
              height="28"
              className="-rotate-90"
              aria-hidden="true"
            >
              {/* Track */}
              <circle
                cx="14"
                cy="14"
                r="10"
                fill="none"
                stroke="var(--color-arena-border)"
                strokeWidth="2"
              />
              {/* Progress */}
              <circle
                cx="14"
                cy="14"
                r="10"
                fill="none"
                stroke="var(--color-arena-primary)"
                strokeWidth="2"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - progress}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.9s linear" }}
              />
            </svg>
            <span className="absolute text-[9px] font-bold tabular-nums text-arena-primary">
              {seconds}
            </span>
          </div>
          <span>{resendInLabel(seconds)}</span>
        </div>
      )}
    </div>
  );
}

export function AthleteRsvpSheet({
  eventId,
  userId,
  onClose,
  onSuccess,
  resumePayment = false,
  guestReservationId = null,
}: AthleteRsvpSheetProps) {
  const t = useTranslations("athleteRsvp");
  const router = useRouter();
  const [step, setStep] = useState<Step>(
    resumePayment ? "payment" : userId ? "payment" : "choose"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestOtp, setGuestOtp] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginOtp, setLoginOtp] = useState("");

  const [reservationId, setReservationId] = useState<number | null>(
    guestReservationId
  );
  const autoConfirmKeyRef = useRef<string | null>(null);

  const { event } = useEvent(eventId);
  const { settings } = usePublicTeamPaymentSettings(event?.teamId);

  useEffect(() => {
    const autoConfirmKey = `${eventId}:${userId ?? ""}:${resumePayment}`;
    if (
      userId &&
      step === "payment" &&
      !reservationId &&
      autoConfirmKeyRef.current !== autoConfirmKey
    ) {
      autoConfirmKeyRef.current = autoConfirmKey;
      setLoading(true);
      confirmUserAttendance(eventId).then(res => {
        setLoading(false);
        if (res.success) {
          setReservationId(res.reservationId);
          // When resuming payment the user is already confirmed — don't
          // call onSuccess here or the parent will close the sheet.
          if (!resumePayment) {
            onSuccess("confirmed");
          }
        } else {
          setError(
            getAttendanceErrorMessage(
              t,
              res.error,
              t("errors.confirmAttendance"),
            ),
          );
        }
      });
    }
  }, [eventId, onSuccess, reservationId, resumePayment, step, t, userId]);

  function clearError() {
    setError("");
  }

  const handleNextAfterRsvp = useCallback(
    (resId?: number) => {
      if (event?.priceCents && event.priceCents > 0) {
        if (resId) setReservationId(resId);
        setStep("payment");
      } else {
        setStep("success");
      }
    },
    [event],
  );

  async function handleGuestSendOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) {
      setError(t("fillNameEmail"));
      return;
    }
    setLoading(true);
    clearError();
    const res = await requestGuestOTP(
      eventId,
      guestName.trim(),
      guestEmail.trim(),
    );
    setLoading(false);
    if (res.success) {
      setStep("guest-otp");
    } else {
      setError(getGuestOtpErrorMessage(t, res, t("errors.sendCode")));
    }
  }

  async function handleGuestVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    if (guestOtp.length < 6) {
      setError(t("enterCode"));
      return;
    }
    setLoading(true);
    clearError();
    const res = await verifyGuestOTP(eventId, guestEmail, guestOtp, guestName);
    setLoading(false);
    if (res.success) {
      // Pass the reservationId back to the parent so it can remember it for resume payment
      onSuccess("confirmed", res.reservationId);
      handleNextAfterRsvp(res.reservationId);
    } else {
      setError(res.error || t("invalidCode"));
    }
  }

  async function handleLoginSendOTP(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setError(t("enterEmail"));
      return;
    }
    setLoading(true);
    clearError();
    const result = await requestAuthSignInOTP(loginEmail);
    setLoading(false);
    if (!result.success) {
      setError(getGuestOtpErrorMessage(t, result, t("errors.sendCode")));
    } else {
      setStep("login-otp");
    }
  }

  async function handleLoginVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    if (loginOtp.length < 6) {
      setError(t("enterCode"));
      return;
    }
    setLoading(true);
    clearError();

    const name =
      loginEmail
        .split("@")[0]
        ?.replace(/[._-]+/g, " ")
        .trim() || "Atleta";

    const result = await signIn.emailOtp({
      email: loginEmail,
      otp: loginOtp,
      name,
    });

    if (result.error) {
      setError(result.error.message || t("invalidCode"));
      setLoading(false);
      return;
    }

    const confirm = await confirmUserAttendance(eventId);
    setLoading(false);
    if (confirm.success) {
      onSuccess("confirmed", confirm.reservationId);
      handleNextAfterRsvp(confirm.reservationId);
    } else {
      setError(
        getAttendanceErrorMessage(
          t,
          confirm.error,
          t("errors.sessionCreatedAttendanceFailed"),
        ),
      );
    }
  }

  async function handlePaymentIntent(method: PaymentMethod) {
    if (!reservationId || !event) return;

    const res = await createPayment({
      matchReservationId: reservationId,
      amountCents: event.priceCents,
      currency: event.currency,
      method,
    });

    if (res.success && res.data) {
      router.push(`/event/${eventId}/payment/result/${res.data.id}`);
      return res.data;
    } else {
      setError(t("errors.processPayment"));
    }
  }

  async function handleMbwayProof(paymentId: number) {
    // Placeholder for real proof upload
    // For now, we'll just submit a dummy URL to mark as paid_unverified
    await submitPaymentProof({
      paymentId,
      fileUrl: "https://example.com/placeholder-proof.jpg",
      notes: t("paymentNotes"),
    });
    router.push(`/event/${eventId}/payment/result/${paymentId}`);
  }

  const TITLES: Record<Step, string> = {
    choose: t("titles.choose"),
    "login-email": t("titles.loginEmail"),
    "login-otp": t("titles.loginOtp"),
    "guest-info": t("titles.guestInfo"),
    "guest-otp": t("titles.guestOtp"),
    payment: t("titles.payment"),
    success: t("titles.success"),
  };

  const defaultPaymentConfig: TeamPaymentConfig = {
    stripe: { enabled: false },
    mbway: { enabled: false },
    cash: { enabled: true, instructions: t("cashInstructions") },
  };

  // When payment is required upfront, cash is not a valid option (manager can override manually)
  const cashAllowed = !event?.paymentRequired;

  const paymentConfig: TeamPaymentConfig = settings
    ? {
        stripe: {
          enabled: settings.stripeEnabled,
          accountId: settings.stripeAccountId ?? undefined,
        },
        mbway: {
          enabled: settings.mbwayEnabled,
          phone: settings.mbwayPhone ?? undefined,
          name: settings.mbwayName ?? undefined,
        },
        cash: {
          enabled: settings.cashEnabled && cashAllowed,
          instructions: settings.cashInstructions ?? undefined,
        },
      }
    : {
        ...defaultPaymentConfig,
        cash: { ...defaultPaymentConfig.cash, enabled: cashAllowed },
      };

  return (
    <JbBottomSheet title={TITLES[step]} onClose={onClose}>
      <div className="flex flex-col p-5">
        {error && (
          <div className="mb-4 rounded-[10px] bg-arena-danger/10 p-3 text-[13px] text-arena-danger">
            {error}
          </div>
        )}

        {/* STEP: choose */}
        {step === "choose" && (
          <div className="flex flex-col gap-3">
            <p className="mb-2 text-[13px] text-arena-text-muted">
              {t("choosePrompt")}
            </p>

            <button
              type="button"
              onClick={() => {
                clearError();
                setStep("login-email");
              }}
              className="group flex items-center gap-4 rounded-[14px] border border-arena-border bg-arena-surface p-4 text-left transition-all hover:border-arena-primary/40 hover:bg-arena-primary/5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] border border-arena-primary/30 bg-arena-primary/10 text-arena-primary">
                <LoginIcon size={20} color="currentColor" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-arena-text">
                  {t("hasAccountOption")}
                </p>
                <p className="text-[12px] text-arena-text-muted">
                  {t("hasAccountHint")}
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-arena-text-muted transition-transform group-hover:translate-x-0.5"
              />
            </button>

            <button
              type="button"
              onClick={() => {
                clearError();
                setStep("guest-info");
              }}
              className="group flex items-center gap-4 rounded-[14px] border border-arena-border bg-arena-surface p-4 text-left transition-all hover:border-arena-info/40 hover:bg-arena-info/5"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] border border-arena-info/30 bg-arena-info/10 text-arena-info">
                <UserIcon size={20} color="currentColor" />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-arena-text">
                  {t("continueAsGuest")}
                </p>
                <p className="text-[12px] text-arena-text-muted">
                  {t("guestEmailHint")}
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-arena-text-muted transition-transform group-hover:translate-x-0.5"
              />
            </button>

            <p className="mt-1 text-center text-[11px] text-arena-text-muted">
              {t("noAccountPrefix")}{" "}
              <Link
                href="/auth"
                className="font-semibold text-arena-primary hover:underline"
              >
                {t("createNow")}
              </Link>{" "}
              {t("freeSuffix")}
            </p>
          </div>
        )}

        {/* STEP: login-email */}
        {step === "login-email" && (
          <form onSubmit={handleLoginSendOTP} className="flex flex-col gap-4">
            <BackButton
              label={t("back")}
              onClick={() => {
                clearError();
                setStep("choose");
              }}
            />
            <p className="text-[13px] text-arena-text-muted">
              {t("loginEmailHint")}
            </p>
            <EmailInput value={loginEmail} onChange={setLoginEmail} />
            <SubmitBtn loading={loading}>
              {t("receiveCode")} <ArrowRight size={16} />
            </SubmitBtn>
          </form>
        )}

        {/* STEP: login-otp */}
        {step === "login-otp" && (
          <form onSubmit={handleLoginVerifyOTP} className="flex flex-col gap-4">
            <BackButton
              label={t("back")}
              onClick={() => {
                clearError();
                setStep("login-email");
              }}
            />
            <p className="text-[13px] text-arena-text-muted">
              {t("codeSentTo")}{" "}
              <span className="font-semibold text-arena-text-sec">
                {loginEmail}
              </span>
            </p>
            <OtpField value={loginOtp} onChange={setLoginOtp} />
            <SubmitBtn loading={loading}>
              <CheckIcon size={18} color="currentColor" />
              {t("loginAndConfirm")}
            </SubmitBtn>
            <ResendTimer
              loading={loading}
              resendCodeLabel={t("resendCode")}
              resendInLabel={seconds => t("resendIn", { seconds })}
              onResend={async () => {
                clearError();
                const result = await requestAuthSignInOTP(loginEmail);
                if (!result.success) {
                  setError(
                    getGuestOtpErrorMessage(t, result, t("errors.resend")),
                  );
                }
              }}
            />
          </form>
        )}

        {/* STEP: guest-info */}
        {step === "guest-info" && (
          <form onSubmit={handleGuestSendOTP} className="flex flex-col gap-4">
            <BackButton
              label={t("back")}
              onClick={() => {
                clearError();
                setStep("choose");
              }}
            />
            <p className="text-[13px] text-arena-text-muted">
              {t("noAccount")}
            </p>

            <InputGroup className="h-[50px] rounded-[12px]  border-arena-border">
              <InputGroupInput
                type="text"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="Nome completo"
                required
                autoComplete="name"
              />
              <InputGroupAddon>
                <UserIcon size={17} color="currentColor" />
              </InputGroupAddon>
            </InputGroup>

            <EmailInput value={guestEmail} onChange={setGuestEmail} />

            <SubmitBtn loading={loading}>
              {t("receivePin")} <ArrowRight size={16} />
            </SubmitBtn>

            <p className="text-center text-[10px] text-arena-text-muted">
              {t("terms.prefix")}{" "}
              <Link
                href="/terms"
                className="underline hover:text-arena-text transition-colors"
              >
                {t("terms.terms")}
              </Link>{" "}
              {t("terms.and")}{" "}
              <Link
                href="/privacy"
                className="underline hover:text-arena-text transition-colors"
              >
                {t("terms.privacy")}
              </Link>
              .
            </p>
          </form>
        )}

        {/* STEP: guest-otp */}
        {step === "guest-otp" && (
          <form onSubmit={handleGuestVerifyOTP} className="flex flex-col gap-4">
            <BackButton
              label={t("back")}
              onClick={() => {
                clearError();
                setStep("guest-info");
              }}
            />
            <p className="text-[13px] text-arena-text-muted">
              {t("codeSentTo")}{" "}
              <span className="font-semibold text-arena-text-sec">
                {guestEmail}
              </span>
            </p>
            <OtpField value={guestOtp} onChange={setGuestOtp} />
            <SubmitBtn loading={loading}>
              <CheckIcon size={18} color="currentColor" />
              {t("confirmPresence")}
            </SubmitBtn>
            <ResendTimer
              loading={loading}
              resendCodeLabel={t("resendCode")}
              resendInLabel={seconds => t("resendIn", { seconds })}
              onResend={async () => {
                clearError();
                const res = await requestGuestOTP(
                  eventId,
                  guestName.trim(),
                  guestEmail.trim(),
                );
                if (!res.success)
                  setError(
                    getGuestOtpErrorMessage(t, res, t("errors.resendPin")),
                  );
              }}
            />
          </form>
        )}

        {/* STEP: payment */}
        {step === "payment" && event && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5 rounded-[12px] border border-arena-primary/20 bg-arena-primary/5 p-3.5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-full bg-arena-primary text-arena-bg">
                  <CheckIcon size={14} color="currentColor" />
                </div>
                <p className="text-[13px] font-bold text-arena-text">
                  {t("paymentReservedTitle")}
                </p>
              </div>
              <p className="text-[12px] text-arena-text-muted">
                {t("paymentReservedSubtitle")}
              </p>
            </div>

            <PaymentMethodCard
              config={paymentConfig}
              amountCents={event.priceCents}
              currency={event.currency}
              onCashIntent={() => handlePaymentIntent("cash")}
              onMbwayProof={async () => {
                const p = await handlePaymentIntent("mbway");
                if (p) handleMbwayProof(p.id);
              }}
            />

            <button
              type="button"
              onClick={() => setStep("success")}
              className="mt-2 text-center text-[12px] font-bold text-arena-text-muted hover:text-arena-text"
            >
              {t("payLater")}
            </button>
          </div>
        )}

        {/* STEP: success */}
        {step === "success" && (
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <div className="flex size-16 items-center justify-center rounded-full border border-arena-success/30 bg-arena-success/15 text-arena-success">
              <CheckIcon size={32} color="currentColor" />
            </div>

            <div>
              <h2 className="text-[20px] font-bold text-arena-text">
                {t("presenceConfirmed")}
              </h2>
              <p className="mt-1 text-[13px] text-arena-text-muted">
                {guestName
                  ? t("successGreetingWithName", { name: guestName })
                  : t("successOnList")}
              </p>
            </div>

            <div className="w-full rounded-[16px] border border-arena-border bg-arena-surface p-4 text-left">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={16} className="text-arena-primary" />
                <span className="text-[13px] font-bold text-arena-text">
                  {t("createAthleteAccount")}
                </span>
              </div>
              <p className="mb-3 text-[12px] text-arena-text-muted">
                {t("createAccountFree")}
              </p>
              <Link
                href={`/auth?mode=register&email=${encodeURIComponent(guestEmail || loginEmail)}&callbackURL=/event/${eventId}`}
                className={cn(
                  "flex h-[44px] w-full items-center justify-center gap-2 rounded-[12px] bg-arena-primary text-[13px] font-bold text-arena-bg no-underline transition-all hover:bg-arena-primary/90",
                )}
              >
                <Sparkles size={15} />
                {t("createFreeAccount")}
              </Link>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-[12px] text-arena-text-muted transition-colors hover:text-arena-text"
            >
              {t("close")}
            </button>
          </div>
        )}
      </div>
    </JbBottomSheet>
  );
}
