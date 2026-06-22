import {
  integer,
  pgTable,
  real,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./users";

/**
 * Auto-avaliação do atleta (Fase 2).
 *
 * Uma linha por utilizador (global, não por equipa). Alimenta o
 * balanceador de equipas por IA — confiamos na auto-avaliação do atleta.
 *
 * Skills numa escala de 1 a 10. `goalkeeping` é opcional (só preenchido
 * quando a posição principal é guarda-redes). `overall` é derivado
 * (média das skills) e guardado para o balanceador ler sem recálculo.
 */
export const playerRatings = pgTable("player_ratings", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  primaryPosition: text("primary_position").notNull(),
  secondaryPosition: text("secondary_position"),
  finishing: integer("finishing").notNull(),
  defense: integer("defense").notNull(),
  passing: integer("passing").notNull(),
  pace: integer("pace").notNull(),
  physical: integer("physical").notNull(),
  technique: integer("technique").notNull(),
  goalkeeping: integer("goalkeeping"),
  overall: real("overall").notNull(),
  assessedAt: timestamp("assessed_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
