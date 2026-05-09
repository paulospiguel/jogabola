"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Check, ChevronRight, Lock } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  completeOnboarding,
  type UserRole,
} from "@/actions/onboarding.actions";
import coachIcon from "@/assets/images/jb-coach.png";
import playerIcon from "@/assets/images/jb-player.png";
import jbIconReferee from "@/assets/images/jb-referee.png";
import { APP } from "@/constants/app";
import { cn } from "@/lib/utils";

interface RoleCardProps {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
  badge?: string;
  disabled?: boolean;
  selected: boolean;
  onClick: () => void;
}

function RoleCard({
  icon,
  eyebrow,
  title,
  description,
  features,
  badge,
  disabled,
  selected,
  onClick,
}: RoleCardProps) {
  const t = useTranslations("onboarding.badge");

  return (
    <div className="relative w-full h-full">
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={cn(
          "group h-full w-full overflow-hidden rounded-[18px] border p-5 text-left transition-all duration-300",
          disabled
            ? "cursor-not-allowed border-arena-border/55 bg-arena-bg/45 opacity-55"
            : selected
              ? "border-arena-primary/60 bg-arena-primary/10 shadow-[0_0_34px_rgba(124,255,79,.14)]"
              : "border-arena-border bg-arena-surface/72 hover:border-arena-primary/35 hover:bg-arena-surface-el/72",
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
            selected &&
            "opacity-100 bg-[radial-gradient(circle_at_18%_12%,rgba(124,255,79,.18),transparent_36%),radial-gradient(circle_at_88%_100%,rgba(56,189,248,.10),transparent_42%)]",
          )}
        />

        {badge && (
          <span className="absolute top-4 right-4 rounded-full border border-arena-border bg-arena-bg/70 px-2.5 py-1 text-[10px] font-bold tracking-widest text-arena-text-muted uppercase">
            {badge}
          </span>
        )}

        {disabled && (
          <span className="absolute z-10 -top-4 -right-4 flex items-center gap-1 rounded-full border border-arena-border bg-arena-surface/80 px-2.5 py-1 text-[10px] font-bold tracking-wider text-arena-text-muted uppercase">
            <Lock size={9} />
            {t("soon")}
          </span>
        )}

        <div className="relative flex items-start gap-4">
          <div
            className={cn(
              "flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border transition-all duration-300",
              selected
                ? "border-arena-primary/45 bg-arena-primary/15 shadow-[0_0_28px_rgba(124,255,79,.18)]"
                : "border-arena-border bg-arena-bg/65 group-hover:border-arena-primary/35",
            )}
          >
            {icon}
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <p className="mb-2 text-[10px] font-extrabold tracking-[0.16em] text-arena-primary uppercase">
              {eyebrow}
            </p>
            <h3 className="mb-2 font-sora text-xl font-extrabold text-arena-text">
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-arena-text-sec">
              {description}
            </p>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {selected && !disabled && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -4 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="relative overflow-hidden"
            >
              <div className="mt-5 border-t border-arena-primary/20 pt-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-extrabold tracking-[0.16em] text-arena-primary uppercase">
                    {t("selected")}
                  </span>
                  <span className="h-px flex-1 bg-linear-to-r from-arena-primary/45 to-transparent" />
                </div>
                <ul className="grid gap-2">
                  {features.map(f => (
                    <li
                      key={f}
                      className="flex items-center gap-3 rounded-[10px] border border-arena-border/75 bg-arena-bg/56 px-3 py-2 text-xs font-semibold text-arena-text-sec"
                    >
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-arena-primary text-[#0B0F14]">
                        <Check size={12} strokeWidth={2.6} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selected && !disabled && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-arena-primary/35 bg-arena-primary/12 px-2.5 py-1 text-xs font-semibold text-arena-primary">
            <Check size={12} />
          </div>
        )}
      </button>
    </div>
  );
}

interface OnboardingClientProps {
  userName: string;
}

export function OnboardingClient({ userName }: OnboardingClientProps) {
  const t = useTranslations("onboarding");
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coachIconElement = (
    <Image
      src={coachIcon}
      alt="Coach"
      width={64}
      height={64}
      className="h-full w-full object-contain"
    />
  );
  const playerIconElement = (
    <Image
      src={playerIcon}
      alt="Player"
      width={64}
      height={64}
      className="h-full w-full object-contain"
    />
  );
  const refereeIconElement = (
    <div className="relative flex size-full items-center justify-center">
      <Image
        src={jbIconReferee}
        alt="Referee"
        width={64}
        height={64}
        className="h-full w-full object-contain"
      />
      {/* <BadgeCheck className="absolute right-2 bottom-2 size-5 text-arena-primary" /> */}
    </div>
  );

  const APP_NAME = APP.APP_NAME;

  const firstName = userName.split(" ")[0];

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);
    setError(null);

    try {
      const result = await completeOnboarding(selected);
      if (!result.success) {
        setError(t("errors.save"));
        return;
      }
      window.location.href = "/arena";
    } catch {
      setError(t("errors.unexpected"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06090D] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(124,255,79,.10),transparent_32%),radial-gradient(circle_at_82%_72%,rgba(56,189,248,.08),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(38,50,68,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(38,50,68,.18)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40 [mask-image:radial-gradient(circle_at_center,black_25%,transparent_78%)]" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-4xl"
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#7CFF4F]/20 bg-[#7CFF4F]/8 px-3 py-1">
            <span className="size-1.5 rounded-full bg-[#7CFF4F] animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-[#7CFF4F] uppercase">
              {t("header.welcome", { appName: APP_NAME })}
            </span>
          </div>
          <h1 className="mb-2 font-sora text-3xl font-extrabold tracking-tight text-white">
            {t("header.greeting", { name: firstName })}
          </h1>
          <p className="text-sm text-white/45">{t("header.description")}</p>
        </div>

        {/* Role cards */}
        <div className="mb-8 grid gap-4 lg:grid-cols-3">
          <RoleCard
            icon={coachIconElement}
            eyebrow={t("roles.coach.eyebrow")}
            title={t("roles.coach.title")}
            description={t("roles.coach.description")}
            features={t.raw("roles.coach.features")}
            selected={selected === "captain"}
            onClick={() => setSelected("captain")}
          />

          <RoleCard
            icon={playerIconElement}
            eyebrow={t("roles.athlete.eyebrow")}
            title={t("roles.athlete.title")}
            description={t("roles.athlete.description")}
            features={t.raw("roles.athlete.features")}
            disabled
            selected={selected === "athlete"}
            onClick={() => setSelected("athlete")}
          />

          <RoleCard
            icon={refereeIconElement}
            eyebrow={t("roles.referee.eyebrow")}
            title={t("roles.referee.title")}
            description={t("roles.referee.description")}
            features={t.raw("roles.referee.features")}
            disabled
            selected={false}
            onClick={() => undefined}
          />
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 text-center text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selected || loading}
            className={[
              "flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all duration-200",
              selected && !loading
                ? "bg-[#7CFF4F] text-black hover:bg-[#7CFF4F]/90 shadow-[0_0_20px_rgba(124,255,79,0.25)]"
                : "cursor-not-allowed bg-white/8 text-white/25",
            ].join(" ")}
          >
            {loading ? t("cta.saving") : t("cta.continue")}
            {!loading && <ChevronRight size={16} />}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          {t("footer.changeLater")}
        </p>
      </motion.div>
    </div>
  );
}
