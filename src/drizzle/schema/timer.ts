import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./users";

/**
 * Tabela timer para armazenar dados persistidos do usuário
 * Usado pelo hook usePersistedState para sincronizar dados entre dispositivos
 */
export const timer = pgTable(
  "timer",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    key: varchar("key", { length: 255 }).notNull(),
    data: text("data").notNull(), // JSON stringified data
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => ({
    pk: primaryKey({ columns: [table.userId, table.key] }),
  }),
);
