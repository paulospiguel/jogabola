"use client";

import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  Clock,
  Compass,
  MapPin,
  Repeat,
  Shield,
} from "lucide-react";
import type { useTranslations } from "next-intl";
import { generateRecurringOccurrences } from "@/lib/event-recurrence";
import { cn } from "@/lib/utils";
import { getAvatarColor } from "./create-event-avatar-color";
import type { CreateEventFormState } from "./create-event-form-types";

interface CreateEventStepConfirmProps {
  form: Pick<
    CreateEventFormState,
    | "type"
    | "title"
    | "startDate"
    | "location"
    | "scheduleType"
    | "endDate"
    | "recurrence"
    | "recurrenceEndDate"
  >;
  rosterPlayers: { id: string; name: string }[];
  selectedPlayerIds: string[];
  error: string | null;
  t: ReturnType<typeof useTranslations<"arenaCreateEvent">>;
}

function getScheduleSummary(
  form: CreateEventStepConfirmProps["form"],
  t: CreateEventStepConfirmProps["t"],
) {
  if (form.scheduleType === "range" && form.startDate && form.endDate) {
    const start = format(form.startDate, "d MMM", { locale: pt });
    const end = format(form.endDate, "d MMM, HH'h'mm", { locale: pt });
    return t("confirm.rangeSummary", { start, end });
  }

  if (
    form.scheduleType === "recurring" &&
    form.startDate &&
    form.recurrenceEndDate
  ) {
    const frequency = t(`recurrence.${form.recurrence}`);
    const end = format(form.recurrenceEndDate, "d MMM", { locale: pt });
    const result = generateRecurringOccurrences({
      start: form.startDate,
      frequency: form.recurrence === "monthly" ? "monthly" : "weekly",
      endDate: form.recurrenceEndDate,
    });
    const count = result.success ? result.occurrences.length : 0;
    return t("confirm.recurringSummary", { frequency, end, count });
  }

  return null;
}

export function CreateEventStepConfirm({
  form,
  rosterPlayers,
  selectedPlayerIds,
  error,
  t,
}: CreateEventStepConfirmProps) {
  const scheduleSummary = getScheduleSummary(form, t);

  return (
    <div className="flex flex-col gap-4">
      {/* Event briefing card */}
      <div className="rounded-2xl border border-arena-border bg-[#0B0F14]/40 p-4 flex flex-col gap-3 min-w-0">
        <div className="flex items-center">
          <span
            className={cn(
              "size-7 rounded-lg flex items-center justify-center shrink-0",
              form.type === "game" ? "bg-arena-primary/10" : "bg-[#00D8F6]/10",
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
              form.type === "game" ? "text-arena-primary" : "text-[#00D8F6]",
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
          {scheduleSummary && (
            <div className="flex items-center gap-2 text-[11px] text-arena-primary font-semibold">
              <Repeat size={12} className="text-arena-primary" />
              <span>{scheduleSummary}</span>
            </div>
          )}
        </div>
      </div>

      {/* Roster preview */}
      <div className="rounded-2xl border border-arena-border bg-[#0B0F14]/40 p-4 flex flex-col gap-3 min-w-0">
        <span className="text-[11px] font-black tracking-wider uppercase text-arena-text-sec leading-none block">
          {t("final.confirm.rosterTitle")}
        </span>

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
            {t("final.notificationSent", { count: selectedPlayerIds.length })}
          </span>
        )}
      </div>

      {/* Warning */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 text-xs leading-relaxed text-amber-500 font-semibold shrink-0 mt-0.5">
        <AlertCircle size={15} className="shrink-0 text-amber-500 mt-0.5" />
        <span>{t("final.stepsInfo")}</span>
      </div>

      {error && (
        <div className="rounded-[10px] border border-arena-danger/20 bg-arena-danger/10 px-3.5 py-2.5 text-xs text-arena-danger font-semibold mt-0.5">
          {error}
        </div>
      )}
    </div>
  );
}
