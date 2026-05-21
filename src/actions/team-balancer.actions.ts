"use server";

import { getEventAttendanceWithUsers } from "./attendance.actions";

export interface BalancedPlayer {
  id: string;
  name: string;
  image: string | null;
  rating: number;
  isGuest: boolean;
}

export async function balanceTeamsWithAI(eventId: number, guestsCount: number) {
  try {
    // 1. Get current attendance
    const attendanceResult = await getEventAttendanceWithUsers(eventId);
    if (!attendanceResult.success) {
      return { success: false as const, error: "Falha ao obter jogadores confirmados" };
    }

    const confirmedPlayers = attendanceResult.data.confirmed;

    // 2. Prepare the pool of players with mock ratings
    const pool: BalancedPlayer[] = confirmedPlayers.map(p => ({
      id: p.id,
      name: p.name,
      image: p.image,
      rating: Math.floor(Math.random() * 5) + 5, // Mock rating between 5 and 9
      isGuest: false,
    }));

    // 3. Add fake guests
    for (let i = 1; i <= guestsCount; i++) {
      pool.push({
        id: `temp-guest-${Date.now()}-${i}`,
        name: `Convidado ${i}`,
        image: null,
        rating: Math.floor(Math.random() * 5) + 5,
        isGuest: true,
      });
    }

    // 4. Sort by rating (descending)
    pool.sort((a, b) => b.rating - a.rating);

    // 5. Snake draft distribution to balance teams
    const teamA: BalancedPlayer[] = [];
    const teamB: BalancedPlayer[] = [];

    // Snake draft pattern: A, B, B, A, A, B, B, A...
    pool.forEach((player, index) => {
      // Modulo 4 logic for snake draft
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

    // Wait 1.5s to simulate "AI processing"
    await new Promise(resolve => setTimeout(resolve, 1500));

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
