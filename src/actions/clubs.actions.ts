"use server";

import { z } from "zod";
import { db } from "@/db/client";
import * as clubCalendar from "@/db/queries/club-calendar";
import { withAuthAction } from "@/lib/action-helpers";
import {
  attachTeamToClubSchema,
  clubScopeSchema,
  createClubWithTeamSchema,
  createOpponentSchema,
  createSeasonSchema,
  deleteOpponentSchema,
  deleteSeasonSchema,
  updateOpponentSchema,
  updateSeasonSchema,
} from "@/schemas/club-calendar.schema";

// Club, season and opponent Server Actions (ADR 0004/0005). Identity always
// comes from the session; club scope is derived from persisted rows.

const noInput = z.object({}).optional();

export const createClubWithTeam = withAuthAction(
  createClubWithTeamSchema,
  (user, input) => clubCalendar.createClubWithTeam(db, user.id, input),
);

export const attachTeamToClub = withAuthAction(
  attachTeamToClubSchema,
  (user, input) => clubCalendar.attachTeamToClub(db, user.id, input),
);

export const listMyClubs = withAuthAction(noInput, user =>
  clubCalendar.listMyClubs(db, user.id),
);

export const listAttachableTeams = withAuthAction(noInput, user =>
  clubCalendar.listAttachableTeams(db, user.id),
);

export const listClubSeasons = withAuthAction(clubScopeSchema, (user, input) =>
  clubCalendar.listClubSeasons(db, user.id, input),
);

export const createSeason = withAuthAction(createSeasonSchema, (user, input) =>
  clubCalendar.createSeason(db, user.id, input),
);

export const updateSeason = withAuthAction(updateSeasonSchema, (user, input) =>
  clubCalendar.updateSeason(db, user.id, input),
);

export const deleteSeason = withAuthAction(deleteSeasonSchema, (user, input) =>
  clubCalendar.deleteSeason(db, user.id, input),
);

export const listClubOpponents = withAuthAction(
  clubScopeSchema,
  (user, input) => clubCalendar.listClubOpponents(db, user.id, input),
);

export const createOpponent = withAuthAction(
  createOpponentSchema,
  (user, input) => clubCalendar.createOpponent(db, user.id, input),
);

export const updateOpponent = withAuthAction(
  updateOpponentSchema,
  (user, input) => clubCalendar.updateOpponent(db, user.id, input),
);

export const deleteOpponent = withAuthAction(
  deleteOpponentSchema,
  (user, input) => clubCalendar.deleteOpponent(db, user.id, input),
);
