import { sql } from "drizzle-orm";
import {
  check,
  date,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { user } from "./users";

export const CLUB_MEMBER_ROLES = ["admin", "member"] as const;
export type ClubMemberRole = (typeof CLUB_MEMBER_ROLES)[number];

export const clubs = pgTable("clubs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const clubMembers = pgTable(
  "club_members",
  {
    id: serial("id").primaryKey(),
    clubId: integer("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").$type<ClubMemberRole>().notNull().default("member"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    unique("club_members_club_user_unique").on(table.clubId, table.userId),
    check("club_members_role_check", sql`${table.role} IN ('admin', 'member')`),
  ],
);

export const seasons = pgTable(
  "seasons",
  {
    id: serial("id").primaryKey(),
    clubId: integer("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    startsOn: date("starts_on"),
    endsOn: date("ends_on"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    // Target of the composite fixture FK that keeps seasons inside the club.
    unique("seasons_id_club_unique").on(table.id, table.clubId),
    unique("seasons_club_name_unique").on(table.clubId, table.name),
    check(
      "seasons_dates_check",
      sql`${table.endsOn} IS NULL OR ${table.startsOn} IS NULL OR ${table.endsOn} >= ${table.startsOn}`,
    ),
  ],
);

export const opponents = pgTable(
  "opponents",
  {
    id: serial("id").primaryKey(),
    clubId: integer("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  table => [
    // Target of the composite fixture FK that keeps opponents inside the club.
    unique("opponents_id_club_unique").on(table.id, table.clubId),
    unique("opponents_club_name_unique").on(table.clubId, table.name),
  ],
);
