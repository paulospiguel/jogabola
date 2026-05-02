"use client";

import { createContext, useContext, useState } from "react";
import { NoTeamModal } from "./no-team-modal";

interface TeamGateContextValue {
  hasTeam: boolean;
  role: string | null;
  requireTeam: () => boolean; // returns true if has team (proceed), false + opens modal if not
}

const TeamGateContext = createContext<TeamGateContextValue>({
  hasTeam: true,
  role: null,
  requireTeam: () => true,
});

export function useTeamGate() {
  return useContext(TeamGateContext);
}

interface TeamGateProviderProps {
  hasTeam: boolean;
  role: string | null;
  children: React.ReactNode;
}

export function TeamGateProvider({ hasTeam, role, children }: TeamGateProviderProps) {
  const [modalOpen, setModalOpen] = useState(false);

  function requireTeam() {
    if (hasTeam || role !== "captain") return true;
    setModalOpen(true);
    return false;
  }

  return (
    <TeamGateContext.Provider value={{ hasTeam, role, requireTeam }}>
      {children}
      <NoTeamModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </TeamGateContext.Provider>
  );
}
