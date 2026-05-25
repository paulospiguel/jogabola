"use client";

import { format } from "date-fns";
import { pt } from "date-fns/locale";
import Lottie from "lottie-react";
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  Compass,
  Loader2,
  MapPin,
  Search,
  Shield,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { createEvent } from "@/actions/match-sessions.actions";
import SuccessAnimation from "@/assets/lottie/Success.json";
import { BottomSheet } from "@/components/arena/bottom-sheet";
import { EventDatePicker } from "@/components/ui/event-date-picker";
import { useSquad } from "@/hooks/use-squad";
import { useTeamPaymentSettings } from "@/hooks/use-team-payment-settings";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface CreateEventSheetProps {
  onClose: () => void;
  onCreated?: () => void;
  teamId?: number;
}

interface FormState {
  type: "game" | "training" | "challenge" | "other";
  title: string;
  startDate: Date | null;
  location: string;
  maxPlayers: string;
  recurrence: "once" | "weekly" | "monthly";
  priceCents: number;
  paymentRequired: boolean;
  paymentDeadlineHours: string;
  rosterOnly: boolean;
  rosterPriorityHours: number;
  mbwayEnabled: boolean;
  mbwayPhone: string;
  transferRequiresProof: boolean;
}

const getAvatarColor = (initials: string) => {
  const colors: Record<string, string> = {
    DF: "bg-amber-600/20 text-amber-500 border border-amber-500/20",
    AC: "bg-purple-600/20 text-purple-400 border border-purple-500/20",
    TM: "bg-pink-600/20 text-pink-400 border border-pink-500/20",
    BA: "bg-emerald-600/20 text-emerald-400 border border-emerald-500/20",
    RP: "bg-violet-600/20 text-violet-400 border border-violet-500/20",
    FR: "bg-sky-600/20 text-sky-400 border border-sky-500/20",
    NS: "bg-yellow-600/20 text-yellow-500 border border-yellow-500/20",
    JM: "bg-indigo-600/20 text-indigo-400 border border-indigo-500/20",
    CS: "bg-rose-600/20 text-rose-400 border border-rose-500/20",
    LO: "bg-green-600/20 text-green-400 border border-green-500/20",
  };
  return (
    colors[initials.toUpperCase()] ||
    "bg-arena-primary/20 text-arena-primary border border-arena-primary/25"
  );
};

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
    d.setDate(d.getDate() + 1); // amanhã
    d.setHours(18, 0, 0, 0); // 18:00
    return d;
  };

  const [form, setForm] = useState<FormState>({
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

  // Step 2 Mock Helpers (To match date/time placeholders perfectly in mockup inputs)
  const [inputFee, setInputFee] = useState("€ 0 — grátis");

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputFee(e.target.value);
  };

  const handleFeeFocus = () => {
    if (inputFee === "€ 0 — grátis") {
      setInputFee("");
    } else {
      const numeric = inputFee.replace("€", "").trim();
      setInputFee(numeric);
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

  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const { players } = useSquad();
  const { settings } = useTeamPaymentSettings(teamId);

  // Pre-fill MBWay settings if available
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

  const filteredPlayers = useMemo(() => {
    return rosterPlayers.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [rosterPlayers, searchQuery]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSend = async () => {
    setSending(true);
    setError(null);

    const parsedStartDate = form.startDate || new Date();
    const resolvedPriceCents = form.priceCents;

    const result = await createEvent({
      title: form.title || "Treino Tático",
      type: form.type === "other" ? "challenge" : form.type,
      location: form.location || "Campo 3, Chiado",
      startDate: parsedStartDate,
      maxParticipants: form.maxPlayers,
      isPublic: true,
      recurrence: form.recurrence,
      teamId,
      priceCents: resolvedPriceCents,
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

  /* ── Success state with Lottie Files animated circular check ─────── */
  if (done) {
    return (
      <BottomSheet onClose={onClose}>
        <div className="flex flex-col gap-5 px-5 pt-10 pb-8 items-center text-center">
          {/* Animated circular glowing check with Lottie */}
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
      {/* ── Steps Indicator ──────────────────────────────────── */}
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

      {/* ── Step Views Content ────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-4 max-h-[64vh]">
        {/* STEP 1: Tipo de Evento + Título */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            {/* Event Type Grid Options */}
            <div className="flex flex-col gap-2.5">
              {/* Option JOGO */}
              <button
                type="button"
                onClick={() => set("type", "game")}
                className={cn(
                  "flex items-center justify-between rounded-[14px] border p-3.5 text-left transition-all hover:bg-arena-surface-el",
                  form.type === "game"
                    ? "border-arena-primary bg-arena-primary/5 shadow-[0_0_12px_rgba(124,255,79,0.06)]"
                    : "border-arena-border bg-[#0B0F14]/30",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="size-9 bg-arena-primary/10 rounded-xl flex items-center justify-center shrink-0 text-arena-primary">
                    <Shield size={16} />
                  </span>
                  <div>
                    <span className="block text-[13px] font-extrabold text-arena-text leading-none">
                      {t("types.game.label")}
                    </span>
                    <span className="block text-[10px] text-arena-text-muted mt-1 leading-none">
                      {t("types.game.desc")}
                    </span>
                  </div>
                </div>
                {form.type === "game" && (
                  <Check
                    size={16}
                    strokeWidth={3}
                    className="text-arena-primary mr-1"
                  />
                )}
              </button>

              {/* Option TREINO */}
              <button
                type="button"
                onClick={() => set("type", "training")}
                className={cn(
                  "flex items-center justify-between rounded-[14px] border p-3.5 text-left transition-all hover:bg-arena-surface-el",
                  form.type === "training"
                    ? "border-arena-primary bg-arena-primary/5 shadow-[0_0_12px_rgba(124,255,79,0.06)]"
                    : "border-arena-border bg-[#0B0F14]/30",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="size-9 bg-[#00D8F6]/10 rounded-xl flex items-center justify-center shrink-0 text-[#00D8F6]">
                    <Compass size={16} />
                  </span>
                  <div>
                    <span className="block text-[13px] font-extrabold text-arena-text leading-none">
                      {t("types.training.label")}
                    </span>
                    <span className="block text-[10px] text-arena-text-muted mt-1 leading-none">
                      {t("types.training.desc")}
                    </span>
                  </div>
                </div>
                {form.type === "training" && (
                  <Check
                    size={16}
                    strokeWidth={3}
                    className="text-[#00D8F6] mr-1"
                  />
                )}
              </button>

              {/* Option OUTRO */}
              <button
                type="button"
                onClick={() => set("type", "other")}
                className={cn(
                  "flex items-center justify-between rounded-[14px] border p-3.5 text-left transition-all hover:bg-arena-surface-el",
                  form.type === "other"
                    ? "border-arena-primary bg-arena-primary/5 shadow-[0_0_12px_rgba(124,255,79,0.06)]"
                    : "border-arena-border bg-[#0B0F14]/30",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="size-9 bg-arena-info/10 rounded-xl flex items-center justify-center shrink-0 text-arena-info">
                    <Calendar size={16} />
                  </span>
                  <div>
                    <span className="block text-[13px] font-extrabold text-arena-text leading-none">
                      {t("types.other.label")}
                    </span>
                    <span className="block text-[10px] text-arena-text-muted mt-1 leading-none">
                      {t("types.other.desc")}
                    </span>
                  </div>
                </div>
                {form.type === "other" && (
                  <Check
                    size={16}
                    strokeWidth={3}
                    className="text-arena-primary mr-1"
                  />
                )}
              </button>
            </div>

            {/* Title Input */}
            <div className="mt-1">
              <Label
                className="mb-1.5 text-xs font-bold text-arena-text-sec block px-0.5"
                htmlFor="event-title"
              >
                {t("labels.title")}
              </Label>
              <Input
                id="event-title"
                onChange={e => set("title", e.target.value)}
                placeholder={
                  form.type === "game"
                    ? t("placeholders.match")
                    : t("placeholders.training")
                }
                value={form.title}
                className="h-11 rounded-xl border-arena-border bg-[#0B0F14]/50 text-sm text-arena-text font-semibold placeholder:text-arena-text-muted/60 focus-visible:ring-arena-primary/45"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Detalhes do Evento */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            {/* Data & Hora */}
            <div>
              <Label
                className="mb-1.5 text-xs font-bold text-arena-text-sec block px-0.5"
                htmlFor="event-date-picker"
              >
                {t("labels.date")} & {t("labels.time")}
              </Label>
              <EventDatePicker
                id="event-date-picker"
                value={form.startDate}
                onChange={date => set("startDate", date)}
                placeholder={t("placeholders.selectDateTime")}
              />
            </div>

            {/* Venue Location */}
            <div>
              <Label
                className="mb-1.5 text-xs font-bold text-arena-text-sec block px-0.5"
                htmlFor="event-location"
              >
                {t("labels.location")}
              </Label>
              <Input
                id="event-location"
                onChange={e => set("location", e.target.value)}
                placeholder={t("placeholders.location")}
                value={form.location}
                className="h-11 rounded-xl border-arena-border bg-[#0B0F14]/50 text-sm text-arena-text font-semibold focus-visible:ring-arena-primary/45"
              />
            </div>

            {/* Max Players Dropdown */}
            <div>
              <Label
                className="mb-1.5 text-xs font-bold text-arena-text-sec block px-0.5"
                htmlFor="event-max-players"
              >
                {t("labels.maxPlayers")}
              </Label>
              <Select
                defaultValue="14"
                onValueChange={value => set("maxPlayers", value)}
                value={form.maxPlayers}
              >
                <SelectTrigger
                  id="event-max-players"
                  className="h-11 w-full rounded-xl border-arena-border bg-[#0B0F14]/50 text-sm text-arena-text font-semibold"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-arena-bg-sec border-arena-border">
                  {["6", "8", "10", "11", "14", "16", "20", "22"].map(n => (
                    <SelectItem key={n} value={n} className="text-xs">
                      {t("playersCount", { count: n })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fee */}
            <div>
              <Label
                className="mb-1.5 text-xs font-bold text-arena-text-sec block px-0.5"
                htmlFor="event-fee"
              >
                {t("labels.fee")}
              </Label>
              <Input
                id="event-fee"
                onChange={handleFeeChange}
                onFocus={handleFeeFocus}
                onBlur={handleFeeBlur}
                placeholder={t("placeholders.fee")}
                value={inputFee}
                className="h-11 rounded-xl border-arena-border bg-[#0B0F14]/50 text-sm text-arena-text font-semibold focus-visible:ring-arena-primary/45"
              />
            </div>

            {/* Private Roster Priority Switch Card */}
            <div className="flex items-center justify-between rounded-xl border border-arena-border bg-[#0B0F14]/30 p-4 transition-all mt-1">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-arena-border bg-arena-surface text-arena-text-sec">
                  <Users size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <span className="block text-[13px] font-extrabold text-arena-text leading-none">
                    {t("labels.private")}
                  </span>
                  <span className="mt-1.5 block text-[10px] text-arena-text-muted leading-tight truncate">
                    {t("labels.privateSub")}
                  </span>
                </div>
              </div>

              {/* Roster private custom toggle */}
              <button
                type="button"
                onClick={() => set("rosterOnly", !form.rosterOnly)}
                className={cn(
                  "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 shrink-0",
                  form.rosterOnly ? "bg-arena-primary" : "bg-arena-border",
                )}
                aria-label="Toggle private event"
              >
                <div
                  className={cn(
                    "w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                    form.rosterOnly ? "translate-x-4" : "translate-x-0",
                  )}
                />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Convocar Jogadores */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            {/* Header select controls */}
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-arena-text-muted">
                {selectedPlayerIds.length}/{rosterPlayers.length}{" "}
                {t("final.selectedCount", { count: rosterPlayers.length })}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (selectedPlayerIds.length === rosterPlayers.length) {
                    setSelectedPlayerIds([]);
                  } else {
                    setSelectedPlayerIds(rosterPlayers.map(p => p.id));
                  }
                }}
                className="text-[11px] font-bold text-arena-primary hover:underline transition-all"
              >
                {selectedPlayerIds.length === rosterPlayers.length
                  ? t("invite.clear")
                  : t("invite.all")}
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative flex items-center shrink-0">
              <Search className="absolute left-3.5 size-4 text-arena-text-muted" />
              <Input
                placeholder={t("invite.search")}
                onChange={e => setSearchQuery(e.target.value)}
                value={searchQuery}
                className="h-11 pl-10 pr-4 rounded-xl border-arena-border bg-[#0B0F14]/50 text-xs font-semibold placeholder:text-arena-text-muted/60 focus-visible:ring-arena-primary/45 w-full"
              />
            </div>

            {/* Players List */}
            <div className="flex flex-col gap-2 mt-1.5 overflow-y-auto max-h-[36vh] pr-1">
              {filteredPlayers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-arena-border px-4 py-8 text-center text-xs text-arena-text-muted font-medium bg-[#0B0F14]/10">
                  {t("invite.empty")}
                </div>
              ) : (
                filteredPlayers.map(player => {
                  const checked = selectedPlayerIds.includes(player.id);
                  const initials = player.name
                    .split(" ")
                    .map(n => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const initialsBg = getAvatarColor(initials);

                  // Extract realistic player position or custom placeholder (GR, DD, DC, MC, PL)
                  const displayPos =
                    player.role === "captain"
                      ? "PL"
                      : initials === "DF"
                        ? "GR"
                        : initials === "AC"
                          ? "DD"
                          : initials === "TM"
                            ? "DC"
                            : initials === "BA"
                              ? "DC"
                              : initials === "RP"
                                ? "DE"
                                : initials === "FR"
                                  ? "MC"
                                  : initials === "NS"
                                    ? "MC"
                                    : initials === "JM"
                                      ? "MD"
                                      : "PL";

                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() =>
                        setSelectedPlayerIds(current =>
                          checked
                            ? current.filter(id => id !== player.id)
                            : [...current, player.id],
                        )
                      }
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-all hover:bg-arena-surface-el",
                        checked
                          ? "border-arena-primary/40 bg-arena-primary/5"
                          : "border-arena-border bg-[#0B0F14]/30",
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Styled initials bubble */}
                        <div
                          className={cn(
                            "size-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                            initialsBg,
                          )}
                        >
                          {initials}
                        </div>

                        {/* Name and position */}
                        <div className="min-w-0">
                          <span className="block text-[13px] font-extrabold text-arena-text leading-none">
                            {player.name}
                          </span>
                          <span className="block text-[9px] font-black uppercase text-arena-text-muted mt-1 leading-none tracking-widest">
                            {displayPos}
                          </span>
                        </div>
                      </div>

                      {/* Custom mockup checkbox */}
                      <div
                        className={cn(
                          "size-[18px] rounded-[5px] border flex items-center justify-center transition-colors shrink-0 mr-1",
                          checked
                            ? "bg-arena-primary border-arena-primary text-[#0B0F14]"
                            : "border-arena-border bg-[#0B0F14]",
                        )}
                      >
                        {checked && <Check size={12} strokeWidth={4} />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* STEP 4: Confirmar */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            {/* 1. Briefing card details */}
            <div className="rounded-2xl border border-arena-border bg-[#0B0F14]/40 p-4 flex flex-col gap-3 min-w-0">
              <div className="flex items-center">
                <span
                  className={cn(
                    "size-7 rounded-lg flex items-center justify-center shrink-0",
                    form.type === "game"
                      ? "bg-arena-primary/10"
                      : "bg-[#00D8F6]/10",
                  )}
                >
                  {form.type === "game" ? (
                    <Shield size={12} className="text-arena-primary" />
                  ) : (
                    <Compass size={12} className="text-[#00D8F6]" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest ml-2",
                    form.type === "game"
                      ? "text-arena-primary"
                      : "text-[#00D8F6]",
                  )}
                >
                  {form.type === "game"
                    ? t("types.game.label")
                    : t("types.training.label")}
                </span>
              </div>

              <div className="text-sm font-extrabold text-arena-text leading-none mt-0.5">
                {form.title ||
                  (form.type === "game"
                    ? t("placeholders.match")
                    : t("placeholders.training"))}
              </div>

              {/* Grid Metadata */}
              <div className="flex flex-col gap-2 border-t border-arena-border/30 pt-3 mt-0.5">
                <div className="flex items-center gap-2 text-[11px] text-arena-text-sec font-semibold">
                  <Calendar size={12} className="text-arena-text-muted" />
                  <span>
                    {form.startDate
                      ? format(form.startDate, "EEE, d MMM", { locale: pt })
                        .replace(/^\w/, c => c.toUpperCase())
                        .replace(".", "")
                      : t("confirm.noDate")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-arena-text-sec font-semibold">
                  <Clock size={12} className="text-arena-text-muted" />
                  <span>
                    {form.startDate
                      ? format(form.startDate, "HH'h'mm")
                      : t("confirm.noTime")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-arena-text-sec font-semibold">
                  <MapPin size={12} className="text-arena-text-muted" />
                  <span className="truncate">
                    {form.location || t("placeholders.location")}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Callup list layout preview */}
            <div className="rounded-2xl border border-arena-border bg-[#0B0F14]/40 p-4 flex flex-col gap-3 min-w-0">
              <span className="text-[11px] font-black tracking-wider uppercase text-arena-text-sec leading-none block">
                {t("final.confirm.rosterTitle")}
              </span>

              {/* Roster initials bubbles row */}
              <div className="flex -space-x-1.5 overflow-hidden py-1">
                {rosterPlayers
                  .filter(p => selectedPlayerIds.includes(p.id))
                  .slice(0, 10)
                  .map(player => {
                    const initials = player.name
                      .split(" ")
                      .map(n => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    return (
                      <div
                        key={player.id}
                        className={cn(
                          "size-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-[#0B0F14]",
                          getAvatarColor(initials),
                        )}
                      >
                        {initials}
                      </div>
                    );
                  })}
                {selectedPlayerIds.length > 10 && (
                  <div className="size-7 rounded-full bg-arena-surface border-2 border-[#0B0F14] flex items-center justify-center text-[10px] font-black text-arena-text-sec">
                    +{selectedPlayerIds.length - 10}
                  </div>
                )}
                {selectedPlayerIds.length === 0 && (
                  <span className="text-xs text-arena-text-muted font-medium px-1">
                    {t("confirm.noPlayers")}
                  </span>
                )}
              </div>

              {selectedPlayerIds.length > 0 && (
                <span className="text-[11px] text-arena-text-muted mt-0.5 leading-none">
                  {t("final.notificationSent", {
                    count: selectedPlayerIds.length,
                  })}
                </span>
              )}
            </div>

            {/* 3. Warning Notice Box */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 text-xs leading-relaxed text-amber-500 font-semibold shrink-0 mt-0.5">
              <AlertCircle
                size={15}
                className="shrink-0 text-amber-500 mt-0.5"
              />
              <span>{t("final.stepsInfo")}</span>
            </div>

            {error && (
              <div className="rounded-[10px] border border-arena-danger/20 bg-arena-danger/10 px-3.5 py-2.5 text-xs text-arena-danger font-semibold mt-0.5">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Navigation Bottom Button Row ────────────────────────── */}
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
