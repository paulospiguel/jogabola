"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { UserRole } from "@/actions/onboarding.actions";
import { Cta } from "@/components/arena/cta";
import { cn } from "@/lib/utils";

const INTENTION_OPTIONS = [
  "organize_games",
  "payments",
  "grow_team",
  "stats",
  "communication",
  "competitions",
] as const;

const CONTEXT_OPTIONS = [
  "new_team",
  "casual",
  "league",
  "migrated",
  "manual",
] as const;

type IntentionSlug = (typeof INTENTION_OPTIONS)[number];
type ContextSlug = (typeof CONTEXT_OPTIONS)[number];

interface SurveyStepProps {
  role: UserRole;
  onSubmit: (intentions: string[], context: string) => Promise<void>;
  onSkip: () => void;
}

interface TagChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function TagChip({ label, selected, onClick }: TagChipProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "rounded-[10px] border px-3 py-2.5 text-left text-[12px] font-semibold leading-snug transition-all duration-200",
        selected
          ? "border-arena-primary bg-arena-primary/10 text-arena-primary shadow-[0_0_22px_rgba(124,255,79,.10)]"
          : "border-arena-border bg-arena-surface text-arena-text-sec hover:border-arena-primary/40 hover:bg-arena-surface-el",
      )}
    >
      {label}
    </motion.button>
  );
}

export function SurveyStep({ role, onSubmit, onSkip }: SurveyStepProps) {
  const t = useTranslations("onboarding.survey");
  const [intentions, setIntentions] = useState<string[]>([]);
  const [context, setContext] = useState<ContextSlug | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleIntention(slug: IntentionSlug) {
    setIntentions(current => {
      if (current.includes(slug)) {
        return current.filter(item => item !== slug);
      }
      if (current.length >= 3) return current;
      return [...current, slug];
    });
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await onSubmit(intentions, context ?? "");
    } catch {
      // Error copy is rendered by the parent onboarding shell.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative w-full max-w-[480px]" data-role={role}>
      <div className="mb-8 flex items-center justify-between px-1">
        <div>
          <p className="mb-1.5 text-[10px] font-bold tracking-[0.16em] text-arena-text-muted uppercase">
            {t("eyebrow")}
          </p>
          <h1 className="font-sora text-[26px] font-extrabold leading-tight text-arena-text">
            {t("header")}
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-arena-text-sec">
            {t("tagline")}
          </p>
        </div>

        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-arena-primary" />
          <span className="h-1.5 w-5 rounded-full bg-arena-primary" />
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="font-sora text-[15px] font-bold text-arena-text">
              {t("q1Label")}
            </h2>
            <span className="shrink-0 text-[10px] font-bold tracking-[0.12em] text-arena-text-muted uppercase">
              {t("q1Hint")}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {INTENTION_OPTIONS.map(slug => (
              <TagChip
                key={slug}
                label={t(`intentions.${slug}`)}
                selected={intentions.includes(slug)}
                onClick={() => toggleIntention(slug)}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-sora text-[15px] font-bold text-arena-text">
            {t("q2Label")}
          </h2>

          <div className="grid grid-cols-1 gap-2.5">
            {CONTEXT_OPTIONS.map(slug => (
              <TagChip
                key={slug}
                label={t(`context.${slug}`)}
                selected={context === slug}
                onClick={() => setContext(slug)}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
        <Cta
          type="button"
          onClick={onSkip}
          disabled={submitting}
          variant="ghost"
          size="lg"
          className="sm:flex-1"
        >
          {t("skip")}
        </Cta>

        <Cta
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          size="lg"
          className="gap-2 shadow-[0_0_20px_rgba(124,255,79,0.25)] sm:flex-1"
        >
          {submitting ? t("submitting") : t("submit")}
          {!submitting && <ArrowRight size={16} strokeWidth={2.5} />}
        </Cta>
      </div>
    </div>
  );
}
