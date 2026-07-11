import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { matchSessions } from "./match-sessions";

export const guestEventOtp = pgTable("guest_event_otp", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  matchSessionId: integer("match_session_id")
    .notNull()
    .references(() => matchSessions.id, { onDelete: "cascade" }),
  otp: text("otp").notNull(),
  attempts: integer("attempts").notNull().default(0),
  lockedUntil: timestamp("locked_until"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
