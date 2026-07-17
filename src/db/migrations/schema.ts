import {
  boolean,
  doublePrecision,
  foreignKey,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

export const account = pgTable(
  "account",
  {
    id: text().primaryKey().notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      mode: "string",
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      mode: "string",
    }),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "account_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const session = pgTable(
  "session",
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    token: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "session_user_id_user_id_fk",
    }).onDelete("cascade"),
    unique("session_token_unique").on(table.token),
  ],
);

export const profile = pgTable(
  "profile",
  {
    id: serial().primaryKey().notNull(),
    userId: text("user_id").notNull(),
    role: text().notNull(),
    name: text().notNull(),
    location: text(),
    experience: text(),
    availability: text(),
    goals: jsonb().default([]),
    waitlistApps: jsonb("waitlist_apps").default([]),
    notificationsEnabled: boolean("notifications_enabled").default(true),
    newsletterEnabled: boolean("newsletter_enabled").default(true),
    earlyAccessEnabled: boolean("early_access_enabled").default(true),
    completed: boolean().default(false),
    completedAt: timestamp("completed_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    customFields: jsonb("custom_fields").default({}),
    nickname: text(),
    dateOfBirth: timestamp("date_of_birth", { mode: "string" }),
    nationality: text(),
    country: text(),
    city: text(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "profile_user_id_user_id_fk",
    }).onDelete("cascade"),
    unique("profile_user_id_unique").on(table.userId),
    unique("profile_nickname_unique").on(table.nickname),
  ],
);

export const user = pgTable(
  "user",
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  table => [unique("user_email_unique").on(table.email)],
);

export const verification = pgTable("verification", {
  id: text().primaryKey().notNull(),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }),
  updatedAt: timestamp("updated_at", { mode: "string" }),
});

export const onboarding = pgTable(
  "onboarding",
  {
    id: serial().primaryKey().notNull(),
    userId: text("user_id"),
    email: text().notNull(),
    name: text().notNull(),
    role: text().notNull(),
    location: text(),
    experience: text(),
    availability: text(),
    goals: jsonb().default([]),
    waitlistApps: jsonb("waitlist_apps").default([]),
    customFields: jsonb("custom_fields").default({}),
    notificationsEnabled: boolean("notifications_enabled").default(true),
    newsletterEnabled: boolean("newsletter_enabled").default(true),
    earlyAccessEnabled: boolean("early_access_enabled").default(true),
    completed: boolean().default(false),
    completedAt: timestamp("completed_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
    nickname: text(),
    dateOfBirth: timestamp("date_of_birth", { mode: "string" }),
    nationality: text(),
    country: text(),
    city: text(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "onboarding_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const publicEvent = pgTable(
  "public_event",
  {
    id: serial().primaryKey().notNull(),
    organizerId: text("organizer_id").notNull(),
    title: text().notNull(),
    description: text(),
    type: text().notNull(),
    location: text().notNull(),
    city: text(),
    country: text(),
    latitude: doublePrecision(),
    longitude: doublePrecision(),
    searchRadius: doublePrecision("search_radius"),
    startDate: timestamp("start_date", { mode: "string" }).notNull(),
    endDate: timestamp("end_date", { mode: "string" }),
    gameStyle: text("game_style"),
    experienceLevel: text("experience_level"),
    minAge: text("min_age"),
    maxAge: text("max_age"),
    gender: text(),
    positionNeeded: text("position_needed"),
    participationCriteria: jsonb("participation_criteria").default({}),
    maxParticipants: text("max_participants"),
    currentParticipants: text("current_participants").default("0"),
    isPublic: boolean("is_public").default(true),
    language: text(),
    images: jsonb().default([]),
    status: text().default("ativo"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.organizerId],
      foreignColumns: [user.id],
      name: "public_event_organizer_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const eventApplication = pgTable(
  "event_application",
  {
    id: serial().primaryKey().notNull(),
    eventId: integer("event_id").notNull(),
    userId: text("user_id").notNull(),
    status: text().default("pendente"),
    message: text(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
  },
  table => [
    foreignKey({
      columns: [table.eventId],
      foreignColumns: [publicEvent.id],
      name: "event_application_event_id_public_event_id_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "event_application_user_id_user_id_fk",
    }).onDelete("cascade"),
  ],
);

export const timer = pgTable(
  "timer",
  {
    userId: varchar("user_id", { length: 255 }).notNull(),
    key: varchar({ length: 255 }).notNull(),
    data: text().notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  table => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: "timer_user_id_user_id_fk",
    }).onDelete("cascade"),
    primaryKey({
      columns: [table.userId, table.key],
      name: "timer_user_id_key_pk",
    }),
  ],
);
