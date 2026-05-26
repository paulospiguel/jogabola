"use client";

import { LoginIcon, UserIcon } from "@animateicons/react/lucide";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SubmitBtn } from "./athlete-rsvp-fields";

interface GuestIdentity {
  name: string;
  email: string;
}

interface WelcomeBackStepProps {
  guest: GuestIdentity;
  loading: boolean;
  onConfirm: () => void;
  onNotMe: () => void;
}

export function WelcomeBackStep({
  guest,
  loading,
  onConfirm,
  onNotMe,
}: WelcomeBackStepProps) {
  const t = useTranslations("athleteRsvp");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 rounded-[16px] border border-arena-primary/20 bg-arena-primary/5 p-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-arena-primary/10 text-arena-primary ring-1 ring-arena-primary/20">
          <UserIcon size={24} color="currentColor" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-arena-text">
            {t("welcomeBackGreeting", { name: guest.name })}
          </p>
          <p className="text-[12px] text-arena-text-muted">{guest.email}</p>
        </div>
      </div>

      <p className="text-center text-[13px] text-arena-text-muted px-2">
        {t("welcomeBackPrompt")}
      </p>

      <SubmitBtn loading={loading} onClick={onConfirm}>
        {t("confirmWithEmail")} <ArrowRight size={16} />
      </SubmitBtn>

      <button
        type="button"
        onClick={onNotMe}
        className="text-center text-[12px] font-medium text-arena-text-muted hover:text-arena-text transition-colors"
      >
        {t("notMe")}
      </button>
    </div>
  );
}

interface ChooseStepProps {
  onGuest: () => void;
  onLogin: () => void;
}

export function ChooseStep({ onGuest, onLogin }: ChooseStepProps) {
  const t = useTranslations("athleteRsvp");

  return (
    <div className="flex flex-col gap-3">
      <p className="mb-2 text-[13px] text-arena-text-muted">
        {t("choosePrompt")}
      </p>

      <button
        type="button"
        onClick={onLogin}
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
        onClick={onGuest}
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
  );
}
