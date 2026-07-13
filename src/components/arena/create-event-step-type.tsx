"use client";

import { Calendar, Check, Compass, Shield } from "lucide-react";
import type { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type {
  CreateEventFormState,
  SetFormField,
} from "./create-event-form-types";

interface CreateEventStepTypeProps {
  type: CreateEventFormState["type"];
  title: CreateEventFormState["title"];
  set: SetFormField;
  t: ReturnType<typeof useTranslations<"arenaCreateEvent">>;
}

export function CreateEventStepType({
  type,
  title,
  set,
  t,
}: CreateEventStepTypeProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => set("type", "game")}
          className={cn(
            "flex items-center justify-between rounded-[14px] border p-3.5 text-left transition-all hover:bg-arena-surface-el",
            type === "game"
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
          {type === "game" && (
            <Check
              size={16}
              strokeWidth={3}
              className="text-arena-primary mr-1"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => set("type", "training")}
          className={cn(
            "flex items-center justify-between rounded-[14px] border p-3.5 text-left transition-all hover:bg-arena-surface-el",
            type === "training"
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
          {type === "training" && (
            <Check size={16} strokeWidth={3} className="text-[#00D8F6] mr-1" />
          )}
        </button>

        <button
          type="button"
          onClick={() => set("type", "other")}
          className={cn(
            "flex items-center justify-between rounded-[14px] border p-3.5 text-left transition-all hover:bg-arena-surface-el",
            type === "other"
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
          {type === "other" && (
            <Check
              size={16}
              strokeWidth={3}
              className="text-arena-primary mr-1"
            />
          )}
        </button>
      </div>

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
            type === "game"
              ? t("placeholders.match")
              : t("placeholders.training")
          }
          value={title}
          className="h-11 rounded-xl border-arena-border bg-[#0B0F14]/50 text-sm text-arena-text font-semibold placeholder:text-arena-text-muted/60 focus-visible:ring-arena-primary/45"
        />
      </div>
    </div>
  );
}
