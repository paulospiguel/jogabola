export type CreateEventType =
  | "game"
  | "training"
  | "friendly"
  | "meeting"
  | "other";
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";
export type ConfirmationMode = "automatic" | "manual";
export type EventStatus = "confirmed" | "pending" | "cancelled";

export type CreateEventFormValues = {
  title: string;
  type: CreateEventType;
  date: string;
  time: string;
  location: string;
  description: string;
  status: EventStatus;
  isRecurring: boolean;
  recurrenceType: RecurrenceType;
  confirmationMode: ConfirmationMode;
  advanceNoticeDays: number;
};
