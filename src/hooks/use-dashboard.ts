"use client";

import { useQuery } from "@tanstack/react-query";
import { getEvents } from "@/actions/match-sessions.actions";
import { getTeamSquad } from "@/actions/teams.actions";
import { useTeams } from "@/hooks/use-teams";

export interface DashboardEvent {
  id: number;
  type: string;
  title: string;
  date: string;
  time: string;
  location: string;
  confirmed: number;
  total: number;
}

export interface SquadMember {
  id: string | number;
  name: string;
  role: string;
  status: "confirmed" | "reserve" | "pending";
  isVerified: boolean;
}

export function useDashboardData() {
  const { activeTeamId, setActiveTeamId, myTeams } = useTeams();

  const { data: rawEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["dashboard", "events", activeTeamId],
    queryFn: async () => {
      if (!activeTeamId) return [];
      const response = await getEvents({ teamId: activeTeamId });
      return response.success ? response.data : [];
    },
    enabled: !!activeTeamId,
  });

  const { data: rawSquad, isLoading: squadLoading } = useQuery({
    queryKey: ["dashboard", "squad", activeTeamId],
    queryFn: async () => {
      if (!activeTeamId) return [];
      const response = await getTeamSquad({ teamId: activeTeamId });
      return response.success ? response.data : [];
    },
    enabled: !!activeTeamId,
  });

  const isLoading = eventsLoading || squadLoading;

  // Transform raw DB events to Dashboard expected format
  const events: DashboardEvent[] = (rawEvents ?? []).map(e => {
    const d = new Date(e.startDate);
    return {
      id: e.id,
      type: e.type,
      title: e.title,
      date: d.toLocaleDateString("pt-PT", { weekday: "short", day: "2-digit", month: "short" }),
      time: d.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }),
      location: e.location,
      confirmed: Number(e.currentParticipants) || 0,
      total: Number(e.maxParticipants) || 14,
    };
  });

  const squad: SquadMember[] = rawSquad ?? [];

  const confirmedCount = squad.filter(p => p.status === "confirmed").length;
  const reserveCount = squad.filter(p => p.status === "reserve").length;
  const pendingCount = squad.filter(p => p.status === "pending").length;

  return {
    activeTeamId,
    setActiveTeamId,
    myTeams,
    events,
    squad,
    confirmedCount,
    reserveCount,
    pendingCount,
    isLoading,
  };
}
