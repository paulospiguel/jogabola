"use server";

import { DEFAULT_RATING } from "@/lib/self-assessment";
import { getEventAttendanceWithUsers } from "./attendance.actions";
import { getRatingsForUsers } from "./player-ratings.actions";

export interface BalancedPlayer {
  id: string;
  name: string;
  image: string | null;
  rating: number;
  isGuest: boolean;
  /** True when the rating is the neutral default (no self-assessment yet). */
  isDefaultRating?: boolean;
}

/** Convidado avulso, com a avaliação atribuída manualmente no setup. */
export interface BalancerGuest {
  id: string;
  name: string;
  rating: number;
}

export async function balanceTeamsWithAI(
  eventId: number,
  guests: BalancerGuest[],
) {
  try {
    // 1. Get current attendance
    const attendanceResult = await getEventAttendanceWithUsers(eventId);
    if (!attendanceResult.success) {
      return {
        success: false as const,
        error: "Falha ao obter jogadores confirmados",
      };
    }

    const confirmedPlayers = attendanceResult.data.confirmed;

    // 2. Load real self-assessment ratings; fall back to a neutral default
    //    for athletes who haven't completed their self-assessment yet.
    const ratings = await getRatingsForUsers(confirmedPlayers.map(p => p.id));

    const pool: BalancedPlayer[] = confirmedPlayers.map(p => {
      const real = ratings.get(p.id);
      return {
        id: p.id,
        name: p.name,
        image: p.image,
        rating: real ?? DEFAULT_RATING,
        isGuest: false,
        isDefaultRating: real == null,
      };
    });

    // 3. Add guests with their assigned ratings
    for (const guest of guests) {
      pool.push({
        id: guest.id,
        name: guest.name,
        image: null,
        rating: guest.rating,
        isGuest: true,
        isDefaultRating: false,
      });
    }

    // 4. Sort by rating (descending)
    pool.sort((a, b) => b.rating - a.rating);

    // 5. Snake draft distribution to balance teams
    const teamA: BalancedPlayer[] = [];
    const teamB: BalancedPlayer[] = [];

    // Snake draft pattern: A, B, B, A, A, B, B, A...
    pool.forEach((player, index) => {
      const mod = index % 4;
      if (mod === 0 || mod === 3) {
        teamA.push(player);
      } else {
        teamB.push(player);
      }
    });

    // 6. Calculate averages
    const calcAvg = (team: BalancedPlayer[]) =>
      team.length > 0
        ? (team.reduce((acc, p) => acc + p.rating, 0) / team.length).toFixed(1)
        : "0.0";

    const avgA = calcAvg(teamA);
    const avgB = calcAvg(teamB);

    return {
      success: true as const,
      data: {
        teamA,
        teamB,
        avgA,
        avgB,
      },
    };
  } catch (error) {
    console.error("Error balancing teams:", error);
    return { success: false as const, error: "Erro ao balancear equipas" };
  }
}
