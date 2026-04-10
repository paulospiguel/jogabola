"use client";

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
import { useState } from "react";
import { DEFAULT_CONFIG, type ClubPageConfig, type ClubTemplate } from "../_contracts/types";
import { ClubInfoForm } from "../components/club-info-form";
import { CustomizerPanel } from "../components/customizer-panel";
import { LivePreview } from "../components/live-preview";
import { TemplateSelector } from "../components/template-selector";

// ─── Step definitions ──────────────────────────────────────────────────────────

type Step = "template" | "info" | "customizer";

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "template", label: "Template", icon: Layers },
  { id: "info", label: "Informações", icon: Sliders },
  { id: "customizer", label: "Identidade Visual", icon: Palette },
];

const STEP_INDICES: Record<Step, number> = {
  template: 0,
  info: 1,
  customizer: 2,
};

// ─── Step Progress Bar ────────────────────────────────────────────────────────

function StepProgress({
  currentStep,
  onStepClick,
}: {
  currentStep: Step;
  onStepClick: (step: Step) => void;
}) {
  const currentIdx = STEP_INDICES[currentStep];

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIdx;
        const isActive = step.id === currentStep;
        const Icon = step.icon;

        return (
          <div key={step.id} className="flex items-center">
            <button
              type="button"
              onClick={() => {
                // Only allow going back to completed steps
                if (i <= currentIdx) onStepClick(step.id);
              }}
              aria-label={`Ir para ${step.label}`}
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
              <span className="hidden sm:block">{step.label}</span>
            </button>
            {i < STEPS.length - 1 && (
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

import Link from "next/link";

function PublishSuccess({ config }: { config: ClubPageConfig }) {
  const slug = config.clubName.toLowerCase().replace(/\s+/g, "-");

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
      <h2 className="text-3xl font-black text-white">Página Publicada! 🎉</h2>
      <p className="mt-2 text-base text-white/60">
        O teu clube está agora visível na plataforma JogaBola.
      </p>
      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-[#24ffe6]/30 bg-[#24ffe6]/10 px-5 py-3">
        <span className="font-mono text-sm text-[#6fffe9]">
          jogabola.com/clube/{slug}
        </span>
        <button
          type="button"
          className="ml-2 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-bold text-white/70 hover:text-white transition-colors"
          onClick={() => navigator.clipboard?.writeText(`https://jogabola.com/clube/${slug}`)}
        >
          Copiar
        </button>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href={`/clube/${slug}`}
          className="rounded-2xl bg-[#24ffe6] px-6 py-3 text-sm font-black text-black shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)] transition-all duration-300 hover:-translate-y-0.5"
        >
          Ver a Minha Página
        </Link>
        <Link
          href="/arena"
          className="rounded-2xl border border-white/20 bg-white/8 px-6 py-3 text-sm font-bold text-white hover:bg-white/12 transition-all duration-200"
        >
          Ir para o Dashboard
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
  const [config, setConfig] = useState<ClubPageConfig>(initialConfig || DEFAULT_CONFIG);
  const [currentStep, setCurrentStep] = useState<Step>("template");
  const [showPreview, setShowPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const currentIdx = STEP_INDICES[currentStep];
  const isLastStep = currentIdx === STEPS.length - 1;

  const patchConfig = (patch: Partial<ClubPageConfig>) => {
    const newConfig = { ...config, ...patch };
    setConfig(newConfig);
    if (onConfigChange) onConfigChange(patch);
  };

  const handleNext = () => {
    if (isLastStep) {
      handlePublish();
      return;
    }
    const nextStep = STEPS[currentIdx + 1].id;
    setCurrentStep(nextStep);
  };

  const handleBack = () => {
    if (currentIdx === 0) return;
    const prevStep = STEPS[currentIdx - 1].id;
    setCurrentStep(prevStep);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1800));
    setIsPublishing(false);
    
    // Save to localStorage for demo purposes
    if (typeof window !== "undefined") {
      localStorage.setItem("club_page_config", JSON.stringify(config));
    }
    
    if (onComplete) {
      onComplete();
    } else {
      setIsPublished(true);
    }
  };

  if (isPublished) {
    return (
      <div className="min-h-screen px-6 py-8 text-white">
        <PublishSuccess config={config} />
      </div>
    );
  }

  return (
    <div className="w-full pb-12 text-white">
      {/* ── Page header ── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.3em] text-[#6fffe9]">
            ⚽ Club Page Builder
          </p>
          <h1 className="text-2xl font-black text-white">Criar Página do Clube</h1>
        </div>

        {/* Step progress */}
        <div className="hidden md:flex">
          <StepProgress currentStep={currentStep} onStepClick={setCurrentStep} />
        </div>

        {/* Preview toggle */}
        <button
          type="button"
          onClick={() => setShowPreview(v => !v)}
          className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white/70 backdrop-blur transition-all duration-200 hover:border-white/25 hover:text-white"
        >
          {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="hidden sm:block">{showPreview ? "Ocultar" : "Pré-visualizar"}</span>
        </button>
      </div>

      {/* Mobile step progress */}
      <div className="mb-6 flex md:hidden">
        <StepProgress currentStep={currentStep} onStepClick={setCurrentStep} />
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
                    Passo 3 de 3
                  </p>
                  <h2 className="text-xl font-black text-white">Identidade Visual</h2>
                  <p className="mt-1 text-sm text-white/50">
                    Faça upload do logo e defina as cores que representam o vosso clube.
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
              Voltar
            </button>

            {/* Progress dots (mobile) */}
            <div className="flex gap-2 md:hidden">
              {STEPS.map((_, i) => (
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
                "flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-black transition-all duration-300 hover:-translate-y-0.5",
                isLastStep
                  ? "bg-[#24ffe6] text-black shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)]"
                  : "bg-[#24ffe6] text-black shadow-[0_16px_45px_-20px_rgba(36,255,230,0.9)]",
                isPublishing && "opacity-80 cursor-not-allowed",
              )}
            >
              {isPublishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Publicando...
                </>
              ) : isLastStep ? (
                <>
                  <Check className="h-4 w-4" />
                  Publicar Página
                </>
              ) : (
                <>
                  Continuar
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
                  Pré-visualização ao Vivo
                </p>
                <span className="ml-auto rounded-full border border-[#24ffe6]/30 bg-[#24ffe6]/10 px-2 py-0.5 text-[9px] font-bold uppercase text-[#24ffe6]">
                  Live
                </span>
              </div>
              <LivePreview config={config} />
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Mobile inline preview toggle feedback ── */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 block lg:hidden"
        >
          <div className="mb-3 flex items-center gap-2">
            <Eye className="h-3.5 w-3.5 text-[#6fffe9]" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6fffe9]/70">
              Pré-visualização
            </p>
          </div>
          <LivePreview config={config} />
        </motion.div>
      )}
    </div>
  );
}
