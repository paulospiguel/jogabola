"use client";

import { getProfileData } from "@/actions/profile";
import { getJourneyRoute } from "@/components/journey-router";
import { JOURNEY_ROUTES } from "@/constants/journey";
import { useSession } from "@/lib/auth-client";
import type { Role } from "@/schemas/profile";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Rotas comuns acessíveis por todos os roles
const COMMON_ROUTES = ["/profile", "/playzone/events"];

// Mapeamento de rotas por jornada

/**
 * Função para verificar se o usuário tem acesso à rota atual
 */
function checkJourneyAccess(role: Role, currentPath: string): boolean {
  const expectedPath = JOURNEY_ROUTES[role];
  const isCommonRoute = COMMON_ROUTES.some(route =>
    currentPath.startsWith(route),
  );
  return isCommonRoute || currentPath.startsWith(expectedPath);
}

/**
 * Hook para proteger páginas baseado na jornada do usuário
 * Verifica se o usuário tem acesso à rota atual baseado no seu role
 * Redireciona automaticamente se não tiver acesso
 */
export function useJourneyGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    async function checkJourney() {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const profileResult = await getProfileData(session.user.id);

        if (profileResult.success && profileResult.data?.role) {
          const userRole = profileResult.data.role as Role;
          setRole(userRole);

          // Verificar se tem acesso à rota atual
          const access = checkJourneyAccess(userRole, pathname);
          setHasAccess(access);

          // Se não tem acesso, redirecionar para a rota correta da jornada
          if (!access) {
            const journeyRoute = getJourneyRoute(userRole);
            router.push(journeyRoute);
          }
        } else {
          // Sem role definido - permitir acesso (onboarding opcional)
          setHasAccess(true);
        }
      } catch (error) {
        console.error("Error checking journey:", error);
        setHasAccess(true); // Em caso de erro, permitir acesso
      } finally {
        setIsLoading(false);
      }
    }

    checkJourney();
  }, [session?.user?.id, pathname, router]);

  return {
    role,
    hasAccess,
    isLoading,
  };
}

