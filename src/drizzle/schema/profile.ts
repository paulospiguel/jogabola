import {
  boolean,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./users";

export const profile = pgTable("profile", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),

  // Dados básicos
  role: text("role").notNull(), // player, manager, fan, organizer
  name: text("name").notNull(),
  location: text("location"),

  // Experiência e disponibilidade
  experience: text("experience"), // beginner, intermediate, advanced, professional
  availability: text("availability"), // weekends, evenings, flexible, specific

  // Objetivos (array de strings)
  goals: jsonb("goals").$type<string[]>().default([]),

  // Apps da waitlist (array de strings)
  waitlistApps: jsonb("waitlist_apps").$type<string[]>().default([]),

  // Campos personalizados por role (JSON flexível)
  customFields: jsonb("custom_fields").$type<Record<string, any>>().default({}),

  // Preferências
  notificationsEnabled: boolean("notifications_enabled").default(true),
  newsletterEnabled: boolean("newsletter_enabled").default(true),
  earlyAccessEnabled: boolean("early_access_enabled").default(true),

  // Metadata
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
