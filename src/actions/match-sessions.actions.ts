"use server";

import { and, eq, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { matchReservations, matchSessions } from "@/db/schema";
import {
  createMatchReservationSchema,
  createMatchSessionSchema,
} from "@/schemas/match-sessions.schema";
import type { ActionResult } from "@/types/common";

export async function createMatchSessionAction(
  input: unknown,
): Promise<ActionResult<typeof matchSessions.$inferSelect>> {
  return createMatchSession(input);
}

export async function createMatchSession(
  input: unknown,
): Promise<ActionResult<typeof matchSessions.$inferSelect>> {
  const parsed = createMatchSessionSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const [matchSession] = await db
    .insert(matchSessions)
    .values(parsed.data)
    .returning();

  return { success: true, data: matchSession };
}

export async function createMatchReservationAction(
  input: unknown,
): Promise<ActionResult<typeof matchReservations.$inferSelect>> {
  return createMatchReservation(input);
}

export async function createMatchReservation(
  input: unknown,
): Promise<ActionResult<typeof matchReservations.$inferSelect>> {
  const parsed = createMatchReservationSchema.safeParse(input);

  if (!parsed.success) {
    return validationError(parsed.error.flatten().fieldErrors);
  }

  const [reservation] = await db
    .insert(matchReservations)
    .values(parsed.data)
    .returning();

  return { success: true, data: reservation };
}

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
    return { success: false as const, error: "Event not found" };
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

  const data = events.map(toEventView);

  return { success: true as const, data };
}

function toEventView(event: typeof matchSessions.$inferSelect) {
  return {
    id: event.id,
    title: event.title,
    description: null,
    type: "partida",
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
    participationCriteria: {},
    currentParticipants: "0",
    maxParticipants: event.capacity?.toString() ?? null,
    organizerId: "",
    organizer: null,
    language: null,
    images: [],
    status: "ativo",
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

function validationError(fieldErrors: Record<string, string[] | undefined>) {
  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).filter(([, value]) => value?.length),
      ) as Record<string, string[]>,
    },
  } as const;
}
