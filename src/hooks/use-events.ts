"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getEvents } from "@/actions/events";

export interface EventDisplay {
  id: number;
  emoji: string;
  title: string;
  status: "confirmed" | "pending";
  date: string;
  time: string;
  location: string;
  players: string;
}

// Mapeamento de tipos de eventos para emojis
const eventTypeEmojis: Record<string, string> = {
  partida: "⚽",
  treino: "🏃",
  grupo: "👥",
  "jogo-treino": "🎯",
  torneio: "🏆",
  competicao: "🥇",
  evento: "🎉",
};

// Tipo para evento do banco de dados
interface DatabaseEvent {
  id: number;
  title: string;
  type: string;
  startDate: Date | string;
  status?: string | null;
  currentParticipants?: string | number | null;
  maxParticipants?: string | number | null;
  location: string;
}

// Função para formatar eventos do banco para o formato da UI
function formatEventForDisplay(event: DatabaseEvent): EventDisplay {
  const startDate = new Date(event.startDate);
  const formattedDate = format(startDate, "EEE dd/MM", { locale: ptBR });
  const formattedTime = format(startDate, "HH:mm");

  const emoji = eventTypeEmojis[event.type] || "📅";
  const status = event.status === "ativo" ? "confirmed" : "pending";
  const players = `${event.currentParticipants || 0}${
    event.maxParticipants ? `/${event.maxParticipants}` : ""
  }`;

  return {
    id: event.id,
    emoji,
    title: event.title,
    status,
    date: formattedDate,
    time: formattedTime,
    location: event.location,
    players,
  };
}

interface UseEventsOptions {
  limit?: number;
  organizerId?: string;
  status?: string;
  upcomingOnly?: boolean;
  enabled?: boolean;
}

export function useEvents(options?: UseEventsOptions) {
  const {
    limit = 10,
    organizerId,
    status,
    upcomingOnly = true,
    enabled = true,
  } = options || {};

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ["events", { limit, organizerId, status, upcomingOnly }],
    queryFn: async () => {
      const result = await getEvents({
        limit,
        organizerId,
        status,
        upcomingOnly,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch events");
      }

      // Formatar eventos para o formato da UI
      return result.data?.map(formatEventForDisplay) || [];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });

  return {
    events: data || [],
    isLoading,
    isRefetching,
    error,
    refetch,
  };
}

// Hook simplificado para uso direto (retorna apenas o array de eventos)
export function useEventsList(options?: UseEventsOptions): EventDisplay[] {
  const { events } = useEvents(options);
  return events;
}

// Interface para dados completos do evento
export interface EventDetails {
  id: number;
  title: string;
  description?: string;
  type: "partida" | "treino" | "grupo" | "torneio" | "competicao" | "evento";
  location: string;
  city?: string;
  country?: string;
  startDate: string;
  endDate?: string;
  gameStyle?: string;
  experienceLevel?: string;
  minAge?: string;
  maxAge?: string;
  gender?: string;
  positionNeeded?: string;
  participationCriteria: Record<string, any>;
  currentParticipants: number;
  maxParticipants?: number;
  organizerId: string;
  organizerName: string;
  organizerEmail?: string;
  language?: string;
  images?: string[];
  isFree: boolean;
  hasPrize: boolean;
  isFavorited?: boolean;
  isFollowingOrganizer?: boolean;
}

// Hook para buscar um único evento (dados completos)
export function useEvent(eventId: number | null) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      if (!eventId) return null;

      const { getEvent } = await import("@/actions/events");
      const result = await getEvent(eventId);

      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to fetch event");
      }

      const dbEvent = result.data;

      // Map DB event to EventDetails interface
      const mappedEvent: EventDetails = {
        id: dbEvent.id,
        title: dbEvent.title,
        description: dbEvent.description || undefined,
        type: dbEvent.type as any,
        location: dbEvent.location,
        city: dbEvent.city || undefined,
        country: dbEvent.country || undefined,
        startDate: dbEvent.startDate.toISOString(),
        endDate: dbEvent.endDate?.toISOString(),
        gameStyle: dbEvent.gameStyle || undefined,
        experienceLevel: dbEvent.experienceLevel || undefined,
        minAge: dbEvent.minAge || undefined,
        maxAge: dbEvent.maxAge || undefined,
        gender: dbEvent.gender || undefined,
        positionNeeded: dbEvent.positionNeeded || undefined,
        participationCriteria:
          (dbEvent.participationCriteria as Record<string, unknown>) || {},
        currentParticipants: parseInt(dbEvent.currentParticipants || "0", 10),
        maxParticipants: dbEvent.maxParticipants
          ? parseInt(dbEvent.maxParticipants, 10)
          : undefined,
        organizerId: dbEvent.organizerId,
        organizerName: dbEvent.organizer?.name || "Organizador",
        organizerEmail: dbEvent.organizer?.email,
        language: dbEvent.language || undefined,
        images: (dbEvent.images as string[]) || [],
        isFree: true, // TODO: Add to schema
        hasPrize: false, // TODO: Add to schema
        isFavorited: false,
        isFollowingOrganizer: false,
      };

      return mappedEvent;
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    event: data || null,
    isLoading,
    error,
    refetch,
  };
}
