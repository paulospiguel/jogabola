import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AiPaymentCheck } from "@/types/payments";
import { matchReservations } from "./match-sessions";
import { user } from "./users";

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  matchReservationId: integer("match_reservation_id")
    .notNull()
    .references(() => matchReservations.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),
  method: text("method").notNull(),
  status: text("status").notNull().default("pending"),
  providerReference: text("provider_reference"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const paymentProofs = pgTable("payment_proofs", {
  id: serial("id").primaryKey(),
  paymentId: integer("payment_id")
    .notNull()
    .references(() => payments.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentPrechecks = pgTable("payment_prechecks", {
  id: serial("id").primaryKey(),
  paymentProofId: integer("payment_proof_id")
    .notNull()
    .references(() => paymentProofs.id, { onDelete: "cascade" }),
  decision: text("decision").notNull(),
  confidence: integer("confidence").notNull(),
  extractedAmount: integer("extracted_amount"),
  extractedDate: text("extracted_date"),
  extractedRecipient: text("extracted_recipient"),
  riskFlags: jsonb("risk_flags").$type<string[]>().default([]),
  rawCheck: jsonb("raw_check").$type<AiPaymentCheck>().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playerTrustEvents = pgTable("player_trust_events", {
  id: serial("id").primaryKey(),
  playerId: text("player_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const restrictedPlayers = pgTable("restricted_players", {
  id: serial("id").primaryKey(),
  playerId: text("player_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  reasonCode: text("reason_code").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});
