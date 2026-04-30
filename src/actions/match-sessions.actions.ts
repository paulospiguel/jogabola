"use server";

import { and, eq, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { matchReservations, matchSessions } from "@/db/schema";
import {
  createMatchReservationSchema,
  createMatchSessionSchema,
} from "@/schemas/match-sessions.schema";
import { withAction } from "@/lib/action-helpers";

export const createMatchSession = withAction(
  createMatchSessionSchema,
  async (data) => {
    const [matchSession] = await db
      .insert(matchSessions)
      .values(data)
      .returning();
    return { success: true, data: matchSession };
  },
);

export const createMatchReservation = withAction(
  createMatchReservationSchema,
  async (data) => {
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
  const [event] = await db
    .insert(matchSessions)
    .values({
      teamId: 1,
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
  const [eventData] = await db
    .select()
    .from(matchSessions)
    .where(eq(matchSessions.id, eventId))
    .limit(1);

  if (!eventData) {
    return { success: false as const, error: { code: "EVENT_NOT_FOUND" } };
  }

  return { success: true as const, data: toEventView(eventData) };
}

export async function getEvents(options?: {
  limit?: number;
  organizerId?: string;
  status?: string;
  upcomingOnly?: boolean;
}) {
  const { limit = 10, upcomingOnly = true } = options || {};
  const conditions = [];

  if (upcomingOnly) conditions.push(gte(matchSessions.startsAt, new Date()));

  const events = await db
    .select()
    .from(matchSessions)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(matchSessions.startsAt)
    .limit(limit);

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
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}
