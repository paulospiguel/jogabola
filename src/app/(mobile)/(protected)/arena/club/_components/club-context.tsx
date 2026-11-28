"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef } from "react";
import { useTeams } from "@/hooks/use-teams";
import type { ClubSummary } from "../_hooks/use-club-calendar";

export interface ClubContextValue {
  club: ClubSummary;
  /** Presentation only: the server re-checks admin rights on every write. */
  isAdmin: boolean;
  /** Presentation only: fixture writes need the registered team owner. */
  canCreateFixtures: boolean;
}

const ClubContext = createContext<ClubContextValue | null>(null);

export function ClubProvider({
  club,
  children,
}: {
  club: ClubSummary;
  children: React.ReactNode;
}) {
  return (
    <ClubContext.Provider
      value={{
        club,
        isAdmin: club.role === "admin",
        canCreateFixtures: club.ownedTeams.length > 0,
      }}
    >
      <ClubTeamWatcher />
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const value = useContext(ClubContext);
  if (!value) throw new Error("useClub must be used inside <ClubProvider>");
  return value;
}

/**
 * When the captain switches team while inside a club, go back to the
 * "Clube" entry so the area follows the new team context.
 */
function ClubTeamWatcher() {
  const router = useRouter();
  const { activeTeamId } = useTeams();
  const initialTeamId = useRef<number | null>(null);

  useEffect(() => {
    if (activeTeamId === null) return;
    if (initialTeamId.current === null) {
      initialTeamId.current = activeTeamId;
      return;
    }
    if (initialTeamId.current !== activeTeamId) {
      router.push("/arena/club");
    }
  }, [activeTeamId, router]);

  return null;
}
