"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { confirmUserAttendance } from "@/actions/attendance.actions";
import { requestAuthSignInOTP } from "@/actions/auth-otp.actions";
import { requestGuestOTP, verifyGuestOTP } from "@/actions/guest-rsvp.actions";
import { createPayment } from "@/actions/payments.actions";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { ATTENDANCE_STATUS } from "@/constants/attendance";
import { useEvent } from "@/hooks/use-events";
import { useGuestSession } from "@/hooks/use-guest-session";
import { usePublicTeamPaymentSettings } from "@/hooks/use-team-payment-settings";
import { signIn } from "@/lib/auth-client";
import type { PaymentMethod } from "@/types/payments";
import {
  getAttendanceErrorMessage,
  getGuestOtpErrorMessage,
} from "../_utils/athlete-rsvp-errors";
import { buildRsvpPaymentConfig } from "../_utils/athlete-rsvp-payment";
import { ChooseStep, WelcomeBackStep } from "./athlete-rsvp-entry-steps";
import { GuestInfoStep, GuestOtpStep } from "./athlete-rsvp-guest-steps";
import { LoginEmailStep, LoginOtpStep } from "./athlete-rsvp-login-steps";
import { RsvpPaymentStep } from "./athlete-rsvp-payment-step";
import { RsvpSuccessStep } from "./athlete-rsvp-success-step";

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
  eventSlug?: string | null;
  userId?: string | null;
  onClose: () => void;
  onSuccess: (status: string, reservationId?: number) => void;
  resumePayment?: boolean;
  guestReservationId?: number | null;
}

export function AthleteRsvpSheet({
  eventId,
  eventSlug,
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
          if (!resumePayment) onSuccess(ATTENDANCE_STATUS.CONFIRMED);
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
      if (res.guestData) saveGuest(res.guestData);
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
        .trim() || t("defaultName");
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
      router.push(
        `/event/${eventSlug || eventId}/payment/result/${res.data.id}`,
      );
      return res.data;
    } else {
      setError(t("errors.processPayment"));
    }
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

        {step === "welcome-back" && guest && (
          <WelcomeBackStep
            guest={guest}
            loading={loading}
            onConfirm={() => handleGuestSendOTP()}
            onNotMe={() => {
              setStep("choose");
              setGuestName("");
              setGuestEmail("");
            }}
          />
        )}

        {step === "choose" && (
          <ChooseStep
            onGuest={() => {
              clearError();
              setStep("guest-info");
            }}
            onLogin={() => {
              clearError();
              setStep("login-email");
            }}
          />
        )}

        {step === "login-email" && (
          <LoginEmailStep
            loading={loading}
            loginEmail={loginEmail}
            onBack={() => {
              clearError();
              setStep("choose");
            }}
            onLoginEmailChange={setLoginEmail}
            onSubmit={handleLoginSendOTP}
          />
        )}

        {step === "login-otp" && (
          <LoginOtpStep
            loading={loading}
            loginEmail={loginEmail}
            loginOtp={loginOtp}
            onBack={() => {
              clearError();
              setStep("login-email");
            }}
            onLoginOtpChange={setLoginOtp}
            onResend={async () => {
              clearError();
              const result = await requestAuthSignInOTP(loginEmail);
              if (!result.success)
                setError(
                  getGuestOtpErrorMessage(t, result, t("errors.resend")),
                );
            }}
            onSubmit={handleLoginVerifyOTP}
          />
        )}

        {step === "guest-info" && (
          <GuestInfoStep
            guestName={guestName}
            guestEmail={guestEmail}
            loading={loading}
            onNameChange={setGuestName}
            onEmailChange={setGuestEmail}
            onBack={() => {
              clearError();
              setStep("choose");
            }}
            onSubmit={handleGuestSendOTP}
          />
        )}

        {step === "guest-otp" && (
          <GuestOtpStep
            guestEmail={guestEmail}
            guestOtp={guestOtp}
            loading={loading}
            onOtpChange={setGuestOtp}
            onBack={() => {
              clearError();
              setStep("guest-info");
            }}
            onSubmit={handleGuestVerifyOTP}
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
        )}

        {step === "payment" && event && (
          <RsvpPaymentStep
            amountCents={event.priceCents}
            currency={event.currency}
            paymentConfig={paymentConfig}
            onCashIntent={async () => {
              await handlePaymentIntent("cash");
            }}
            onMbwayProof={async () => {
              const p = await handlePaymentIntent("mbway");
              if (p)
                router.push(
                  `/event/${eventSlug || eventId}/payment/result/${p.id}`,
                );
            }}
            onTransferProof={async () => {
              const p = await handlePaymentIntent("transfer");
              if (p)
                router.push(
                  `/event/${eventSlug || eventId}/payment/result/${p.id}`,
                );
            }}
            onPayLater={() => setStep("success")}
          />
        )}

        {step === "success" && (
          <RsvpSuccessStep
            eventId={eventId}
            guestName={guestName}
            guestEmail={guestEmail}
            loginEmail={loginEmail}
            onClose={onClose}
          />
        )}
      </div>
    </BottomSheet>
  );
}
