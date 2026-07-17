import { addDays, addMonths, addWeeks, format } from "date-fns";
import type { LucideIcon } from "lucide-react";
import type { StaticImageData } from "next/image";
import jbFriendly from "@/assets/images/branding/jb-friendly.png";
import jbGame from "@/assets/images/branding/jb-game.png";
import jbMeeting from "@/assets/images/branding/jb-meeting.png";
import jbOther from "@/assets/images/branding/jb-other.png";
import jbTraining from "@/assets/images/branding/jb-training.png";
import type {
  ConfirmationMode,
  CreateEventFormValues,
  CreateEventType,
  RecurrenceType,
} from "@/components/shared/events/create-event-dialog.types";

export type EventTypeVisual =
  | { kind: "brand"; image: StaticImageData; altKey: string }
  | { kind: "icon"; icon: LucideIcon };

export type EventTypeMeta = {
  labelKey: string;
  descriptionKey: string;
  visual: EventTypeVisual;
};

export const EVENT_TYPE_META: Record<CreateEventType, EventTypeMeta> = {
  game: {
    labelKey: "typeOptions.game.label",
    descriptionKey: "typeOptions.game.description",
    visual: { kind: "brand", image: jbGame, altKey: "typeOptions.game.alt" },
  },
  training: {
    labelKey: "typeOptions.training.label",
    descriptionKey: "typeOptions.training.description",
    visual: {
      kind: "brand",
      image: jbTraining,
      altKey: "typeOptions.training.alt",
    },
  },
  friendly: {
    labelKey: "typeOptions.friendly.label",
    descriptionKey: "typeOptions.friendly.description",
    visual: {
      kind: "brand",
      image: jbFriendly,
      altKey: "typeOptions.friendly.alt",
    },
  },
  meeting: {
    labelKey: "typeOptions.meeting.label",
    descriptionKey: "typeOptions.meeting.description",
    visual: {
      kind: "brand",
      image: jbMeeting,
      altKey: "typeOptions.meeting.alt",
    },
  },
  other: {
    labelKey: "typeOptions.other.label",
    descriptionKey: "typeOptions.other.description",
    visual: { kind: "brand", image: jbOther, altKey: "typeOptions.other.alt" },
  },
};

export const RECURRENCE_OCCURRENCES = 12;

export function toDateInputValue(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function getDefaultEventFormValues(date?: Date): CreateEventFormValues {
  return {
    title: "",
    type: "training",
    date: toDateInputValue(date ?? new Date()),
    time: "18:00",
    location: "",
    description: "",
    status: "confirmed",
    isRecurring: false,
    recurrenceType: "none",
    confirmationMode: "automatic",
    advanceNoticeDays: 7,
  };
}

export function buildDateFromInputs(date: string, time: string) {
  if (!date) {
    return null;
  }

  return new Date(`${date}T${time || "12:00"}`);
}

export function getRecurrenceLabelKey(recurrenceType: RecurrenceType) {
  return `recurrenceLabels.${
    recurrenceType === "daily"
      ? "daily"
      : recurrenceType === "weekly"
        ? "weekly"
        : "monthly"
  }`;
}

export function getNextRecurringDate(
  date: Date,
  recurrenceType: RecurrenceType,
) {
  switch (recurrenceType) {
    case "daily":
      return addDays(date, 1);
    case "weekly":
      return addWeeks(date, 1);
    case "monthly":
      return addMonths(date, 1);
    default:
      return date;
  }
}

export function getEventConfirmationStatus(confirmationMode: ConfirmationMode) {
  return confirmationMode === "automatic" ? "confirmed" : "pending";
}
