import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { matchSessions } from "./match-sessions";
import { user } from "./users";

export const eventNotices = pgTable("event_notices", {
  id: serial("id").primaryKey(),
  matchSessionId: integer("match_session_id")
    .notNull()
    .references(() => matchSessions.id, { onDelete: "cascade" }),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"), // "info", "urgent", "field_change"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
