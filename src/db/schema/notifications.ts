import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./users";

export const notifications = pgTable("notification", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // e.g., "event_created", "player_joined", "payment_received"
  title: text("title").notNull(),
  message: text("message").notNull(),
  metadata: jsonb("metadata"), // e.g., { eventId: "...", teamId: "..." }
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
