"use client";

import { getProfileData } from "@/actions/profile";
import { getJourneyRoute } from "@/components/journey-router";
import { JOURNEY_ROUTES } from "@/constants/journey";
import { useToast } from "@/hooks/use-toast-custom";
import { useSession } from "@/lib/auth-client";
import type { Role } from "@/schemas/profile";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

// Rotas comuns acessíveis por todos os roles
const COMMON_ROUTES = ["/profile", "/playzone/events"];


/**
 * Hook para navegação segura com verificação de jornada
 * 
 * Aceita caminhos relativos (ex: "events/123") ou absolutos (ex: "/playzone/events/123")
 * - Caminhos relativos: injeta automaticamente o caminho base da jornada logada
 * - Caminhos absolutos: verifica acesso antes de navegar
 * 
 * Exemplos:
 * - navigateWithJourneyCheck("events/123") → "/playzone/events/123" (se PLAYER) ou "/arena/events/123" (se MANAGER)
 * - navigateWithJourneyCheck("/profile") → "/profile" (rota comum)
 */
export function useSafeNavigation() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const navigateWithJourneyCheck = useCallback(
    async (path: string, options?: { showError?: boolean }) => {
      const { showError = true } = options || {};

      // Se não tem sessão, permitir navegação (será bloqueado pelo layout)
      if (!session?.user?.id) {
        router.push(path);
        return;
      }

      try {
        // Buscar role do usuário primeiro (necessário para caminhos relativos)
        const profileResult = await getProfileData(session.user.id);
        let finalPath = path;
        let role: Role | null = null;

        if (profileResult.success && profileResult.data?.role) {
          role = profileResult.data.role as Role;
        }

        // Se o caminho é relativo (não começa com /), injetar o caminho base da jornada
        if (!path.startsWith("/")) {
          if (role) {
            // Construir caminho completo baseado na jornada
            const journeyBase = JOURNEY_ROUTES[role];
            // Garantir que o caminho relativo não tenha barra inicial
            const cleanPath = path.startsWith("/") ? path.slice(1) : path;
            finalPath = `${journeyBase}/${cleanPath}`;
          } else {
            // Sem role - usar caminho padrão (arena)
            const cleanPath = path.startsWith("/") ? path.slice(1) : path;
            finalPath = `/arena/${cleanPath}`;
          }
        }

        // Verificar se é uma rota comum (acessível por todos)
        const isCommonRoute = COMMON_ROUTES.some(route =>
          finalPath.startsWith(route),
        );

        if (isCommonRoute) {
          // Rota comum - permitir navegação
          router.push(finalPath);
          return;
        }

        // Verificar acesso baseado na jornada
        if (role) {
          const expectedPath = JOURNEY_ROUTES[role];
          const hasAccess = finalPath.startsWith(expectedPath);

          if (hasAccess) {
            // Tem acesso - navegar
            router.push(finalPath);
          } else {
            // Não tem acesso - redirecionar para jornada correta
            const journeyRoute = getJourneyRoute(role);
            
            if (showError) {
              toast.error(
                "Acesso não autorizado",
                "Você não tem permissão para acessar esta página. Redirecionando para sua área."
              );
            }
            
            // Redirecionar para a jornada correta após um pequeno delay para mostrar a mensagem
            setTimeout(() => {
              router.push(journeyRoute);
            }, showError ? 1500 : 0);
          }
        } else {
          // Sem role definido - permitir navegação (onboarding opcional)
          router.push(finalPath);
        }
      } catch (error) {
        console.error("Error checking journey for navigation:", error);
        // Em caso de erro, permitir navegação
        router.push(path);
      }
    },
    [session?.user?.id, router, toast],
  );

  return { navigateWithJourneyCheck };
}

