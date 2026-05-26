"use client";

import { CheckIcon, UserIcon } from "@animateicons/react/lucide";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  BackButton,
  EmailInput,
  OtpField,
  ResendTimer,
  SubmitBtn,
} from "./athlete-rsvp-fields";

interface GuestInfoStepProps {
  guestName: string;
  guestEmail: string;
  loading: boolean;
  onNameChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function GuestInfoStep({
  guestName,
  guestEmail,
  loading,
  onNameChange,
  onEmailChange,
  onBack,
  onSubmit,
}: GuestInfoStepProps) {
  const t = useTranslations("athleteRsvp");

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <BackButton label={t("back")} onClick={onBack} />
      <p className="text-[13px] text-arena-text-muted">{t("noAccount")}</p>

      <InputGroup className="h-[50px] rounded-[12px] border-arena-border">
        <InputGroupInput
          type="text"
          value={guestName}
          onChange={e => onNameChange(e.target.value)}
          placeholder="Nome completo"
          required
          autoComplete="name"
        />
        <InputGroupAddon>
          <UserIcon size={17} color="currentColor" />
        </InputGroupAddon>
      </InputGroup>

      <EmailInput value={guestEmail} onChange={onEmailChange} />

      <SubmitBtn loading={loading}>
        {t("receivePin")} <ArrowRight size={16} />
      </SubmitBtn>

      <p className="text-center text-[10px] text-arena-text-muted">
        {t("terms.prefix")}{" "}
        <Link href="/terms" className="underline hover:text-arena-text transition-colors">
          {t("terms.terms")}
        </Link>{" "}
        {t("terms.and")}{" "}
        <Link href="/privacy" className="underline hover:text-arena-text transition-colors">
          {t("terms.privacy")}
        </Link>
        .
      </p>
    </form>
  );
}

interface GuestOtpStepProps {
  guestEmail: string;
  guestOtp: string;
  loading: boolean;
  onOtpChange: (v: string) => void;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => Promise<void>;
}

export function GuestOtpStep({
  guestEmail,
  guestOtp,
  loading,
  onOtpChange,
  onBack,
  onSubmit,
  onResend,
}: GuestOtpStepProps) {
  const t = useTranslations("athleteRsvp");

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <BackButton label={t("back")} onClick={onBack} />
      <p className="text-[13px] text-arena-text-muted">
        {t("codeSentTo")}{" "}
        <span className="font-semibold text-arena-text-sec">{guestEmail}</span>
      </p>
      <OtpField value={guestOtp} onChange={onOtpChange} />
      <SubmitBtn loading={loading}>
        <CheckIcon size={18} color="currentColor" />
        {t("confirmPresence")}
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
