"use client";

import { createContext, useContext } from "react";

interface LockedTeamContextValue {
  lockedTeamId: number | null;
}

const LockedTeamContext = createContext<LockedTeamContextValue>({
  lockedTeamId: null,
});

export function useLockedTeam() {
  return useContext(LockedTeamContext);
}

interface LockedTeamProviderProps {
  teamId: number;
  children: React.ReactNode;
}

/**
 * Wraps a page or section that belongs to a specific team.
 * While active, the TeamSwitcher in the top header and sidebar
 * will render as read-only (disabled), because the context
 * belongs to a single team and switching makes no sense here.
 */
export function LockedTeamProvider({ teamId, children }: LockedTeamProviderProps) {
  return (
    <LockedTeamContext.Provider value={{ lockedTeamId: teamId }}>
      {children}
    </LockedTeamContext.Provider>
  );
}
