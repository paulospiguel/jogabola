"use client";

import Lottie from "lottie-react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import SuccessAnimation from "@/assets/lottie/Success.json";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { useCreateEventForm } from "@/hooks/use-create-event-form";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { CreateEventStepConfirm } from "./create-event-step-confirm";
import { CreateEventStepDetails } from "./create-event-step-details";
import { CreateEventStepInvite } from "./create-event-step-invite";
import { CreateEventStepType } from "./create-event-step-type";

interface CreateEventSheetProps {
  onClose: () => void;
  onCreated?: () => void;
  teamId?: number;
}

export function CreateEventSheet({
  onClose,
  onCreated,
  teamId,
}: CreateEventSheetProps) {
  const t = useTranslations("arenaCreateEvent");
  const STEP_TITLES = t.raw("steps") as string[];

  const {
    step,
    setStep,
    form,
    set,
    inputFee,
    searchQuery,
    setSearchQuery,
    sending,
    done,
    error,
    selectedPlayerIds,
    rosterPlayers,
    filteredPlayers,
    canAdvance,
    handleFeeChange,
    handleFeeFocus,
    handleFeeBlur,
    handleSend,
    togglePlayer,
    selectAllPlayers,
    clearAllPlayers,
  } = useCreateEventForm({ teamId, onCreated });

  if (done) {
    return (
      <BottomSheet onClose={onClose}>
        <div className="flex flex-col gap-5 px-5 pt-10 pb-8 items-center text-center">
          <div className="relative flex items-center justify-center size-28 my-3 shrink-0">
            <Lottie
              animationData={SuccessAnimation}
              loop={false}
              className="w-[140px] h-[140px]"
            />
          </div>
          <h2 className="text-xl font-extrabold text-arena-text tracking-tight">
            {t("success")}
          </h2>
          <p className="text-sm text-arena-text-muted max-w-[280px] leading-relaxed">
            {selectedPlayerIds.length > 0
              ? t.rich("final.successSent", {
                  count: selectedPlayerIds.length,
                  strongComponent: chunks => (
                    <span className="font-extrabold text-[#7CFF4F]">
                      {chunks}
                    </span>
                  ),
                })
              : t("successSubtitle")}
          </p>
          <Button
            type="button"
            onClick={onClose}
            className="press mt-4 h-11 w-full rounded-xl border border-arena-border bg-arena-surface text-xs font-bold text-arena-text-sec transition-all hover:bg-arena-surface-el"
          >
            {t("actions.close")}
          </Button>
        </div>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet onClose={onClose} noPad>
      {/* Step indicator */}
      <div className="shrink-0 px-5 border-b border-arena-border/20">
        <div className="flex gap-2.5 py-4">
          {[0, 1, 2, 3].map(s => (
            <div
              key={s}
              className={cn(
                "h-1 rounded-full flex-1 transition-all duration-300",
                s <= step
                  ? "bg-[#7CFF4F] shadow-[0_0_8px_rgba(124,255,79,0.3)]"
                  : "bg-arena-border/50",
              )}
            />
          ))}
        </div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[15px] font-black text-arena-text">
            {STEP_TITLES[step] || t("createEventTitle")}
          </p>
          <span className="text-[11px] font-bold text-arena-text-muted">
            {step + 1} / 4
          </span>
        </div>
      </div>

      {/* Step content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4 max-h-[64vh]">
        {step === 0 && (
          <CreateEventStepType
            type={form.type}
            title={form.title}
            set={set}
            t={t}
          />
        )}

        {step === 1 && (
          <CreateEventStepDetails
            form={form}
            inputFee={inputFee}
            set={set}
            onFeeChange={handleFeeChange}
            onFeeFocus={handleFeeFocus}
            onFeeBlur={handleFeeBlur}
            t={t}
          />
        )}

        {step === 2 && (
          <CreateEventStepInvite
            rosterPlayers={rosterPlayers}
            filteredPlayers={filteredPlayers}
            selectedPlayerIds={selectedPlayerIds}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onTogglePlayer={togglePlayer}
            onSelectAll={selectAllPlayers}
            onClearAll={clearAllPlayers}
            t={t}
          />
        )}

        {step === 3 && (
          <CreateEventStepConfirm
            form={form}
            rosterPlayers={rosterPlayers}
            selectedPlayerIds={selectedPlayerIds}
            error={error}
            t={t}
          />
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex shrink-0 gap-2.5 px-5 pt-3 pb-5 border-t border-arena-border/10">
        {step > 0 && (
          <Button
            className="press h-12 flex-1 rounded-xl border border-arena-border bg-[#0B0F14]/30 text-xs font-bold text-arena-text-sec hover:bg-arena-surface-el transition-all"
            onClick={() => setStep(s => s - 1)}
            type="button"
            variant="outline"
          >
            {t("actions.back")}
          </Button>
        )}
        <Button
          className={cn(
            "press h-12 flex-[2] rounded-xl text-xs font-black transition-all gap-2",
            canAdvance
              ? step === 3
                ? "bg-[#7CFF4F] text-[#0B0F14] hover:bg-[#7CFF4F]/95 shadow-[0_0_24px_rgba(124,255,79,0.22)]"
                : "bg-arena-primary text-arena-bg hover:bg-arena-primary/95"
              : "cursor-not-allowed bg-arena-border text-arena-text-muted opacity-100",
          )}
          disabled={!canAdvance || sending}
          onClick={step < 3 ? () => setStep(s => s + 1) : handleSend}
          type="button"
        >
          {sending && <Loader2 className="animate-spin size-3.5" />}
          {step === 3 ? (
            <span>{t("final.sendCallup")}</span>
          ) : (
            <span>{t("actions.continue")}</span>
          )}
        </Button>
      </div>
    </BottomSheet>
  );
}
