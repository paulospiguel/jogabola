"use client";

import { Brain, Users, X, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AiBalancerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (guestsCount: number) => Promise<void>;
  initialGuestsCount?: number;
}

export function AiBalancerModal({
  isOpen,
  onClose,
  onGenerate,
  initialGuestsCount = 0,
}: AiBalancerModalProps) {
  const t = useTranslations("arenaEventDetail.aiBalancer");
  const [guestsCount, setGuestsCount] = useState<number>(initialGuestsCount);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  async function handleGenerate() {
    setIsGenerating(true);
    await onGenerate(guestsCount);
    setIsGenerating(false);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={!isGenerating ? onClose : undefined}
      />

      {/* Modal Content */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-[400px] -translate-x-1/2 -translate-y-1/2 p-5">
        <div className="relative flex flex-col overflow-hidden rounded-[24px] border border-arena-border bg-arena-surface shadow-2xl">
          {/* Top Decorative Header */}
          <div className="relative h-[120px] w-full overflow-hidden bg-gradient-to-br from-[#1c1c1e] to-arena-bg">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-arena-primary opacity-20 blur-3xl" />
            <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-blue-500 opacity-20 blur-3xl" />

            <button
              onClick={onClose}
              disabled={isGenerating}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-black/50"
            >
              <X size={18} />
            </button>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-[18px] border border-arena-primary/30 bg-arena-primary/10 shadow-[0_0_30px_rgba(124,255,79,0.3)] backdrop-blur-md">
                <Brain size={32} className="text-arena-primary" />
              </div>
            </div>
          </div>

          <div className="flex flex-col p-6 pt-5">
            <div className="mb-2 text-center">
              <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-arena-primary/30 bg-arena-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-arena-primary">
                <Zap size={12} className="fill-arena-primary" />
                {t("modalSubtitle")}
              </div>
              <h3 className="text-xl font-bold text-white">
                {t("modalTitle")}
              </h3>
            </div>

            <p className="mb-6 text-center text-sm leading-relaxed text-arena-text-muted">
              {t("pitchDescription")}
            </p>

            <div className="mb-6 rounded-[16px] border border-arena-border bg-arena-bg p-4">
              <label className="mb-2 block text-sm font-semibold text-white">
                {t("guestPrompt")}
              </label>
              <p className="mb-3 text-[12px] text-arena-text-muted">
                {t("guestLabel")}
              </p>
              <div className="flex items-center gap-3">
                <Users size={18} className="text-arena-text-sec" />
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={guestsCount}
                  onChange={e => setGuestsCount(parseInt(e.target.value) || 0)}
                  disabled={isGenerating}
                  className="flex-1 rounded-[12px] border border-arena-border bg-arena-surface px-4 py-2.5 text-white outline-none focus:border-arena-primary focus:ring-1 focus:ring-arena-primary"
                  placeholder="0"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="relative h-[54px] w-full overflow-hidden rounded-[14px] bg-arena-primary text-base font-bold text-arena-bg hover:bg-arena-primary/90"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Brain size={18} className="animate-pulse" />
                  {t("loading")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Zap size={18} className="fill-arena-bg" />
                  {t("balanceAction")}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
