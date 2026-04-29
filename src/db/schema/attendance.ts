import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { matchSessions } from "./match-sessions";
import { user } from "./users";

export const attendance = pgTable(
  "attendance",
  {
    id: serial("id").primaryKey(),
    matchSessionId: integer("match_session_id")
      .notNull()
      .references(() => matchSessions.id, { onDelete: "cascade" }),
    playerId: text("player_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  table => ({
    attendanceIdx: uniqueIndex("attendance_match_player_idx").on(
      table.matchSessionId,
      table.playerId,
    ),
  }),
);
