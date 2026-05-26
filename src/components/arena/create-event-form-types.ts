export interface CreateEventFormState {
  type: "game" | "training" | "challenge" | "other";
  title: string;
  startDate: Date | null;
  location: string;
  maxPlayers: string;
  recurrence: "once" | "weekly" | "monthly";
  priceCents: number;
  paymentRequired: boolean;
  paymentDeadlineHours: string;
  rosterOnly: boolean;
  rosterPriorityHours: number;
  mbwayEnabled: boolean;
  mbwayPhone: string;
  transferRequiresProof: boolean;
}

export type SetFormField = <K extends keyof CreateEventFormState>(
  k: K,
  v: CreateEventFormState[K],
) => void;
