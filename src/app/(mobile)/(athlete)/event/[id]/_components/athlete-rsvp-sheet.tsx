"use client";

import { CheckIcon, LoginIcon, UserIcon } from "@animateicons/react/lucide";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { confirmUserAttendance } from "@/actions/attendance.actions";
import { requestAuthSignInOTP } from "@/actions/auth-otp.actions";
import { requestGuestOTP, verifyGuestOTP } from "@/actions/guest-rsvp.actions";
import { createPayment } from "@/actions/payments.actions";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { PaymentMethodCard } from "@/components/arena/payment-method-card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useEvent } from "@/hooks/use-events";
import { useGuestSession } from "@/hooks/use-guest-session";
import { usePublicTeamPaymentSettings } from "@/hooks/use-team-payment-settings";
import { signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/payments";
import {
  getAttendanceErrorMessage,
  getGuestOtpErrorMessage,
} from "../_utils/athlete-rsvp-errors";
import { buildRsvpPaymentConfig } from "../_utils/athlete-rsvp-payment";
import {
  BackButton,
  EmailInput,
  OtpField,
  ResendTimer,
  SubmitBtn,
} from "./athlete-rsvp-fields";

type Step =
  | "choose"
  | "login-email"
  | "login-otp"
  | "guest-info"
  | "guest-otp"
  | "payment"
  | "success"
  | "welcome-back";

interface AthleteRsvpSheetProps {
  eventId: number;
  userId?: string | null;
  onClose: () => void;
  onSuccess: (status: string, reservationId?: number) => void;
  /** When true the user is already confirmed — skip confirmUserAttendance and just fetch reservationId */
  resumePayment?: boolean;
  guestReservationId?: number | null;
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
  const { guest, saveGuest, isLoaded } = useGuestSession();

  const [step, setStep] = useState<Step>("choose");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestOtp, setGuestOtp] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginOtp, setLoginOtp] = useState("");

  const [reservationId, setReservationId] = useState<number | null>(
    guestReservationId,
  );
  const autoConfirmKeyRef = useRef<string | null>(null);

  const { event } = useEvent(eventId);
  const { settings } = usePublicTeamPaymentSettings(event?.teamId);

  // Initial step logic based on user/guest status
  useEffect(() => {
    if (!isLoaded) return;

    if (resumePayment || userId) {
      setStep("payment");
    } else if (guest) {
      setGuestName(guest.name);
      setGuestEmail(guest.email);
      setStep("welcome-back");
    } else {
      setStep("choose");
    }
  }, [resumePayment, userId, guest, isLoaded]);

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
              event?.rosterPriorityHours,
            ),
          );
        }
      });
    }
  }, [
    eventId,
    event?.rosterPriorityHours,
    onSuccess,
    reservationId,
    resumePayment,
    step,
    t,
    userId,
  ]);

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

  async function handleGuestSendOTP(e?: React.FormEvent) {
    if (e) e.preventDefault();
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
      setError(
        getGuestOtpErrorMessage(
          t,
          res,
          t("errors.sendCode"),
          event?.rosterPriorityHours,
        ),
      );
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
      // Persist session
      if (res.guestData) {
        saveGuest(res.guestData);
      }
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
          event?.rosterPriorityHours,
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
    "welcome-back": t("titles.welcomeBack"),
  };

  const paymentConfig = buildRsvpPaymentConfig({
    cashAllowed: !event?.paymentRequired,
    cashInstructions: t("cashInstructions"),
    settings,
  });

  return (
    <BottomSheet title={TITLES[step]} onClose={onClose}>
      <div className="flex flex-col p-5">
        {error && (
          <div className="mb-4 rounded-[10px] bg-arena-danger/10 p-3 text-[13px] text-arena-danger">
            {error}
          </div>
        )}

        {/* STEP: welcome-back */}
        {step === "welcome-back" && guest && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-[16px] border border-arena-primary/20 bg-arena-primary/5 p-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-arena-primary/10 text-arena-primary ring-1 ring-arena-primary/20">
                <UserIcon size={24} color="currentColor" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-arena-text">
                  {t("welcomeBackGreeting", { name: guest.name })}
                </p>
                <p className="text-[12px] text-arena-text-muted">
                  {guest.email}
                </p>
              </div>
            </div>

            <p className="text-center text-[13px] text-arena-text-muted px-2">
              {t("welcomeBackPrompt")}
            </p>

            <SubmitBtn loading={loading} onClick={() => handleGuestSendOTP()}>
              {t("confirmWithEmail")} <ArrowRight size={16} />
            </SubmitBtn>

            <button
              type="button"
              onClick={() => {
                setStep("choose");
                setGuestName("");
                setGuestEmail("");
              }}
              className="text-center text-[12px] font-medium text-arena-text-muted hover:text-arena-text transition-colors"
            >
              {t("notMe")}
            </button>
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
              onTransferProof={async () => {
                const p = await handlePaymentIntent("transfer");
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
    </BottomSheet>
  );
}
