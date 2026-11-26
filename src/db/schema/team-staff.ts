import { sql } from "drizzle-orm";
import {
  check,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { STAFF_PERMISSIONS, STAFF_TITLES } from "../../lib/staff-permissions";
import { teams } from "./teams";
import { user } from "./users";

const quoteList = (values: readonly string[]) =>
  values.map(value => `'${value}'`).join(", ");

/** Team staff. The owner (`teams.owner_id`) never has a row here. */
export const teamStaff = pgTable(
  "team_staff",
  {
    id: serial("id").primaryKey(),
    teamId: integer("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("other"),
    permissions: text("permissions")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  table => [
    uniqueIndex("team_staff_team_user_idx").on(table.teamId, table.userId),
    check(
      "team_staff_permissions_check",
      sql`${table.permissions} <@ ARRAY[${sql.raw(quoteList(STAFF_PERMISSIONS))}]::text[]`,
    ),
    check(
      "team_staff_title_check",
      sql`${table.title} IN (${sql.raw(quoteList(STAFF_TITLES))})`,
    ),
  ],
);

/** Append-only audit log of staff and ownership changes. */
export const teamStaffEvents = pgTable("team_staff_events", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  actorUserId: text("actor_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  subjectUserId: text("subject_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  type: text("type").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
