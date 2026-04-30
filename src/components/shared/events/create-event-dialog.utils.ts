import { addDays, addMonths, addWeeks, format } from "date-fns";
import type {
  ConfirmationMode,
  CreateEventFormValues,
  CreateEventType,
  RecurrenceType,
} from "@/components/shared/events/create-event-dialog.types";

export type EventTypeMeta = {
  labelKey: string;
  descriptionKey: string;
  emoji: string;
};

export const EVENT_TYPE_META: Record<CreateEventType, EventTypeMeta> = {
  game: {
    labelKey: "typeOptions.game.label",
    descriptionKey: "typeOptions.game.description",
    emoji: "🏆",
  },
  training: {
    labelKey: "typeOptions.training.label",
    descriptionKey: "typeOptions.training.description",
    emoji: "🏋️",
  },
  friendly: {
    labelKey: "typeOptions.friendly.label",
    descriptionKey: "typeOptions.friendly.description",
    emoji: "🤝",
  },
  meeting: {
    labelKey: "typeOptions.meeting.label",
    descriptionKey: "typeOptions.meeting.description",
    emoji: "🗣️",
  },
  other: {
    labelKey: "typeOptions.other.label",
    descriptionKey: "typeOptions.other.description",
    emoji: "📌",
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
