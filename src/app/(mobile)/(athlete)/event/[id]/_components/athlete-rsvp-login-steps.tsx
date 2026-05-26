"use client";

import { CheckIcon } from "@animateicons/react/lucide";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  BackButton,
  EmailInput,
  OtpField,
  ResendTimer,
  SubmitBtn,
} from "./athlete-rsvp-fields";

interface LoginEmailStepProps {
  loading: boolean;
  loginEmail: string;
  onBack: () => void;
  onLoginEmailChange: (email: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function LoginEmailStep({
  loading,
  loginEmail,
  onBack,
  onLoginEmailChange,
  onSubmit,
}: LoginEmailStepProps) {
  const t = useTranslations("athleteRsvp");

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <BackButton label={t("back")} onClick={onBack} />
      <p className="text-[13px] text-arena-text-muted">{t("loginEmailHint")}</p>
      <EmailInput value={loginEmail} onChange={onLoginEmailChange} />
      <SubmitBtn loading={loading}>
        {t("receiveCode")} <ArrowRight size={16} />
      </SubmitBtn>
    </form>
  );
}

interface LoginOtpStepProps {
  loading: boolean;
  loginEmail: string;
  loginOtp: string;
  onBack: () => void;
  onLoginOtpChange: (otp: string) => void;
  onResend: () => Promise<void>;
  onSubmit: (event: React.FormEvent) => void;
}

export function LoginOtpStep({
  loading,
  loginEmail,
  loginOtp,
  onBack,
  onLoginOtpChange,
  onResend,
  onSubmit,
}: LoginOtpStepProps) {
  const t = useTranslations("athleteRsvp");

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <BackButton label={t("back")} onClick={onBack} />
      <p className="text-[13px] text-arena-text-muted">
        {t("codeSentTo")}{" "}
        <span className="font-semibold text-arena-text-sec">{loginEmail}</span>
      </p>
      <OtpField value={loginOtp} onChange={onLoginOtpChange} />
      <SubmitBtn loading={loading}>
        <CheckIcon size={18} color="currentColor" />
        {t("loginAndConfirm")}
      </SubmitBtn>
      <ResendTimer
        loading={loading}
        resendCodeLabel={t("resendCode")}
        resendInLabel={seconds => t("resendIn", { seconds })}
        onResend={onResend}
      />
    </form>
  );
}
