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

export const teamPaymentSettings = pgTable(
  "team_payment_settings",
  {
    id: serial("id").primaryKey(),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),

    // Stripe
    stripeEnabled: boolean("stripe_enabled").notNull().default(false),
    stripeAccountId: text("stripe_account_id"),

    // MBWay
    mbwayEnabled: boolean("mbway_enabled").notNull().default(false),
    mbwayPhone: text("mbway_phone"),
    mbwayName: text("mbway_name"),

    // Cash
    cashEnabled: boolean("cash_enabled").notNull().default(true),
    cashInstructions: text("cash_instructions"),

    // Transfer
    transferEnabled: boolean("transfer_enabled").notNull().default(false),
    transferIban: text("transfer_iban"),
    transferName: text("transfer_name"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  table => ({
    teamIdx: uniqueIndex("team_payment_settings_team_idx").on(table.teamId),
  }),
);
