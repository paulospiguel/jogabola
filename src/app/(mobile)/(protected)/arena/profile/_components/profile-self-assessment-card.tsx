"use client";

import { ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface ProfileSelfAssessmentCardProps {
  rating: { overall: number; primaryPosition: string } | null;
}

export function ProfileSelfAssessmentCard({
  rating,
}: ProfileSelfAssessmentCardProps) {
  const t = useTranslations("arenaSelfAssessment");

  if (rating) {
    return (
      <Link
        href="/arena/profile/self-assessment"
        className="group flex items-center justify-between rounded-[16px] border border-arena-border bg-arena-surface p-3.5 transition-colors active:bg-arena-surface-el/40"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-arena-primary/40 bg-arena-primary/12 text-arena-primary">
            <Sparkles className="size-5" strokeWidth={1.8} />
          </div>
          <div>
            <span className="block text-sm font-bold text-arena-text">
              {t("card.title")}
            </span>
            <span className="mt-0.5 block text-xs text-arena-text-muted">
              {t("card.ratedSub", {
                position: t(`positions.${rating.primaryPosition}.label`),
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-sora text-[20px] font-extrabold leading-none text-arena-primary tabular-nums">
            {rating.overall.toFixed(1)}
          </span>
          <ChevronRight size={16} className="text-arena-text-muted" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      href="/arena/profile/self-assessment"
      className="group relative block overflow-hidden rounded-[16px] border border-arena-primary/40 bg-arena-primary/8 p-4 transition-colors active:bg-arena-primary/12"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(124,255,79,.16),transparent_42%)]" />
      <div className="relative flex items-center gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-arena-primary/45 bg-arena-primary/15 text-arena-primary shadow-[0_0_24px_rgba(124,255,79,.18)]">
          <Sparkles className="size-5" strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-arena-text">
            {t("card.emptyTitle")}
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-arena-text-sec">
            {t("card.emptySub")}
          </span>
        </div>
        <ChevronRight
          size={18}
          className="shrink-0 text-arena-primary transition-transform group-active:translate-x-0.5"
        />
      </div>
    </Link>
  );
}
