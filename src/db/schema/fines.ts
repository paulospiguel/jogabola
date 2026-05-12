import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";
import { matchSessions } from "./match-sessions";

export const fines = pgTable("fines", {
  id: serial("id").primaryKey(),
  playerId: text("player_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  matchSessionId: integer("match_session_id")
    .references(() => matchSessions.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),
  reason: text("reason").notNull(), // e.g. "late_cancellation", "no_show"
  status: text("status").notNull().default("pending"), // "pending", "paid", "waived"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
