"use client";

import { CheckIcon } from "@animateicons/react/lucide";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface RsvpSuccessStepProps {
  eventId: number;
  eventSlug?: string | null;
  guestName: string;
  guestEmail: string;
  loginEmail: string;
  onClose: () => void;
}

export function RsvpSuccessStep({
  eventId,
  eventSlug,
  guestName,
  guestEmail,
  loginEmail,
  onClose,
}: RsvpSuccessStepProps) {
  const t = useTranslations("athleteRsvp");
  const registerEmail = guestEmail || loginEmail;

  return (
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
          href={`/auth?mode=register&email=${encodeURIComponent(registerEmail)}&callbackURL=/event/${eventSlug || eventId}`}
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
  );
}
