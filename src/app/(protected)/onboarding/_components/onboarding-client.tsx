"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronRight, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  completeOnboarding,
  type UserRole,
} from "@/actions/onboarding.actions";
import coachIcon from "@/assets/images/jb-coach.png";
import playerIcon from "@/assets/images/jb-player.png";
import { APP } from "@/constants/app";

interface RoleCardProps {
  icon: React.ReactNode;
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
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        "relative w-full rounded-2xl border p-6 text-left transition-all duration-200",
        disabled
          ? "cursor-not-allowed border-white/8 bg-white/3 opacity-50"
          : selected
            ? "border-[#7CFF4F]/60 bg-[#7CFF4F]/8 shadow-[0_0_24px_rgba(124,255,79,0.08)]"
            : "border-white/12 bg-white/5 hover:border-white/24 hover:bg-white/8",
      ].join(" ")}
    >
      {badge && (
        <span className="absolute top-4 right-4 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest text-white/40 uppercase">
          {badge}
        </span>
      )}

      {disabled && (
        <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-white/30 uppercase">
          <Lock size={9} />
          {t("soon")}
        </span>
      )}

      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-white/8">
        {icon}
      </div>

      <h3 className="mb-1.5 text-base font-bold text-white">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-white/50">
        {description}
      </p>

      <ul className="space-y-2">
        {features.map(f => (
          <li key={f} className="flex items-center gap-2 text-xs text-white/40">
            <span className="size-1 rounded-full bg-[#7CFF4F]/50 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {selected && !disabled && (
        <div className="mt-4 flex absolute top-0 right-4 items-center gap-1.5 text-xs font-semibold text-[#7CFF4F]">
          <Check size={12} />
        </div>
      )}
    </button>
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
    <img
      src={coachIcon.src}
      alt="Coach"
      className="w-full h-full object-contain"
    />
  );
  const playerIconElement = (
    <img
      src={playerIcon.src}
      alt="Player"
      className="w-full h-full object-contain"
    />
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
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#7CFF4F]/20 bg-[#7CFF4F]/8 px-3 py-1">
            <span className="size-1.5 rounded-full bg-[#7CFF4F] animate-pulse" />
            <span className="text-xs font-semibold tracking-widest text-[#7CFF4F] uppercase">
              {t("header.welcome", { appName: APP_NAME })}
            </span>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">
            {t("header.greeting", { name: firstName })}
          </h1>
          <p className="text-sm text-white/45">{t("header.description")}</p>
        </div>

        {/* Role cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <RoleCard
            icon={coachIconElement}
            title={t("roles.coach.title")}
            description={t("roles.coach.description")}
            features={t.raw("roles.coach.features")}
            selected={selected === "captain"}
            onClick={() => setSelected("captain")}
          />

          <RoleCard
            icon={playerIconElement}
            title={t("roles.athlete.title")}
            description={t("roles.athlete.description")}
            features={t.raw("roles.athlete.features")}
            disabled
            selected={selected === "athlete"}
            onClick={() => setSelected("athlete")}
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
