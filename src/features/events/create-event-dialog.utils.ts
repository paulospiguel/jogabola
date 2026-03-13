import { addDays, addMonths, addWeeks, format } from "date-fns";
import type {
  ConfirmationMode,
  CreateEventFormValues,
  CreateEventType,
  RecurrenceType,
} from "@/features/events/create-event-dialog.types";

export type EventTypeMeta = {
  labelKey: string;
  descriptionKey: string;
  emoji: string;
};

export const EVENT_TYPE_META: Record<CreateEventType, EventTypeMeta> = {
  jogo: {
    labelKey: "typeOptions.jogo.label",
    descriptionKey: "typeOptions.jogo.description",
    emoji: "🏆",
  },
  treino: {
    labelKey: "typeOptions.treino.label",
    descriptionKey: "typeOptions.treino.description",
    emoji: "🏋️",
  },
  amistoso: {
    labelKey: "typeOptions.amistoso.label",
    descriptionKey: "typeOptions.amistoso.description",
    emoji: "🤝",
  },
  reuniao: {
    labelKey: "typeOptions.reuniao.label",
    descriptionKey: "typeOptions.reuniao.description",
    emoji: "🗣️",
  },
  outro: {
    labelKey: "typeOptions.outro.label",
    descriptionKey: "typeOptions.outro.description",
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
    type: "treino",
    date: toDateInputValue(date ?? new Date()),
    time: "18:00",
    location: "",
    description: "",
    status: "confirmado",
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
  return `recurrenceLabels.${recurrenceType === "daily"
    ? "daily"
    : recurrenceType === "weekly"
      ? "weekly"
      : "monthly"}`;
}

export function getNextRecurringDate(date: Date, recurrenceType: RecurrenceType) {
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
  return confirmationMode === "automatic" ? "confirmado" : "pendente";
}
