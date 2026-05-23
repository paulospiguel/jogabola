"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Users } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  completeOnboarding,
  saveSurvey,
  type UserRole,
} from "@/actions/onboarding.actions";
import coachIcon from "@/assets/images/jb-coach.png";
import playerIcon from "@/assets/images/jb-player.png";
import jbIconReferee from "@/assets/images/jb-referee.png";
import { Cta } from "@/components/arena/cta";
import { ProgressBar } from "@/components/arena/progress-bar";
import { APP } from "@/constants/app";
import { cn } from "@/lib/utils";
import { OnboardingMenu } from "./onboarding-menu";
import { SurveyStep } from "./survey-step";

type Step = "role" | "survey";

interface RoleCardLargeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}

function RoleCardLarge({
  icon,
  title,
  description,
  selected,
  disabled,
  onClick,
}: RoleCardLargeProps) {
  const t = useTranslations("onboarding");

  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "group relative w-full overflow-hidden rounded-[18px] border p-4 text-left transition-all duration-300",
        disabled
          ? "cursor-not-allowed border-dashed border-arena-border/45 bg-arena-bg/30 opacity-55"
          : selected
            ? "cursor-pointer border-arena-primary bg-arena-primary/10 shadow-[0_0_34px_rgba(124,255,79,.14)]"
            : "cursor-pointer border-arena-border bg-arena-surface/80 hover:border-arena-primary/35 hover:bg-arena-surface-el/80",
      )}
    >
      {selected && !disabled && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(124,255,79,.18),transparent_36%),radial-gradient(circle_at_88%_100%,rgba(56,189,248,.10),transparent_42%)]" />
      )}

      {disabled && (
        <span className="absolute top-3 right-3 rounded-full border border-arena-border/60 bg-arena-surface/80 px-2 py-0.5 text-[10px] font-bold tracking-[0.14em] text-arena-text-muted uppercase">
          {t("badge.soon")}
        </span>
      )}

      {selected && !disabled && (
        <span className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-full bg-arena-primary text-arena-bg">
          <Check size={13} strokeWidth={2.8} />
        </span>
      )}

      <div className="relative flex items-center gap-4">
        <div
          className={cn(
            "flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] border transition-all duration-300",
            disabled
              ? "border-arena-border/40 bg-arena-bg/50"
              : selected
                ? "border-arena-primary/45 bg-arena-primary/15 shadow-[0_0_28px_rgba(124,255,79,.18)]"
                : "border-arena-border bg-arena-bg/65 group-hover:border-arena-primary/35",
          )}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "font-sora text-[17px] font-extrabold leading-snug transition-colors duration-200",
              disabled ? "text-arena-text/55" : "text-arena-text",
            )}
          >
            {title}
          </h3>
          <p className="mt-0.5 text-[12px] leading-relaxed text-arena-text-sec">
            {description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

interface RoleCardSmallProps {
  icon: React.ReactNode;
  title: string;
}

function RoleCardSmall({ icon, title }: RoleCardSmallProps) {
  const t = useTranslations("onboarding");

  return (
    <div className="relative flex cursor-not-allowed flex-col items-center gap-2.5 overflow-hidden rounded-[16px] border border-dashed border-arena-border/45 bg-arena-bg/30 px-3 py-4 opacity-55 transition-opacity">
      <div className="flex size-12 items-center justify-center overflow-hidden rounded-[12px] border border-arena-border/40 bg-arena-bg/50">
        {icon}
      </div>

      <span className="text-[13px] font-semibold text-arena-text/55">
        {title}
      </span>

      <span className="rounded-full border border-arena-border/60 bg-arena-surface/80 px-2 py-0.5 text-[9px] font-bold tracking-[0.14em] text-arena-text-muted uppercase">
        {t("badge.soon")}
      </span>
    </div>
  );
}

interface OnboardingClientProps {
  userName: string;
}

export function OnboardingClient({ userName }: OnboardingClientProps) {
  const t = useTranslations("onboarding");
  const [step, setStep] = useState<Step>("role");
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const APP_NAME = APP.APP_NAME;

  const coachIconEl = (
    <Image
      src={coachIcon}
      alt="Coach"
      width={56}
      height={56}
      className="h-full w-full object-contain"
    />
  );

  const playerIconEl = (
    <Image
      src={playerIcon}
      alt="Player"
      width={56}
      height={56}
      className="h-full w-full object-contain"
    />
  );

  const refereeIconEl = (
    <Image
      src={jbIconReferee}
      alt="Referee"
      width={48}
      height={48}
      className="h-full w-full object-contain"
    />
  );

  const fanIconEl = <Users size={24} className="text-arena-text-muted" />;

  async function handleRoleConfirm() {
    if (!selected) return;
    setLoading(true);
    setError(null);

    try {
      const result = await completeOnboarding(selected);
      if (!result.success) {
        setError(t("errors.save"));
        return;
      }
      setStep("survey");
    } catch {
      setError(t("errors.unexpected"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSurveySubmit(intentions: string[], context: string) {
    setError(null);
    let errorMessage = t("errors.unexpected");

    try {
      const result = await saveSurvey({ intentions, context });
      if (!result.success) {
        errorMessage = t("errors.surveySave");
        throw new Error("Survey save failed");
      }
      window.location.href = "/arena";
    } catch {
      setError(errorMessage);
      throw new Error("Survey save failed");
    }
  }

  function handleSurveySkip() {
    window.location.href = "/arena";
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-arena-bg px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(124,255,79,.10),transparent_32%),radial-gradient(circle_at_82%_72%,rgba(56,189,248,.08),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(38,50,68,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(38,50,68,.18)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40 [mask-image:radial-gradient(circle_at_center,black_25%,transparent_78%)]" />

      <div className="absolute top-4 right-4 z-50">
        <OnboardingMenu />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-[480px]"
      >
        <div className="mb-6">
          <ProgressBar
            value={step === "role" ? 50 : 100}
            max={100}
            showPercent={false}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === "role" ? (
            <motion.div
              key="role"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="mb-8 px-1">
                <p className="mb-1.5 text-[10px] font-bold tracking-[0.16em] text-arena-text-muted uppercase">
                  {t("header.eyebrow")}
                </p>
                <h1 className="mb-2 font-sora text-[28px] font-extrabold lowercase leading-none tracking-tight text-arena-text">
                  {APP_NAME.toLowerCase()}
                </h1>
                <p className="mb-1 text-[13px] font-semibold text-arena-text">
                  {t("header.greeting", { name: userName })}
                </p>
                <p className="text-[13px] text-arena-text-sec">
                  {t("header.description")}
                </p>
              </div>

              <div className="mb-5 flex flex-col gap-3">
                <RoleCardLarge
                  icon={coachIconEl}
                  title={t("roles.coach.title")}
                  description={t("roles.coach.description")}
                  selected={selected === "captain"}
                  onClick={() => setSelected("captain")}
                />

                <RoleCardLarge
                  icon={playerIconEl}
                  title={t("roles.athlete.title")}
                  description={t("roles.athlete.description")}
                  selected={false}
                  disabled
                  onClick={() => undefined}
                />
              </div>

              <div className="mb-7 grid grid-cols-2 gap-3">
                <RoleCardSmall
                  icon={refereeIconEl}
                  title={t("roles.referee.title")}
                />
                <RoleCardSmall icon={fanIconEl} title={t("roles.fan.title")} />
              </div>

              <Cta
                type="button"
                onClick={handleRoleConfirm}
                disabled={!selected || loading}
                fullWidth
                size="lg"
                className={cn(
                  selected &&
                    !loading &&
                    "shadow-[0_0_20px_rgba(124,255,79,0.25)]",
                )}
              >
                {loading ? t("cta.saving") : t("cta.continue")}
              </Cta>

              <p className="mt-5 text-center text-[11px] text-arena-text-muted/60">
                {t("footer.changeLater")}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="survey"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            >
              <SurveyStep
                role={selected ?? "captain"}
                onSubmit={handleSurveySubmit}
                onSkip={handleSurveySkip}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 text-center text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
