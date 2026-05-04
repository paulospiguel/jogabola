"use server";

import { and, eq, gte, lt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { queryEventById, queryEvents } from "@/db/queries/events";
import { matchReservations, matchSessions, teams, user } from "@/db/schema";
import { getAuthUser, withAction } from "@/lib/action-helpers";
import {
  createMatchReservationSchema,
  createMatchSessionSchema,
} from "@/schemas/match-sessions.schema";
import type { EventStatus } from "@/types/events";

function toEventStatus(status: string): EventStatus {
  if (status === "confirmed" || status === "cancelled") {
    return status;
  }
  return "scheduled";
}

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
  recurrence?: string;
}) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return { success: false as const, error: { code: "UNAUTHORIZED" } };
  }

  const manager = await db.query.user.findFirst({
    where: eq(user.id, authUser.id),
  });

  if (manager?.role !== "captain") {
    return { success: false as const, error: { code: "MANAGER_REQUIRED" } };
  }

  // Find or create a default team for this organizer
  let teamId: number;
  const existing = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.ownerId, authUser.id))
    .limit(1);
  if (existing.length > 0) {
    teamId = existing[0].id;
  } else {
    const slug = `team-${authUser.id.slice(0, 8)}`;
    const [created] = await db
      .insert(teams)
      .values({ name: "Minha Equipa", slug, ownerId: authUser.id })
      .returning({ id: teams.id });
    teamId = created.id;
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
      recurrence: input.recurrence || "once",
      currency: "EUR",
    })
    .returning();

  revalidatePath("/arena/events");
  revalidatePath(`/event/${event.id}`);
  return { success: true as const, data: toEventView(event) };
}

export async function updateEvent(
  eventId: number,
  input: {
    status?: string;
    startDate?: Date;
    endDate?: Date;
    recurrence?: string;
    location?: string;
  },
) {
  const [event] = await db
    .update(matchSessions)
    .set({
      ...(input.status && { status: input.status }),
      ...(input.startDate && { startsAt: input.startDate }),
      ...(input.endDate && { endsAt: input.endDate }),
      ...(input.recurrence && { recurrence: input.recurrence }),
      ...(input.location && { location: input.location }),
      updatedAt: new Date(),
    })
    .where(eq(matchSessions.id, eventId))
    .returning();

  revalidatePath("/arena/events");
  revalidatePath(`/arena/events/${eventId}`);
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
  return {
    success: true as const,
    data: events.map(event => ({
      ...event,
      status: toEventStatus(event.status),
    })),
  };
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
    teamId: event.teamId,
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
    priceCents: event.priceCents ?? 0,
    currency: event.currency || "EUR",
    organizerId: "",
    organizer: null,
    language: null,
    images: [] as string[],
    status: toEventStatus(event.status),
    recurrence: event.recurrence,
    createdAt: event.createdAt ?? new Date(),
    updatedAt: event.updatedAt ?? new Date(),
  };
}
