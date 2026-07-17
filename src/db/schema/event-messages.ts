import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { matchSessions } from "./match-sessions";
import { user } from "./users";

export const eventMessages = pgTable("event_messages", {
  id: serial("id").primaryKey(),
  matchSessionId: integer("match_session_id")
    .notNull()
    .references(() => matchSessions.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  /** Soft-delete: set when the author deletes their own message */
  deletedAt: timestamp("deleted_at"),
  /** Captain censorship: set when the captain blurs a message */
  censoredAt: timestamp("censored_at"),
});
