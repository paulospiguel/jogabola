"use client";

import { format } from "date-fns";
import { Check, Loader2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { createEvent } from "@/actions/match-sessions.actions";
import Challenge from "@/assets/images/jb-challenge.png";
import Game from "@/assets/images/jb-game.png";
import Training from "@/assets/images/jb-training.png";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { EventDatePicker } from "../ui/event-date-picker";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { JbBottomSheet } from "./jb-bottom-sheet";

interface CreateEventSheetProps {
  onClose: () => void;
  onCreated?: () => void;
  organizerId?: string | undefined;
}

interface FormState {
  type: "game" | "training" | "challenge";
  title: string;
  startDate: Date | null;
  location: string;
  maxPlayers: string;
}

// Arena-flavoured overrides applied on top of the UI base components
const inputClass =
  "h-11 rounded-xl border-arena-border bg-arena-surface text-sm text-arena-text placeholder:text-arena-text-muted/70 focus-visible:ring-arena-primary/40 focus-visible:border-arena-primary/50";
const labelClass = "mb-1 text-xs font-semibold text-arena-text-sec";

export function CreateEventSheet({
  onClose,
  onCreated,
  organizerId,
}: CreateEventSheetProps) {
  const t = useTranslations("arenaCreateEvent");
  const [step, setStep] = useState(0);
  const STEP_TITLES = t.raw("steps") as string[];

  const TYPE_OPTIONS = [
    {
      v: "game",
      label: t("types.game.label"),
      desc: t("types.game.desc"),
      image: Game,
    },
    {
      v: "training",
      label: t("types.training.label"),
      desc: t("types.training.desc"),
      image: Training,
    },
    {
      v: "challenge",
      label: t("types.challenge.label"),
      desc: t("types.challenge.desc"),
      image: Challenge,
    },
  ] as const;

  const [form, setForm] = useState<FormState>({
    type: "game",
    title: "",
    startDate: null,
    location: "",
    maxPlayers: "14",
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSend = async () => {
    setSending(true);
    setError(null);

    const result = await createEvent({
      title: form.title,
      type: form.type,
      location: form.location || "A definir",
      startDate: form.startDate ?? new Date(),
      maxParticipants: form.maxPlayers,
      isPublic: true,
      organizerId,
    });

    setSending(false);

    if (result.success) {
      setDone(true);
      onCreated?.();
      setTimeout(onClose, 2500);
    } else {
      setError(t("error"));
    }
  };

  /* ── Success state ─────────────────────────────────────────── */
  if (done) {
    return (
      <JbBottomSheet onClose={onClose}>
        <div className="flex flex-col items-center gap-3.5 overflow-auto px-5 pt-8 pb-12 text-center">
          <div className="grid size-16 place-items-center rounded-full border-2 border-arena-success/25 bg-arena-success/10 text-arena-success">
            <Check size={28} strokeWidth={2.5} />
          </div>
          <p className="text-lg font-bold text-arena-text">{t("success")}</p>
          <p className="text-sm leading-relaxed text-arena-text-sec">
            {t("successSubtitle")}
          </p>
        </div>
      </JbBottomSheet>
    );
  }

  const canAdvance = step === 0 ? form.title.trim().length > 0 : true;

  return (
    <JbBottomSheet onClose={onClose} noPad>
      {/* ── Step progress bar ────────────────────────────────── */}
      <div className="shrink-0 px-5">
        <div className="flex gap-1.5 py-3.5">
          {STEP_TITLES.map((stepTitle, i) => (
            <div
              aria-hidden="true"
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i <= step ? "bg-arena-primary" : "bg-arena-border",
              )}
              key={stepTitle}
              style={{ flex: i <= step ? step - i + 1 : 1 }}
            />
          ))}
        </div>
        <div className="mb-3.5 flex items-center justify-between">
          <p className="text-base font-bold text-arena-text">
            {STEP_TITLES[step]}
          </p>
          <span className="text-xs text-arena-text-muted">
            {step + 1} / {STEP_TITLES.length}
          </span>
        </div>
      </div>

      {/* ── Scrollable content ───────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-auto px-5 pb-10">
        {/* Step 0 — Event type + title */}
        {step === 0 && (
          <div>
            {TYPE_OPTIONS.map(opt => (
              <Button
                asChild={false}
                className={cn(
                  "mb-2.5 flex h-auto w-full items-center justify-between gap-3.5 rounded-[14px] border-[1.5px] p-4 text-left font-[inherit] transition-colors",
                  form.type === opt.v
                    ? "border-arena-primary/55 bg-arena-primary/5"
                    : "border-arena-border bg-arena-surface",
                )}
                key={opt.v}
                onClick={() => set("type", opt.v)}
                type="button"
                variant="ghost"
                size="default"
              >
                <>
                  <span className="flex flex-row items-center gap-4">
                    <Image
                      alt={opt.label}
                      className={cn(
                        "rounded-2xl object-cover p-2",
                        form.type === opt.v
                          ? "border border-arena-primary/55 bg-arena-primary/5"
                          : "border border-arena-border bg-arena-surface",
                      )}
                      height={60}
                      src={opt.image}
                      width={60}
                    />
                    <span className="flex flex-col">
                      <span
                        className={cn(
                          "block text-[15px] font-semibold",
                          form.type === opt.v
                            ? "text-arena-text"
                            : "text-arena-text-sec",
                        )}
                      >
                        {opt.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-arena-text-muted">
                        {opt.desc}
                      </span>
                    </span>
                  </span>
                  {form.type === opt.v && (
                    <Check
                      className="shrink-0 text-arena-primary"
                      size={18}
                      strokeWidth={2.5}
                    />
                  )}
                </>
              </Button>
            ))}

            <div className="mt-1">
              <Label className={labelClass} htmlFor="event-title">
                {t("labels.title")}
              </Label>
              <Input
                className={inputClass}
                id="event-title"
                onChange={e => set("title", e.target.value)}
                placeholder={
                  form.type === "game"
                    ? t("placeholders.match")
                    : t("placeholders.training")
                }
                value={form.title}
              />
            </div>
          </div>
        )}

        {/* Step 1 — Date/time, location, max players */}
        {step === 1 && (
          <div>
            <div className="mb-3">
              <Label className={labelClass} htmlFor="event-date">
                {t("labels.date")}
              </Label>
              <EventDatePicker
                id="event-date"
                value={form.startDate}
                onChange={date => set("startDate", date)}
                placeholder={t("placeholders.dateTime")}
              />
            </div>

            <div className="mb-3">
              <Label className={labelClass} htmlFor="event-location">
                {t("labels.location")}
              </Label>
              <Input
                className={inputClass}
                id="event-location"
                onChange={e => set("location", e.target.value)}
                placeholder={t("placeholders.location")}
                value={form.location}
              />
            </div>

            <div className="mb-3">
              <Label className={labelClass} htmlFor="event-max-players">
                {t("labels.maxPlayers")}
              </Label>
              <Select
                defaultValue="14"
                onValueChange={value => set("maxPlayers", value)}
                value={form.maxPlayers}
              >
                <SelectTrigger
                  className="h-11 w-full rounded-xl border-arena-border bg-arena-surface text-sm text-arena-text"
                  id="event-max-players"
                >
                  <SelectValue placeholder={t("labels.maxPlayers")} />
                </SelectTrigger>
                <SelectContent>
                  {["6", "8", "10", "11", "14", "16", "20", "22"].map(n => (
                    <SelectItem key={n} value={n}>
                      {t("playersCount", { count: n })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Info banner — always visible */}
        <div className="mt-4 rounded-2xl border border-arena-primary/20 bg-arena-primary/5 p-4">
          <p className="text-[13px] leading-relaxed text-arena-text-sec">
            {t("info")}
          </p>
        </div>

        {/* Step 3 — Summary + error */}
        {step === 3 && (
          <div className="mt-4">
            <div className="mb-3 rounded-2xl border border-arena-primary/20 bg-arena-surface p-4">
              <p className="text-[10px] font-bold tracking-[1px] uppercase text-arena-text-muted">
                {form.type}
              </p>
              <p className="mb-2 text-[15px] font-bold text-arena-text">
                {form.title || t("noTitle")}
              </p>
              {form.location && (
                <p className="text-xs text-arena-text-sec">{form.location}</p>
              )}
              {form.startDate && (
                <p className="mt-0.5 text-xs text-arena-text-sec">
                  {format(form.startDate, "dd/MM/yyyy · HH:mm")}
                </p>
              )}
            </div>

            {error && (
              <div className="mb-3 rounded-[10px] border border-arena-danger/20 bg-arena-danger/10 px-3 py-2.5 text-[13px] text-arena-danger">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Footer navigation ────────────────────────────────── */}
      <div className="flex shrink-0 gap-2.5 px-5 pt-3 pb-5">
        {step > 0 && (
          <Button
            className="h-[50px] flex-1 rounded-[14px] border-arena-border text-[15px] font-semibold text-arena-text-sec"
            onClick={() => setStep(s => s - 1)}
            type="button"
            variant="outline"
          >
            {t("actions.back")}
          </Button>
        )}
        <Button
          className={cn(
            "h-[50px] flex-[2] rounded-[14px] text-[15px] font-bold",
            canAdvance
              ? "bg-arena-primary text-arena-bg hover:bg-arena-primary/90"
              : "cursor-not-allowed bg-arena-border text-arena-text-muted opacity-100",
          )}
          disabled={!canAdvance || sending}
          onClick={step < 3 ? () => setStep(s => s + 1) : handleSend}
          type="button"
        >
          {sending && <Loader2 className="animate-spin" size={16} />}
          {step === 3 ? t("actions.create") : t("actions.continue")}
        </Button>
      </div>
    </JbBottomSheet>
  );
}
