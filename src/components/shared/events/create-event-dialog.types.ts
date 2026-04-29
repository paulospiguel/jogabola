export type CreateEventType =
  | "jogo"
  | "treino"
  | "amistoso"
  | "reuniao"
  | "outro";
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";
export type ConfirmationMode = "automatic" | "manual";
export type EventStatus = "confirmado" | "pendente" | "cancelado";

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
