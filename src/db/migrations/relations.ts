import { relations } from "drizzle-orm/relations";
import {
  account,
  eventApplication,
  onboarding,
  profile,
  publicEvent,
  session,
  timer,
  user,
} from "./schema";

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  accounts: many(account),
  sessions: many(session),
  profiles: many(profile),
  onboardings: many(onboarding),
  publicEvents: many(publicEvent),
  eventApplications: many(eventApplication),
  timers: many(timer),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, {
    fields: [profile.userId],
    references: [user.id],
  }),
}));

export const onboardingRelations = relations(onboarding, ({ one }) => ({
  user: one(user, {
    fields: [onboarding.userId],
    references: [user.id],
  }),
}));

export const publicEventRelations = relations(publicEvent, ({ one, many }) => ({
  user: one(user, {
    fields: [publicEvent.organizerId],
    references: [user.id],
  }),
  eventApplications: many(eventApplication),
}));

export const eventApplicationRelations = relations(
  eventApplication,
  ({ one }) => ({
    publicEvent: one(publicEvent, {
      fields: [eventApplication.eventId],
      references: [publicEvent.id],
    }),
    user: one(user, {
      fields: [eventApplication.userId],
      references: [user.id],
    }),
  }),
);

export const timerRelations = relations(timer, ({ one }) => ({
  user: one(user, {
    fields: [timer.userId],
    references: [user.id],
  }),
}));
