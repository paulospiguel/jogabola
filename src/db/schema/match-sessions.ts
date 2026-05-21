import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { teams } from "./teams";
import { user } from "./users";

export const matchSessions = pgTable("match_sessions", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  location: text("location").notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  capacity: integer("capacity"),
  status: text("status").notNull().default("scheduled"), // "scheduled" | "confirmed" | "cancelled"
  recurrence: text("recurrence").notNull().default("once"), // "once", "weekly", "monthly"
  priceCents: integer("price_cents").default(0),
  currency: text("currency").notNull().default("EUR"),
  paymentRequired: boolean("payment_required").notNull().default(false),
  paymentDeadlineHours: integer("payment_deadline_hours"),
  rosterOnly: boolean("roster_only").notNull().default(false),
  rosterPriorityHours: integer("roster_priority_hours").default(0),
  transferRequiresProof: boolean("transfer_requires_proof")
    .notNull()
    .default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const matchReservations = pgTable(
  "match_reservations",
  {
    id: serial("id").primaryKey(),
    matchSessionId: integer("match_session_id")
      .notNull()
      .references(() => matchSessions.id, { onDelete: "cascade" }),
    playerId: text("player_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("reserved_unpaid"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  table => ({
    reservationIdx: uniqueIndex("match_reservations_session_player_idx").on(
      table.matchSessionId,
      table.playerId,
    ),
  }),
);
