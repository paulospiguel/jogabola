import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { teams } from "./teams";
import { user } from "./users";

export const TRANSFER_STATUSES = [
  "pending",
  "accepted",
  "cancelled",
  "expired",
] as const;

export type TransferStatus = (typeof TRANSFER_STATUSES)[number];

/**
 * Team ownership transfer requests. Only the sha256 of the token is stored;
 * at most one `pending` request exists per team.
 */
export const teamOwnershipTransfers = pgTable(
  "team_ownership_transfers",
  {
    id: serial("id").primaryKey(),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    toUserId: text("to_user_id").references(() => user.id, {
      onDelete: "cascade",
    }),
    /** Lowercased, trimmed recipient email. */
    toEmail: text("to_email"),
    tokenHash: text("token_hash").notNull(),
    status: text("status").$type<TransferStatus>().notNull().default("pending"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
  },
  table => [
    uniqueIndex("team_ownership_transfers_one_pending_idx")
      .on(table.teamId)
      .where(sql`${table.status} = 'pending'`),
    uniqueIndex("team_ownership_transfers_token_hash_idx").on(table.tokenHash),
    index("team_ownership_transfers_to_user_idx").on(table.toUserId),
    index("team_ownership_transfers_to_email_idx").on(table.toEmail),
    check(
      "team_ownership_transfers_status_check",
      sql`${table.status} IN ('pending', 'accepted', 'cancelled', 'expired')`,
    ),
    check(
      "team_ownership_transfers_recipient_check",
      sql`${table.toUserId} IS NOT NULL OR ${table.toEmail} IS NOT NULL`,
    ),
  ],
);
