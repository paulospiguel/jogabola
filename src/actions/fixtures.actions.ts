"use server";

import { db } from "@/db/client";
import * as clubCalendar from "@/db/queries/club-calendar";
import { withAuthAction } from "@/lib/action-helpers";
import {
  createFixtureSchema,
  fixtureScopeSchema,
  linkMatchSessionSchema,
  listClubFixturesSchema,
} from "@/schemas/club-calendar.schema";

// Competitive fixture Server Actions (ADR 0004/0005). Reads return calendar
// fields only; out-of-scope and unknown fixtures share FIXTURE_NOT_FOUND.

export const createFixture = withAuthAction(
  createFixtureSchema,
  (user, input) => clubCalendar.createFixture(db, user.id, input),
);

export const linkMatchSession = withAuthAction(
  linkMatchSessionSchema,
  (user, input) => clubCalendar.linkMatchSession(db, user.id, input),
);

export const unlinkMatchSession = withAuthAction(
  fixtureScopeSchema,
  (user, input) => clubCalendar.unlinkMatchSession(db, user.id, input),
);

export const listClubFixtures = withAuthAction(
  listClubFixturesSchema,
  (user, input) => clubCalendar.listClubFixtures(db, user.id, input),
);

export const getFixture = withAuthAction(fixtureScopeSchema, (user, input) =>
  clubCalendar.getFixture(db, user.id, input),
);
