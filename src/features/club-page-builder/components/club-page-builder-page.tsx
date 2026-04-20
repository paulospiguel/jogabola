"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Palette,
  Sliders,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DEFAULT_CONFIG, type ClubPageConfig, type ClubTemplate } from "../_contracts/types";
import { ClubInfoForm } from "../components/club-info-form";
import { CustomizerPanel } from "../components/customizer-panel";
import { LivePreview } from "../components/live-preview";
import { TemplateSelector } from "../components/template-selector";

// ─── Step definitions ──────────────────────────────────────────────────────────

type Step = "template" | "info" | "customizer";

const STEP_IDS: Step[] = ["template", "info", "customizer"];

const STEP_ICONS: Record<Step, React.ElementType> = {
  template: Layers,
  info: Sliders,
  customizer: Palette,
};

const STEP_INDICES: Record<Step, number> = {
  template: 0,
  info: 1,
  customizer: 2,
};

// ─── Step Progress Bar ────────────────────────────────────────────────────────

function StepProgress({
  currentStep,
  onStepClick,
  labels,
}: {
  currentStep: Step;
  onStepClick: (step: Step) => void;
  labels: Record<Step, string>;
  goToStepLabel: (step: string) => string;
}) {
  const currentIdx = STEP_INDICES[currentStep];

  return (
    <div className="flex items-center gap-0">
      {STEP_IDS.map((id, i) => {
        const isCompleted = i < currentIdx;
        const isActive = id === currentStep;
        const Icon = STEP_ICONS[id];

        return (
          <div key={id} className="flex items-center">
            <button
              type="button"
              onClick={() => {
                if (i <= currentIdx) onStepClick(id);
              }}
              aria-label={labels[id]}
              disabled={i > currentIdx}
              className={cn(
                "group flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-bold transition-all duration-200",
                isActive
                  ? "bg-[#24ffe6] text-black"
                  : isCompleted
                  ? "text-[#6fffe9] hover:bg-[#6fffe9]/10 cursor-pointer"
                  : "text-white/30 cursor-not-allowed",
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black border",
                  isActive
                    ? "border-black/20 bg-black/10"
                    : isCompleted
                    ? "border-[#6fffe9]/40 bg-[#6fffe9]/10"
                    : "border-white/10 bg-white/5",
                )}
              >
                {isCompleted ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className="hidden sm:block">{labels[id]}</span>
            </button>
            {i < STEP_IDS.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 mx-1 transition-all duration-500",
                  i < currentIdx ? "bg-[#6fffe9]/50" : "bg-white/10",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Publish Success Screen ────────────────────────────────────────────────────

function PublishSuccess({ config, t }: { config: ClubPageConfig; t: ReturnType<typeof useTranslations> }) {
  const slug = config.clubName.toLowerCase().replace(/\s+/g, "-");
  const url = `https://jogabola.com/clube/${slug}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(url).catch(() => {
      // Clipboard access denied — silently ignore (no toast available here)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center px-6"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-[#24ffe6]/20 blur-2xl" />
        <CheckCircle2 className="relative h-20 w-20 text-[#24ffe6]" />
      </div>
      <h2 className="text-3xl font-black text-white">{t("published.title")}</h2>
      <p className="mt-2 text-base text-white/60">{t("published.subtitle")}</p>
      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#24ffe6]/30 bg-[#24ffe6]/10 px-5 py-3">
        <span className="font-mono text-sm text-[#6fffe9]">
          jogabola.com/clube/{slug}
        </span>
        <button
          type="button"
          className="ml-2 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-bold text-white/70 hover:text-white transition-colors"
          onClick={handleCopy}
        >
          {t("published.copy")}
        </button>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={`/clube/${slug}`}
          className="rounded-2xl bg-[#24ffe6] px-6 py-3 text-sm font-black text-black shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-0.5"
        >
          {t("published.viewPage")}
        </Link>
        <Link
          href="/arena"
          className="rounded-2xl border border-white/20 bg-white/8 px-6 py-3 text-sm font-bold text-white hover:bg-white/12 transition-all duration-200"
        >
          {t("published.dashboard")}
        </Link>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const fadeSlide = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

interface ClubPageBuilderPageProps {
  onComplete?: () => void;
  initialConfig?: ClubPageConfig;
  onConfigChange?: (patch: Partial<ClubPageConfig>) => void;
}

export function ClubPageBuilderPage({ onComplete, initialConfig, onConfigChange }: ClubPageBuilderPageProps) {
  const t = useTranslations("clubPageBuilderPage");
  const [config, setConfig] = useState<ClubPageConfig>(initialConfig ?? DEFAULT_CONFIG);
  const [currentStep, setCurrentStep] = useState<Step>("template");
  const [showPreview, setShowPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const currentIdx = STEP_INDICES[currentStep];
  const isLastStep = currentIdx === STEP_IDS.length - 1;

  const stepLabels: Record<Step, string> = {
    template: t("steps.template"),
    info: t("steps.info"),
    customizer: t("steps.customizer"),
  };

  const patchConfig = (patch: Partial<ClubPageConfig>) => {
    const newConfig = { ...config, ...patch };
    setConfig(newConfig);
    onConfigChange?.(patch);
  };

  const handleNext = () => {
    if (isLastStep) {
      handlePublish();
      return;
    }
    setCurrentStep(STEP_IDS[currentIdx + 1]);
  };

  const handleBack = () => {
    if (currentIdx === 0) return;
    setCurrentStep(STEP_IDS[currentIdx - 1]);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    // TODO: Replace with real API call to persist club page config
    await new Promise<void>(r => setTimeout(r, 1800));
    setIsPublishing(false);
    localStorage.setItem("club_page_config", JSON.stringify(config));

    if (onComplete) {
      onComplete();
    } else {
      setIsPublished(true);
    }
  };

  if (isPublished) {
    return (
      <div className="min-h-screen px-6 py-8 text-white">
        <PublishSuccess config={config} t={t} />
      </div>
    );
  }

  return (
    <div className="w-full pb-12 text-white">
      {/* ── Page header ── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6fffe9]">
            {t("subtitle")}
          </p>
          <h1 className="text-2xl font-black text-white">{t("title")}</h1>
        </div>

        {/* Step progress */}
        <div className="hidden md:flex">
          <StepProgress
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            labels={stepLabels}
            goToStepLabel={(step) => t("goToStep", { step })}
          />
        </div>

        {/* Preview toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(v => !v)}
          className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/70 backdrop-blur transition-all duration-200 hover:border-white/25 hover:text-white"
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="hidden sm:block">
            {showPreview ? t("preview.hide") : t("preview.show")}
          </span>
        </button>
      </div>

      {/* Mobile step progress */}
      <div className="mb-6 flex md:hidden">
        <StepProgress
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          labels={stepLabels}
          goToStepLabel={(step) => t("goToStep", { step })}
        />
      </div>

      {/* ── Main content grid ── */}
      <div
        className={cn(
          "grid gap-8 transition-all duration-500",
          showPreview ? "lg:grid-cols-[1fr_440px]" : "lg:grid-cols-1",
        )}
      >
        {/* ─ Form column ─ */}
        <div>
          <AnimatePresence mode="wait">
            {currentStep === "template" && (
              <motion.div key="template" {...fadeSlide} transition={{ duration: 0.3 }}>
                <TemplateSelector
                  config={config}
                  onTemplateChange={(template: ClubTemplate) => patchConfig({ template })}
                />
              </motion.div>
            )}

            {currentStep === "info" && (
              <motion.div key="info" {...fadeSlide} transition={{ duration: 0.3 }}>
                <ClubInfoForm config={config} onChange={patchConfig} />
              </motion.div>
            )}

            {currentStep === "customizer" && (
              <motion.div key="customizer" {...fadeSlide} transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6fffe9]">
                    {t("customizerStep.step")}
                  </p>
                  <h2 className="text-xl font-black text-white">{t("customizerStep.title")}</h2>
                  <p className="mt-1 text-sm text-white/50">
                    {t("customizerStep.description")}
                  </p>
                </div>
                <div className="rounded-3xl border border-white/8 bg-white/3 p-6 backdrop-blur">
                  <CustomizerPanel config={config} onChange={patchConfig} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─ Navigation buttons ─ */}
          <div className="mt-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentIdx === 0}
              className={cn(
                "flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold backdrop-blur transition-all duration-200",
                currentIdx === 0
                  ? "cursor-not-allowed opacity-40"
                  : "hover:border-white/25 hover:bg-white/8 text-white",
              )}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("nav.back")}
            </button>

            {/* Progress dots (mobile) */}
            <div className="flex gap-2 md:hidden">
              {STEP_IDS.map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: static steps
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    i === currentIdx ? "w-6 bg-[#24ffe6]" : i < currentIdx ? "w-3 bg-[#6fffe9]/40" : "w-3 bg-white/15",
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={isPublishing}
              className={cn(
                "flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black transition-all duration-300 hover:-translate-y-0.5 bg-[#24ffe6] text-black shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)]",
                isPublishing && "opacity-80 cursor-not-allowed",
              )}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("nav.publishing")}
                </>
              ) : isLastStep ? (
                <>
                  <Check className="h-4 w-4" />
                  {t("nav.publish")}
                </>
              ) : (
                <>
                  {t("nav.next")}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ─ Preview column ─ */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.4 }}
            className="hidden lg:block"
          >
            <div className="sticky top-24">
              <div className="mb-3 flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-[#6fffe9]" />
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6fffe9]/70">
                  {t("preview.live")}
                </p>
                <span className="ml-auto rounded-full border border-[#24ffe6]/30 bg-[#24ffe6]/10 px-2 py-0.5 text-[9px] font-bold uppercase text-[#24ffe6]">
                  {t("preview.liveLabel")}
                </span>
              </div>
              <LivePreview config={config} />
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Mobile inline preview ── */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 block lg:hidden"
        >
          <div className="mb-3 flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-[#6fffe9]" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6fffe9]/70">
              {t("preview.show")}
            </p>
          </div>
          <LivePreview config={config} />
        </motion.div>
      )}
    </div>
  );
}
