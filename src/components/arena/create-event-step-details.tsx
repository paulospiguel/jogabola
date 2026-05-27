"use client";

import { Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { EventDatePicker } from "@/components/ui/event-date-picker";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { CreateEventFormState, SetFormField } from "./create-event-form-types";

interface CreateEventStepDetailsProps {
  form: Pick<
    CreateEventFormState,
    "startDate" | "location" | "maxPlayers" | "rosterOnly"
  >;
  inputFee: string;
  set: SetFormField;
  onFeeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFeeFocus: () => void;
  onFeeBlur: () => void;
  t: ReturnType<typeof useTranslations<"arenaCreateEvent">>;
}

export function CreateEventStepDetails({
  form,
  inputFee,
  set,
  onFeeChange,
  onFeeFocus,
  onFeeBlur,
  t,
}: CreateEventStepDetailsProps) {
  return (
    <div className="flex flex-col gap-4">
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

      <div>
        <Label
          className="mb-1.5 text-xs font-bold text-arena-text-sec block px-0.5"
          htmlFor="event-fee"
        >
          {t("labels.fee")}
        </Label>
        <Input
          id="event-fee"
          onChange={onFeeChange}
          onFocus={onFeeFocus}
          onBlur={onFeeBlur}
          placeholder={t("placeholders.fee")}
          value={inputFee}
          className="h-11 rounded-xl border-arena-border bg-[#0B0F14]/50 text-sm text-arena-text font-semibold focus-visible:ring-arena-primary/45"
        />
      </div>

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

        <button
          type="button"
          onClick={() => set("rosterOnly", !form.rosterOnly)}
          className={cn(
            "w-9 h-5 rounded-full p-0.5 transition-colors duration-200 shrink-0",
            form.rosterOnly ? "bg-arena-primary" : "bg-arena-border",
          )}
          aria-label={t("access.togglePrivate")}
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
  );
}
