"use server";

import { publicEvent } from "@/drizzle/schema/events";
import { user } from "@/drizzle/schema/users";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
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
    const event = await db.query.publicEvent.findFirst({
      where: eq(publicEvent.id, eventId),
      with: {
        organizer: true, // Assuming relation exists, if not we might need to fetch separately or define it
      },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    // Fetch organizer details manually if relation is not set up in schema query builder
    const organizer = await db
      .select()
      .from(user)
      .where(eq(user.id, event.organizerId))
      .limit(1);

    return { success: true, data: { ...event, organizer: organizer[0] } };
  } catch (error) {
    console.error("Error fetching event:", error);
    return { success: false, error: "Failed to fetch event" };
  }
}
