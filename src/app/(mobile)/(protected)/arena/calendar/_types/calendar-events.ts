export type SessionRow = {
  id: number;
  title: string;
  location: string;
  startsAt: Date | string;
  endsAt: Date | string | null;
  capacity: number | null;
  priceCents: number | null;
  currency: string;
  status?: "scheduled" | "confirmed" | "cancelled";
};

export type EventType = "game" | "training" | "event";

export type ViewMode = "week" | "month" | "year" | "range";
