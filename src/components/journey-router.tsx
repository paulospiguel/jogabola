"use client";

import type { Role } from "@/schemas/profile";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface JourneyRouterProps {
  role: Role;
  children: React.ReactNode;
  currentPath: string;
}

/**
 * Journey Router Component
 *
 * Redireciona os usuários para a área de gestão correta baseado na sua jornada/role.
 *
 * Mapeamento de rotas:
 * - PLAYER -> /arena (área de gestão do jogador)
 * - MANAGER -> /dashboard (área de gestão do treinador/gestor)
 * - FAN -> /fan-zone (área de gestão do fã)
 * - ORGANIZER -> /organizer (área de gestão do organizador)
 */
const JOURNEY_ROUTES: Record<Role, string> = {
  PLAYER: "/dashboard",
  MANAGER: "/arena",
  FAN: "/fan-zone",
  ORGANIZER: "/organizer",
};

export function JourneyRouter({
  role,
  children,
  currentPath,
}: JourneyRouterProps) {
  const router = useRouter();
  const expectedPath = JOURNEY_ROUTES[role];

  useEffect(() => {
    // Se o usuário não estiver na rota correta para sua jornada, redireciona
    if (!currentPath.startsWith(expectedPath)) {
      router.push(expectedPath);
    }
  }, [role, currentPath, expectedPath, router]);

  // Se estiver na rota correta, renderiza o conteúdo
  if (currentPath.startsWith(expectedPath)) {
    return <>{children}</>;
  }

  // Enquanto redireciona, mostra loading ou null
  return null;
}

/**
 * Hook para verificar se o usuário tem acesso à rota atual
 */
export function useJourneyAccess(role: Role, currentPath: string): boolean {
  const expectedPath = JOURNEY_ROUTES[role];
  return currentPath.startsWith(expectedPath);
}

/**
 * Função auxiliar para obter a rota de uma jornada
 */
export function getJourneyRoute(role: Role): string {
  return JOURNEY_ROUTES[role];
}
