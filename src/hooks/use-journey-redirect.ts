"use client";

import { getProfileData } from "@/actions/profile";
import { getJourneyRoute } from "@/components/journey-router";
import { useSession } from "@/lib/auth-client";
import type { Role } from "@/schemas/profile";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Hook para redirecionamento inteligente baseado no status do usuário
 * - Se tem sessão ativa e tem role definido → vai para dashboard da jornada
 * - Se tem sessão mas não tem role → vai para arena padrão (onboarding é opcional)
 * - Se não tem sessão → vai para auth
 */
export function useJourneyRedirect() {
  const router = useRouter();
  const { data: session } = useSession();

  const redirectToJourney = useCallback(async () => {
    // Se não tem sessão, vai para auth
    if (!session?.user?.id) {
      router.push("/auth");
      return;
    }

    try {
      // Verificar se tem profile e role definido
      const profileResult = await getProfileData(session.user.id);

      if (profileResult.success && profileResult.data?.role) {
        // Tem role definido - redirecionar para dashboard da jornada
        const role = profileResult.data.role as Role;
        const journeyRoute = getJourneyRoute(role);
        router.push(journeyRoute);
      } else {
        // Não tem role ou não completou onboarding - ir para arena padrão
        // Onboarding é opcional, então permite acesso
        router.push("/arena");
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      // Em caso de erro, ir para arena padrão
      router.push("/arena");
    }
  }, [session?.user?.id, router]);

  return { redirectToJourney };
}

