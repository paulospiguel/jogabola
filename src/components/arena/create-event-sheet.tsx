"use client";

import Lottie from "lottie-react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { createEvent } from "@/actions/match-sessions.actions";
import SuccessAnimation from "@/assets/lottie/Success.json";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { useSquad } from "@/hooks/use-squad";
import { useTeamPaymentSettings } from "@/hooks/use-team-payment-settings";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import type { CreateEventFormState } from "./create-event-form-types";
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
  const [step, setStep] = useState(0);
  const STEP_TITLES = t.raw("steps") as string[];

  const defaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    return d;
  };

  const [form, setForm] = useState<CreateEventFormState>({
    type: "game",
    title: "",
    location: "",
    startDate: defaultDate(),
    maxPlayers: "14",
    recurrence: "once",
    priceCents: 0,
    paymentRequired: false,
    paymentDeadlineHours: "",
    rosterOnly: false,
    rosterPriorityHours: 0,
    mbwayEnabled: false,
    mbwayPhone: "",
    transferRequiresProof: true,
  });

  const [inputFee, setInputFee] = useState(t("placeholders.fee"));
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const { players } = useSquad();
  const { settings } = useTeamPaymentSettings(teamId);

  useEffect(() => {
    if (settings) {
      setForm(f => ({
        ...f,
        mbwayEnabled: settings.mbwayEnabled,
        mbwayPhone: settings.mbwayPhone || f.mbwayPhone,
      }));
    }
  }, [settings]);

  const rosterPlayers = useMemo(
    () => players.filter(player => player.status !== "refused"),
    [players],
  );

  const filteredPlayers = useMemo(
    () =>
      rosterPlayers.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [rosterPlayers, searchQuery],
  );

  const set = <K extends keyof CreateEventFormState>(
    k: K,
    v: CreateEventFormState[K],
  ) => setForm(f => ({ ...f, [k]: v }));

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputFee(e.target.value);
  };

  const handleFeeFocus = () => {
    if (inputFee === "€ 0 — grátis") {
      setInputFee("");
    } else {
      setInputFee(inputFee.replace("€", "").trim());
    }
  };

  const handleFeeBlur = () => {
    const sanitized = inputFee.replace(",", ".").replace(/[^0-9.]/g, "");
    const parsed = parseFloat(sanitized);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setInputFee("€ 0 — grátis");
      set("priceCents", 0);
    } else {
      setInputFee(`${parsed.toFixed(2)}€`);
      set("priceCents", Math.round(parsed * 100));
    }
  };

  const handleSend = async () => {
    setSending(true);
    setError(null);
    const result = await createEvent({
      title: form.title || t("noTitle"),
      type: form.type === "other" ? "challenge" : form.type,
      location: form.location || "",
      startDate: form.startDate || new Date(),
      maxParticipants: form.maxPlayers,
      isPublic: true,
      recurrence: form.recurrence,
      teamId,
      priceCents: form.priceCents,
      paymentRequired: form.paymentRequired,
      paymentDeadlineHours: form.paymentDeadlineHours
        ? Number.parseInt(form.paymentDeadlineHours, 10)
        : null,
      rosterOnly: form.rosterOnly,
      rosterPriorityHours: form.rosterPriorityHours,
      mbwayEnabled: form.mbwayEnabled,
      mbwayPhone: form.mbwayPhone,
      transferRequiresProof: form.transferRequiresProof,
      invitedPlayers: rosterPlayers
        .filter(player => selectedPlayerIds.includes(player.id))
        .map(player => ({
          id: player.id,
          name: player.name,
          email: player.email,
          isVerified: player.isVerified,
        })),
    });
    setSending(false);
    if (result.success) {
      setDone(true);
      onCreated?.();
    } else {
      setError(t("error"));
    }
  };

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

  const canAdvance =
    step === 0
      ? form.title.trim().length > 0 && !!form.type
      : step === 1
        ? !!form.startDate && form.location.trim().length > 0
        : true;

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
            onTogglePlayer={id =>
              setSelectedPlayerIds(current =>
                current.includes(id)
                  ? current.filter(i => i !== id)
                  : [...current, id],
              )
            }
            onSelectAll={() =>
              setSelectedPlayerIds(rosterPlayers.map(p => p.id))
            }
            onClearAll={() => setSelectedPlayerIds([])}
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
