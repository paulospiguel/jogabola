"use client";

import { format } from "date-fns";
import { Check, ChevronDown, ChevronUp, CreditCard, Link2, Loader2, Send } from "lucide-react";
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
  teamId?: number;
}

interface FormState {
  type: "game" | "training" | "challenge";
  title: string;
  startDate: Date | null;
  location: string;
  maxPlayers: string;
  recurrence: "once" | "weekly" | "monthly";
  priceCents: number;
  paymentRequired: boolean;
  paymentDeadlineHours: string;
}

function PaymentSection({
  form,
  set,
  t,
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  t: ReturnType<typeof useTranslations<"arenaCreateEvent">>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-arena-border bg-arena-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-[13px] font-semibold text-arena-text">
          <CreditCard size={15} className="text-arena-primary" />
          {t("payment.section") || "Pagamento"}
        </span>
        {open ? (
          <ChevronUp size={15} className="text-arena-text-muted" />
        ) : (
          <ChevronDown size={15} className="text-arena-text-muted" />
        )}
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t border-arena-border px-4 pb-4 pt-3">
          {/* Price */}
          <div>
            <Label className="mb-1 text-xs font-semibold text-arena-text-sec" htmlFor="event-price">
              {t("payment.price") || "Valor (€)"}
            </Label>
            <Input
              className="h-11 rounded-xl border-arena-border bg-arena-bg text-sm text-arena-text placeholder:text-arena-text-muted/70 focus-visible:ring-arena-primary/40 focus-visible:border-arena-primary/50"
              id="event-price"
              type="number"
              min={0}
              step={0.5}
              placeholder="0.00"
              value={form.priceCents > 0 ? (form.priceCents / 100).toFixed(2) : ""}
              onChange={e => {
                const val = Number.parseFloat(e.target.value) || 0;
                set("priceCents", Math.round(val * 100));
              }}
            />
          </div>

          {/* Payment required toggle */}
          <button
            type="button"
            onClick={() => set("paymentRequired", !form.paymentRequired)}
            className={cn(
              "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
              form.paymentRequired
                ? "border-arena-primary/40 bg-arena-primary/5"
                : "border-arena-border bg-arena-bg",
            )}
          >
            <div>
              <p className="text-[13px] font-semibold text-arena-text">
                {t("payment.required") || "Pagamento obrigatório"}
              </p>
              <p className="text-[11px] text-arena-text-muted">
                {t("payment.requiredHint") || "Atletas devem pagar antes de confirmar"}
              </p>
            </div>
            <div className={cn(
              "h-5 w-9 rounded-full transition-colors",
              form.paymentRequired ? "bg-arena-primary" : "bg-arena-border",
            )}>
              <div className={cn(
                "mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                form.paymentRequired ? "translate-x-4 ml-0.5" : "translate-x-0.5",
              )} />
            </div>
          </button>

          {/* Deadline hours — only when paymentRequired */}
          {form.paymentRequired && (
            <div>
              <Label className="mb-1 text-xs font-semibold text-arena-text-sec" htmlFor="event-deadline">
                {t("payment.deadlineHours") || "Prazo de pagamento"}
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  className="h-11 flex-1 rounded-xl border-arena-border bg-arena-bg text-sm text-arena-text placeholder:text-arena-text-muted/70 focus-visible:ring-arena-primary/40 focus-visible:border-arena-primary/50"
                  id="event-deadline"
                  type="number"
                  min={1}
                  max={168}
                  placeholder="24"
                  value={form.paymentDeadlineHours}
                  onChange={e => set("paymentDeadlineHours", e.target.value)}
                />
                <span className="shrink-0 text-[12px] text-arena-text-muted">
                  {t("payment.deadlineHoursUnit") || "h antes do jogo"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Arena-flavoured overrides applied on top of the UI base components
const inputClass =
  "h-11 rounded-xl border-arena-border bg-arena-surface text-sm text-arena-text placeholder:text-arena-text-muted/70 focus-visible:ring-arena-primary/40 focus-visible:border-arena-primary/50";
const labelClass = "mb-1 text-xs font-semibold text-arena-text-sec";

export function CreateEventSheet({
  onClose,
  onCreated,
  teamId,
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
    location: "",
    startDate: null,
    maxPlayers: "14",
    recurrence: "once",
    priceCents: 0,
    paymentRequired: false,
    paymentDeadlineHours: "",
  });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdEventId, setCreatedEventId] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSend = async () => {
    setSending(true);
    setError(null);

    const result = await createEvent({
      title: form.title,
      type: form.type,
      location: form.location,
      startDate: form.startDate ?? new Date(),
      maxParticipants: form.maxPlayers,
      isPublic: true,
      recurrence: form.recurrence,
      teamId,
      priceCents: form.priceCents,
      paymentRequired: form.paymentRequired,
      paymentDeadlineHours: form.paymentRequired && form.paymentDeadlineHours
        ? Number.parseInt(form.paymentDeadlineHours, 10)
        : null,
    });

    setSending(false);

    if (result.success) {
      setCreatedEventId(result.data.id);
      setDone(true);
      onCreated?.();
    } else {
      setError(t("error"));
    }
  };

  /* ── Success / share state ─────────────────────────────────── */
  if (done) {
    const eventUrl = createdEventId
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/event/${createdEventId}`
      : "";
    const shareMsg = t("convocar.shareMessage", { title: form.title });
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${shareMsg}\n${eventUrl}`)}`;
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(shareMsg)}`;

    const handleCopy = () => {
      navigator.clipboard.writeText(eventUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    };

    return (
      <JbBottomSheet onClose={onClose}>
        <div className="flex flex-col gap-5 overflow-auto px-5 pt-8 pb-8">
          {/* Success indicator */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="grid size-14 place-items-center rounded-full border-2 border-arena-success/25 bg-arena-success/10 text-arena-success">
              <Check size={26} strokeWidth={2.5} />
            </div>
            <p className="text-lg font-bold text-arena-text">{t("success")}</p>
          </div>

          {/* Share section */}
          <div className="rounded-2xl border border-arena-border bg-arena-surface p-4">
            <p className="mb-3 text-xs font-semibold tracking-wide uppercase text-arena-text-muted">
              {t("convocar.shareAfterCreate")}
            </p>
            <div className="flex flex-col gap-2">
              {/* Copy link */}
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-3 rounded-xl border border-arena-border bg-arena-bg px-4 py-3 text-left transition-colors hover:border-arena-primary/40 hover:bg-arena-primary/5"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-arena-border bg-arena-surface">
                  {copiedLink ? (
                    <Check size={14} className="text-arena-primary" />
                  ) : (
                    <Link2 size={14} className="text-arena-text-muted" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    copiedLink ? "text-arena-primary" : "text-arena-text",
                  )}
                >
                  {copiedLink ? t("convocar.copied") : t("convocar.copyLink")}
                </span>
              </button>

              {/* WhatsApp */}
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-arena-border bg-arena-bg px-4 py-3 transition-colors hover:border-[#25d366]/40 hover:bg-[#25d366]/5"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-arena-border bg-arena-surface">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-[#25d366]"
                    role="img"
                    aria-label="WhatsApp"
                  >
                    <title>WhatsApp</title>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-arena-text">
                  {t("convocar.whatsapp")}
                </span>
              </a>

              {/* Telegram */}
              <a
                href={tgUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-arena-border bg-arena-bg px-4 py-3 transition-colors hover:border-[#229ed9]/40 hover:bg-[#229ed9]/5"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-arena-border bg-arena-surface">
                  <Send size={13} className="text-[#229ed9]" />
                </span>
                <span className="text-sm font-medium text-arena-text">
                  {t("convocar.telegram")}
                </span>
              </a>
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-[14px] border border-arena-border text-[15px] font-semibold text-arena-text-sec transition-colors hover:border-arena-primary/30 hover:text-arena-text"
          >
            {t("actions.close")}
          </button>
        </div>
      </JbBottomSheet>
    );
  }

  const canAdvance = step === 1 ? form.title.trim().length > 0 : true;

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
              </Button>
            ))}
          </div>
        )}

        {/* Step 1 — Date/time, location, max players */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="">
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
            <div className="">
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

            <div className="">
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

            <div className="">
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

            <div className="">
              <Label className={labelClass} htmlFor="event-recurrence">
                {t("labels.recurrence") || "Modalidade"}
              </Label>
              <Select
                defaultValue="once"
                onValueChange={(value: "once" | "weekly" | "monthly") =>
                  set("recurrence", value)
                }
                value={form.recurrence}
              >
                <SelectTrigger
                  className="h-11 w-full rounded-xl border-arena-border bg-arena-surface text-sm text-arena-text"
                  id="event-recurrence"
                >
                  <SelectValue placeholder="Modalidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">
                    {t("recurrence.once") || "Único"}
                  </SelectItem>
                  <SelectItem value="weekly">
                    {t("recurrence.weekly") || "Semanal"}
                  </SelectItem>
                  <SelectItem value="monthly">
                    {t("recurrence.monthly") || "Mensal"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Payment section */}
            <PaymentSection form={form} set={set} t={t} />
          </div>
        )}

        {/* Info banner — steps 0 and 1 only */}
        {step < 2 && (
          <div className="mt-4 rounded-2xl border border-arena-primary/20 bg-arena-primary/5 p-4">
            <p className="text-[13px] leading-relaxed text-arena-text-sec">
              {t("info")}
            </p>
          </div>
        )}

        {/* Step 2 — Convocar preview */}
        {step === 2 && (
          <div>
            <p className="mb-3 text-xs font-semibold tracking-wide uppercase text-arena-text-muted">
              {t("convocar.preview")}
            </p>
            <div className="rounded-2xl border border-arena-border bg-arena-surface p-4">
              <span className="mb-2 inline-block rounded-full bg-arena-primary/10 px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase text-arena-primary">
                {form.type}
              </span>
              <p className="mb-2 text-[15px] font-bold text-arena-text">
                {form.title || t("noTitle")}
              </p>
              {form.startDate && (
                <p className="text-xs text-arena-text-sec">
                  {format(form.startDate, "dd/MM/yyyy · HH:mm")}
                </p>
              )}
              {form.location && (
                <p className="mt-0.5 text-xs text-arena-text-sec">
                  {form.location}
                </p>
              )}
              {form.maxPlayers && (
                <p className="mt-0.5 text-xs text-arena-text-muted">
                  {t("playersCount", { count: form.maxPlayers })}
                </p>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-arena-primary/20 bg-arena-primary/5 p-4">
              <p className="text-[13px] leading-relaxed text-arena-text-sec">
                {t("info")}
              </p>
            </div>
          </div>
        )}

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
