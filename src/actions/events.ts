"use server";

import { eventApplication, publicEvent } from "@/drizzle/schema/events";
import { user } from "@/drizzle/schema/users";
import { db } from "@/lib/db";
import { and, eq, gte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createEventSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  type: z.enum(["partida", "treino", "grupo", "jogo-treino"]),
  location: z.string().min(3, "Localização é obrigatória"),
  startDate: z.date(),
  endDate: z.date().optional(),
  maxParticipants: z.string().optional(),
  isPublic: z.boolean().default(true),
  organizerId: z.string(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

export async function createEvent(input: CreateEventInput) {
  try {
    const validatedData = createEventSchema.parse(input);

    const [newEvent] = await db
      .insert(publicEvent)
      .values({
        ...validatedData,
        status: "ativo",
      })
      .returning();

    revalidatePath("/playzone");
    return { success: true, data: newEvent };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: "Failed to create event" };
  }
}

export async function getEvent(eventId: number) {
  try {
    // Buscar evento sem relação (a relação não está definida no schema)
    // Usar select direto ao invés de query builder para evitar problemas com relações
    const [eventData] = await db
      .select()
      .from(publicEvent)
      .where(eq(publicEvent.id, eventId))
      .limit(1);

    if (!eventData) {
      console.error(`Event with id ${eventId} not found in database`);
      return { success: false, error: "Event not found" };
    }

    // Buscar organizador separadamente
    const [organizer] = await db
      .select()
      .from(user)
      .where(eq(user.id, eventData.organizerId))
      .limit(1);

    return { 
      success: true, 
      data: { 
        ...eventData, 
        organizer: organizer || null 
      } 
    };
  } catch (error) {
    console.error("Error fetching event:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    return { success: false, error: "Failed to fetch event" };
  }
}

export async function getEvents(options?: {
  limit?: number;
  organizerId?: string;
  status?: string;
  upcomingOnly?: boolean;
}) {
  try {
    const { limit = 10, organizerId, status, upcomingOnly = true } = options || {};

    const conditions = [];

    if (organizerId) {
      conditions.push(eq(publicEvent.organizerId, organizerId));
    }

    if (status) {
      conditions.push(eq(publicEvent.status, status));
    } else {
      // Por padrão, buscar apenas eventos ativos
      conditions.push(eq(publicEvent.status, "ativo"));
    }

    if (upcomingOnly) {
      // Buscar apenas eventos futuros
      conditions.push(gte(publicEvent.startDate, new Date()));
    }

    const events = await db.query.publicEvent.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: (publicEvent, { asc }) => [asc(publicEvent.startDate)],
      limit,
    });

    // Buscar organizadores para cada evento
    const eventsWithOrganizers = await Promise.all(
      events.map(async (event) => {
        const organizer = await db
          .select()
          .from(user)
          .where(eq(user.id, event.organizerId))
          .limit(1);

        return {
          ...event,
          organizer: organizer[0] || null,
        };
      }),
    );

    return { success: true, data: eventsWithOrganizers };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error: "Failed to fetch events", data: [] };
  }
}

export async function checkEventParticipation(eventId: number, userId: string) {
  try {
    const [application] = await db
      .select()
      .from(eventApplication)
      .where(
        and(
          eq(eventApplication.eventId, eventId),
          eq(eventApplication.userId, userId)
        )
      )
      .limit(1);

    if (!application) {
      return { success: true, data: { isParticipant: false, status: null } };
    }

    return {
      success: true,
      data: {
        isParticipant: application.status === "aceito",
        status: application.status,
      },
    };
  } catch (error) {
    console.error("Error checking event participation:", error);
    return {
      success: false,
      error: "Failed to check participation",
      data: { isParticipant: false, status: null },
    };
  }
}
