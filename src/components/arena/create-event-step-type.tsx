"use client";

import { Check } from "lucide-react";
import Image from "next/image";
import type { useTranslations } from "next-intl";
import {
  EVENT_TYPE_META,
  type EventTypeVisual,
} from "@/components/shared/events/create-event-dialog.utils";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type {
  CreateEventFormState,
  SetFormField,
} from "./create-event-form-types";

const TYPE_BADGE_SIZE = 36;

function EventTypeVisualBadge({
  visual,
  t,
}: {
  visual: EventTypeVisual;
  t: ReturnType<typeof useTranslations<"arenaCreateEvent">>;
}) {
  if (visual.kind === "icon") {
    const Icon = visual.icon;
    return (
      <span className="size-9 rounded-xl bg-arena-surface-el flex items-center justify-center shrink-0 text-arena-text-sec">
        <Icon size={16} />
      </span>
    );
  }

  return (
    <span className="size-9 rounded-xl bg-arena-surface-el flex items-center justify-center shrink-0 overflow-hidden">
      <Image
        src={visual.image}
        alt={t(visual.altKey)}
        width={TYPE_BADGE_SIZE}
        height={TYPE_BADGE_SIZE}
        sizes={`${TYPE_BADGE_SIZE}px`}
        className="h-full w-full object-contain"
      />
    </span>
  );
}

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
            <EventTypeVisualBadge visual={EVENT_TYPE_META.game.visual} t={t} />
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
            <EventTypeVisualBadge
              visual={EVENT_TYPE_META.training.visual}
              t={t}
            />
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
            <EventTypeVisualBadge visual={EVENT_TYPE_META.other.visual} t={t} />
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
