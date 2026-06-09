"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dumbbell,
  Goal,
  Hand,
  type LucideIcon,
  Send,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { saveSelfAssessment } from "@/actions/player-ratings.actions";
import { Cta } from "@/components/arena/cta";
import { ProgressBar } from "@/components/arena/progress-bar";
import {
  computeOverall,
  OUTFIELD_SKILLS,
  type OutfieldSkill,
  POSITIONS,
  type Position,
  RATING_MAX,
  type SelfAssessment,
} from "@/lib/self-assessment";
import { cn } from "@/lib/utils";

const POSITION_ICONS: Record<Position, LucideIcon> = {
  GK: Hand,
  DEF: Shield,
  MID: Send,
  FWD: Goal,
};

const SKILL_ICONS: Record<OutfieldSkill | "goalkeeping", LucideIcon> = {
  finishing: Goal,
  defense: Shield,
  passing: Send,
  pace: Zap,
  physical: Dumbbell,
  technique: Sparkles,
  goalkeeping: Hand,
};

type SkillKey = OutfieldSkill | "goalkeeping";
type Step =
  | { kind: "intro" }
  | { kind: "position" }
  | { kind: "skill"; skill: SkillKey }
  | { kind: "review" };

interface SelfAssessmentClientProps {
  initial: SelfAssessment | null;
}

function scaleTone(value: number): { key: string; color: string } {
  if (value <= 3) return { key: "weak", color: "#F59E0B" };
  if (value <= 6) return { key: "medium", color: "#38BDF8" };
  if (value <= 8) return { key: "good", color: "#7CFF4F" };
  return { key: "excellent", color: "#7CFF4F" };
}

