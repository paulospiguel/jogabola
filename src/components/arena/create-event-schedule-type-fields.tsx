"use client";

import type { useTranslations } from "next-intl";
import { EventDatePicker } from "@/components/ui/event-date-picker";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type {
  CreateEventFormState,
  ScheduleType,
  SetFormField,
} from "./create-event-form-types";

const SCHEDULE_TYPES: ScheduleType[] = ["fixed", "range", "recurring"];

interface ScheduleTypeFieldsProps {
  form: Pick<
    CreateEventFormState,
    | "scheduleType"
    | "startDate"
    | "endDate"
    | "recurrence"
    | "recurrenceEndDate"
  >;
  set: SetFormField;
  t: ReturnType<typeof useTranslations<"arenaCreateEvent">>;
}

/**
 * Owns every field that depends on the event's schedule type: the start
 * date/time picker (whose label changes for a recurring series' first
 * occurrence), the fixed/range/recurring toggle, and each type's own
 * conditional fields (range end date, or recurring frequency + series end
 * date).
 */
export function ScheduleTypeFields({ form, set, t }: ScheduleTypeFieldsProps) {
  function handleScheduleTypeChange(next: ScheduleType) {
    set("scheduleType", next);
    set("endDate", null);
    set("recurrenceEndDate", null);
    set("recurrence", next === "recurring" ? "weekly" : "once");
  }

  return (
    <>
      <div>
        <Label
          className="mb-1.5 text-xs font-bold text-arena-text-sec block px-0.5"
          htmlFor="event-date-picker"
        >
          {form.scheduleType === "recurring"
            ? t("labels.firstDate")
            : `${t("labels.date")} & ${t("labels.time")}`}
        </Label>
        <EventDatePicker
          id="event-date-picker"
          value={form.startDate}
          onChange={date => set("startDate", date)}
          placeholder={t("placeholders.selectDateTime")}
        />
      </div>

      <div>
        <Label className="mb-1.5 text-xs font-bold text-arena-text-sec block px-0.5">
          {t("labels.scheduleType")}
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {SCHEDULE_TYPES.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => handleScheduleTypeChange(option)}
              className={cn(
                "press rounded-xl border px-2 py-2.5 text-center text-[11px] font-bold transition-all",
                form.scheduleType === option
                  ? "border-arena-primary bg-arena-primary/10 text-arena-primary"
                  : "border-arena-border bg-[#0B0F14]/30 text-arena-text-sec hover:bg-arena-surface-el",
              )}
            >
              {t(`scheduleType.${option}`)}
            </button>
          ))}
        </div>
      </div>

      {form.scheduleType === "range" && (
        <div>
          <Label
            className="mb-1.5 text-xs font-bold text-arena-text-sec block px-0.5"
            htmlFor="event-end-date-picker"
          >
            {t("labels.until")}
          </Label>
          <EventDatePicker
            id="event-end-date-picker"
            value={form.endDate}
            onChange={date => set("endDate", date)}
            placeholder={t("placeholders.selectEndDate")}
          />
        </div>
      )}

      {form.scheduleType === "recurring" && (
        <>
          <div>
            <Label
              className="mb-1.5 text-xs font-bold text-arena-text-sec block px-0.5"
              htmlFor="event-recurrence-frequency"
            >
              {t("labels.recurrence")}
            </Label>
            <Select
              value={form.recurrence === "once" ? "weekly" : form.recurrence}
              onValueChange={value =>
                set("recurrence", value as "weekly" | "monthly")
              }
            >
              <SelectTrigger
                id="event-recurrence-frequency"
                className="h-11 w-full rounded-xl border-arena-border bg-[#0B0F14]/50 text-sm text-arena-text font-semibold"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-arena-bg-sec border-arena-border">
                <SelectItem value="weekly" className="text-xs">
                  {t("recurrence.weekly")}
                </SelectItem>
                <SelectItem value="monthly" className="text-xs">
                  {t("recurrence.monthly")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label
              className="mb-1.5 text-xs font-bold text-arena-text-sec block px-0.5"
              htmlFor="event-recurrence-end-date-picker"
            >
              {t("labels.repeatUntil")}
            </Label>
            <EventDatePicker
              id="event-recurrence-end-date-picker"
              value={form.recurrenceEndDate}
              onChange={date => set("recurrenceEndDate", date)}
              placeholder={t("placeholders.selectEndDate")}
            />
          </div>
        </>
      )}
    </>
  );
}
