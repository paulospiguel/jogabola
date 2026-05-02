"use server";

import { and, eq, gte, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { queryEventById, queryEvents } from "@/db/queries/events";
import { matchReservations, matchSessions, teams } from "@/db/schema";
import { withAction } from "@/lib/action-helpers";
import {
  createMatchReservationSchema,
  createMatchSessionSchema,
} from "@/schemas/match-sessions.schema";

export const createMatchSession = withAction(
  createMatchSessionSchema,
  async data => {
    const [matchSession] = await db
      .insert(matchSessions)
      .values(data)
      .returning();
    return { success: true, data: matchSession };
  },
);

export const createMatchReservation = withAction(
  createMatchReservationSchema,
  async data => {
    const [reservation] = await db
      .insert(matchReservations)
      .values(data)
      .returning();
    return { success: true, data: reservation };
  },
);

export async function createEvent(input: {
  title: string;
  description?: string;
  type: "game" | "training" | "challenge";
  location: string;
  startDate: Date;
  endDate?: Date;
  maxParticipants?: string;
  isPublic?: boolean;
  organizerId?: string;
}) {
  // Find or create a default team for this organizer
  let teamId: number;
  if (input.organizerId) {
    const existing = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.ownerId, input.organizerId))
      .limit(1);
    if (existing.length > 0) {
      teamId = existing[0].id;
    } else {
      const slug = `team-${input.organizerId.slice(0, 8)}`;
      const [created] = await db
        .insert(teams)
        .values({ name: "Minha Equipa", slug, ownerId: input.organizerId })
        .returning({ id: teams.id });
      teamId = created.id;
    }
  } else {
    return { success: false as const, error: { code: "ORGANIZER_REQUIRED" } };
  }

  const [event] = await db
    .insert(matchSessions)
    .values({
      teamId,
      title: input.title,
      location: input.location,
      startsAt: input.startDate,
      endsAt: input.endDate,
      capacity: input.maxParticipants
        ? Number.parseInt(input.maxParticipants, 10)
        : null,
      currency: "EUR",
    })
    .returning();

  revalidatePath("/arena/events");
  return { success: true as const, data: toEventView(event) };
}

export async function getEvent(eventId: number) {
  const eventData = await queryEventById(eventId);
  if (!eventData) {
    return { success: false as const, error: { code: "EVENT_NOT_FOUND" } };
  }
  return { success: true as const, data: toEventView(eventData) };
}

export async function getCalendarEvents(from: Date, to: Date) {
  const events = await db
    .select()
    .from(matchSessions)
    .where(
      and(gte(matchSessions.startsAt, from), lt(matchSessions.startsAt, to)),
    )
    .orderBy(matchSessions.startsAt);
  return { success: true as const, data: events };
}

export async function getEvents(options?: {
  limit?: number;
  organizerId?: string;
  status?: string;
  upcomingOnly?: boolean;
  teamId?: number | string;
}) {
  const { limit = 10, upcomingOnly = true, teamId } = options || {};
  const events = await queryEvents({ limit, upcomingOnly, teamId });
  return { success: true as const, data: events.map(toEventView) };
}

function toEventView(event: typeof matchSessions.$inferSelect) {
  return {
    id: event.id,
    title: event.title,
    description: null,
    type: "partida" as const,
    location: event.location,
    city: null,
    country: null,
    startDate: event.startsAt,
    endDate: event.endsAt,
    gameStyle: null,
    experienceLevel: null,
    minAge: null,
    maxAge: null,
    gender: null,
    positionNeeded: null,
    participationCriteria: {} as Record<string, unknown>,
    currentParticipants: "0",
    maxParticipants: event.capacity?.toString() ?? null,
    organizerId: "",
    organizer: null,
    language: null,
    images: [] as string[],
    status: "ativo" as const,
    createdAt: event.createdAt ?? new Date(),
    updatedAt: event.updatedAt ?? new Date(),
  };
}