export function SelfAssessmentClient({ initial }: SelfAssessmentClientProps) {
  const t = useTranslations("arenaSelfAssessment");
  const router = useRouter();

  const [primaryPosition, setPrimaryPosition] = useState<Position | null>(
    initial?.primaryPosition ?? null,
  );
  const [secondaryPosition, setSecondaryPosition] = useState<Position | null>(
    initial?.secondaryPosition ?? null,
  );
  const [skills, setSkills] = useState<Record<SkillKey, number | null>>({
    finishing: initial?.finishing ?? null,
    defense: initial?.defense ?? null,
    passing: initial?.passing ?? null,
    pace: initial?.pace ?? null,
    physical: initial?.physical ?? null,
    technique: initial?.technique ?? null,
    goalkeeping: initial?.goalkeeping ?? null,
  });
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = useMemo<Step[]>(() => {
    const list: Step[] = [{ kind: "intro" }, { kind: "position" }];
    for (const skill of OUTFIELD_SKILLS) {
      list.push({ kind: "skill", skill });
    }
    if (primaryPosition === "GK") {
      list.push({ kind: "skill", skill: "goalkeeping" });
    }
    list.push({ kind: "review" });
    return list;
  }, [primaryPosition]);

  const step = steps[Math.min(index, steps.length - 1)];
  const progress = Math.round((index / (steps.length - 1)) * 100);

  const canAdvance = (() => {
    if (step.kind === "position") return primaryPosition !== null;
    if (step.kind === "skill") return skills[step.skill] !== null;
    return true;
  })();

  function go(next: number) {
    setError(null);
    setDirection(next > index ? 1 : -1);
    setIndex(Math.max(0, Math.min(steps.length - 1, next)));
  }

  function selectPrimary(pos: Position) {
    setPrimaryPosition(pos);
    if (secondaryPosition === pos) setSecondaryPosition(null);
  }

  function toggleSecondary(pos: Position) {
    if (pos === primaryPosition) return;
    setSecondaryPosition(current => (current === pos ? null : pos));
  }

  function setSkill(skill: SkillKey, value: number) {
    setSkills(current => ({ ...current, [skill]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await saveSelfAssessment({
        primaryPosition,
        secondaryPosition,
        finishing: skills.finishing,
        defense: skills.defense,
        passing: skills.passing,
        pace: skills.pace,
        physical: skills.physical,
        technique: skills.technique,
        goalkeeping: primaryPosition === "GK" ? skills.goalkeeping : null,
      });
      if (!res.success) {
        setError(t("errors.save"));
        return;
      }
      router.push("/arena/profile");
      router.refresh();
    } catch {
      setError(t("errors.save"));
    } finally {
      setSaving(false);
    }
  }

  const previewOverall = computeOverall({
    finishing: skills.finishing ?? 0,
    defense: skills.defense ?? 0,
    passing: skills.passing ?? 0,
    pace: skills.pace ?? 0,
    physical: skills.physical ?? 0,
    technique: skills.technique ?? 0,
    goalkeeping: primaryPosition === "GK" ? skills.goalkeeping : null,
  });

  return (
    <div className="relative mx-auto flex min-h-[70vh] w-full max-w-[480px] flex-col px-1 py-4">
      {/* Header */}
      <div className="mb-5 flex items-center gap-3">
        {index > 0 ? (
          <button
            type="button"
            onClick={() => go(index - 1)}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-arena-border bg-arena-surface text-arena-text-sec transition-colors active:scale-95 hover:text-arena-text"
            aria-label={t("actions.back")}
          >
            <ArrowLeft size={17} strokeWidth={2} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/arena/profile")}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-arena-border bg-arena-surface text-arena-text-sec transition-colors active:scale-95 hover:text-arena-text"
            aria-label={t("actions.back")}
          >
            <ArrowLeft size={17} strokeWidth={2} />
          </button>
        )}
        <div className="flex-1">
          <ProgressBar value={progress} max={100} showPercent={false} />
        </div>
        <span className="shrink-0 text-[11px] font-bold tabular-nums text-arena-text-muted">
          {index + 1}/{steps.length}
        </span>
      </div>

      <div className="relative flex-1">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -48 }}
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
          >
            {step.kind === "intro" && (
              <div className="flex flex-col items-center pt-6 text-center">
                <div className="mb-6 flex size-[72px] items-center justify-center rounded-[20px] border border-arena-primary/45 bg-arena-primary/12 shadow-[0_0_40px_rgba(124,255,79,.22)]">
                  <Sparkles
                    size={32}
                    className="text-arena-primary"
                    strokeWidth={1.8}
                  />
                </div>
                <p className="mb-1.5 text-[10px] font-bold tracking-[0.16em] text-arena-text-muted uppercase">
                  {t("intro.eyebrow")}
                </p>
                <h1 className="mb-3 font-sora text-[26px] font-extrabold leading-tight text-arena-text">
                  {t("intro.title")}
                </h1>
                <p className="max-w-[360px] text-[13.5px] leading-relaxed text-arena-text-sec">
                  {t("intro.description")}
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-arena-border bg-arena-surface px-3 py-1.5 text-[11px] font-semibold text-arena-text-muted">
                  <Sparkles size={12} className="text-arena-primary" />
                  {t("intro.estimate")}
                </div>
              </div>
            )}

            {step.kind === "position" && (
              <div>
                <StepHeading
                  eyebrow={t("position.eyebrow")}
                  title={t("position.title")}
                  description={t("position.description")}
                />
                <section className="mb-6">
                  <h2 className="mb-3 font-sora text-[14px] font-bold text-arena-text">
                    {t("position.primaryLabel")}
                  </h2>
                  <div className="grid grid-cols-2 gap-2.5">
                    {POSITIONS.map(pos => {
                      const Icon = POSITION_ICONS[pos];
                      const selected = primaryPosition === pos;
                      return (
                        <PositionChip
                          key={pos}
                          icon={Icon}
                          label={t(`positions.${pos}.label`)}
                          hint={t(`positions.${pos}.hint`)}
                          selected={selected}
                          onClick={() => selectPrimary(pos)}
                        />
                      );
                    })}
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <h2 className="font-sora text-[14px] font-bold text-arena-text">
                      {t("position.secondaryLabel")}
                    </h2>
                    <span className="shrink-0 text-[10px] font-bold tracking-[0.1em] text-arena-text-muted uppercase">
                      {t("position.optional")}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {POSITIONS.map(pos => {
                      const Icon = POSITION_ICONS[pos];
                      const disabled = pos === primaryPosition;
                      const selected = secondaryPosition === pos;
                      return (
                        <PositionChip
                          key={pos}
                          icon={Icon}
                          label={t(`positions.${pos}.label`)}
                          hint={t(`positions.${pos}.hint`)}
                          selected={selected}
                          disabled={disabled}
                          onClick={() => toggleSecondary(pos)}
                        />
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {step.kind === "skill" && (
              <SkillStep
                skill={step.skill}
                value={skills[step.skill]}
                onSelect={value => setSkill(step.skill, value)}
                t={t}
              />
            )}

            {step.kind === "review" && (
              <div>
                <StepHeading
                  eyebrow={t("review.eyebrow")}
                  title={t("review.title")}
                  description={t("review.description")}
                />

                <div className="mb-4 flex items-center justify-between rounded-[16px] border border-arena-primary/35 bg-arena-primary/8 px-4 py-3.5">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.12em] text-arena-text-muted uppercase">
                      {t("review.overallLabel")}
                    </p>
                    <p className="mt-0.5 text-[12px] text-arena-text-sec">
                      {primaryPosition
                        ? t(`positions.${primaryPosition}.label`)
                        : "—"}
                      {secondaryPosition
                        ? ` · ${t(`positions.${secondaryPosition}.label`)}`
                        : ""}
                    </p>
                  </div>
                  <span className="font-sora text-[30px] font-extrabold leading-none text-arena-primary">
                    {previewOverall.toFixed(1)}
                  </span>
                </div>

                <div className="overflow-hidden rounded-[16px] border border-arena-border bg-arena-surface divide-y divide-arena-border/50">
                  {OUTFIELD_SKILLS.map(skill => (
                    <ReviewRow
                      key={skill}
                      icon={SKILL_ICONS[skill]}
                      label={t(`skills.${skill}.label`)}
                      value={skills[skill]}
                    />
                  ))}
                  {primaryPosition === "GK" && (
                    <ReviewRow
                      icon={SKILL_ICONS.goalkeeping}
                      label={t("skills.goalkeeping.label")}
                      value={skills.goalkeeping}
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => go(1)}
                  className="mt-3 w-full text-center text-[12px] font-semibold text-arena-text-muted transition-colors hover:text-arena-text"
                >
                  {t("review.edit")}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center text-sm text-arena-danger"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="mt-6 pt-2">
        {step.kind === "review" ? (
          <Cta
            type="button"
            onClick={handleSave}
            disabled={saving}
            fullWidth
            size="lg"
            className="gap-2 shadow-[0_0_20px_rgba(124,255,79,0.25)]"
          >
            {saving ? t("actions.saving") : t("actions.finish")}
            {!saving && <Check size={16} strokeWidth={2.5} />}
          </Cta>
        ) : (
          <Cta
            type="button"
            onClick={() => go(index + 1)}
            disabled={!canAdvance}
            fullWidth
            size="lg"
            className={cn(
              "gap-2",
              canAdvance && "shadow-[0_0_20px_rgba(124,255,79,0.25)]",
            )}
          >
            {step.kind === "intro" ? t("actions.start") : t("actions.continue")}
            <ArrowRight size={16} strokeWidth={2.5} />
          </Cta>
        )}
      </div>
    </div>
  );
}

function StepHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6">
      <p className="mb-1.5 text-[10px] font-bold tracking-[0.16em] text-arena-text-muted uppercase">
        {eyebrow}
      </p>
      <h1 className="font-sora text-[23px] font-extrabold leading-tight text-arena-text">
        {title}
      </h1>
      <p className="mt-1.5 text-[13px] leading-relaxed text-arena-text-sec">
        {description}
      </p>
    </div>
  );
}

function PositionChip({
  icon: Icon,
  label,
  hint,
  selected,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "flex items-center gap-3 rounded-[12px] border px-3 py-3 text-left transition-all duration-200",
        disabled
          ? "cursor-not-allowed border-dashed border-arena-border/45 bg-arena-bg/30 opacity-45"
          : selected
            ? "border-arena-primary bg-arena-primary/10 shadow-[0_0_22px_rgba(124,255,79,.10)]"
            : "border-arena-border bg-arena-surface hover:border-arena-primary/40 hover:bg-arena-surface-el",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-[10px] border transition-colors",
          selected
            ? "border-arena-primary/45 bg-arena-primary/15 text-arena-primary"
            : "border-arena-border bg-arena-bg/60 text-arena-text-sec",
        )}
      >
        <Icon size={17} strokeWidth={2} />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block text-[13px] font-bold leading-snug",
            selected ? "text-arena-primary" : "text-arena-text",
          )}
        >
          {label}
        </span>
        <span className="block truncate text-[10.5px] text-arena-text-muted">
          {hint}
        </span>
      </span>
    </motion.button>
  );
}

function SkillStep({
  skill,
  value,
  onSelect,
  t,
}: {
  skill: SkillKey;
  value: number | null;
  onSelect: (value: number) => void;
  t: ReturnType<typeof useTranslations<"arenaSelfAssessment">>;
}) {
  const Icon = SKILL_ICONS[skill];
  const tone = value != null ? scaleTone(value) : null;

  return (
    <div>
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 flex size-[60px] items-center justify-center rounded-[18px] border border-arena-primary/40 bg-arena-primary/12 text-arena-primary shadow-[0_0_30px_rgba(124,255,79,.16)]">
          <Icon size={26} strokeWidth={1.8} />
        </div>
        <p className="mb-1.5 text-[10px] font-bold tracking-[0.16em] text-arena-text-muted uppercase">
          {t("skill.eyebrow")}
        </p>
        <h1 className="font-sora text-[23px] font-extrabold leading-tight text-arena-text">
          {t(`skills.${skill}.label`)}
        </h1>
        <p className="mt-1.5 max-w-[340px] text-[13px] leading-relaxed text-arena-text-sec">
          {t(`skills.${skill}.description`)}
        </p>
      </div>

      <div className="mb-4 flex h-[52px] items-center justify-center">
        {value != null && tone ? (
          <div className="flex items-baseline gap-2">
            <span
              className="font-sora text-[40px] font-extrabold leading-none"
              style={{ color: tone.color }}
            >
              {value}
            </span>
            <span
              className="text-[13px] font-bold"
              style={{ color: tone.color }}
            >
              {t(`scale.${tone.key}`)}
            </span>
          </div>
        ) : (
          <span className="text-[13px] font-semibold text-arena-text-muted">
            {t("scale.prompt")}
          </span>
        )}
      </div>

      <div className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: RATING_MAX }, (_, i) => i + 1).map(n => {
          const active = value != null && n <= value;
          const isCurrent = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onSelect(n)}
              className={cn(
                "flex h-11 items-center justify-center rounded-[9px] border text-[12px] font-bold transition-all duration-150 active:scale-95",
                isCurrent
                  ? "border-arena-primary bg-arena-primary text-arena-bg"
                  : active
                    ? "border-arena-primary/40 bg-arena-primary/12 text-arena-primary"
                    : "border-arena-border bg-arena-surface text-arena-text-muted hover:border-arena-primary/30 hover:text-arena-text-sec",
              )}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between px-0.5 text-[10px] font-semibold text-arena-text-muted">
        <span>{t("scale.minHint")}</span>
        <span>{t("scale.maxHint")}</span>
      </div>
    </div>
  );
}

function ReviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number | null;
}) {
  const tone = value != null ? scaleTone(value) : null;
  return (
    <div className="flex items-center justify-between px-3.5 py-3">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-[9px] border border-arena-border bg-arena-bg/60 text-arena-text-sec">
          <Icon size={15} strokeWidth={2} />
        </span>
        <span className="text-[13px] font-bold text-arena-text">{label}</span>
      </div>
      <span
        className="font-sora text-[15px] font-extrabold tabular-nums"
        style={{ color: tone?.color ?? "var(--color-arena-text-muted)" }}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}
