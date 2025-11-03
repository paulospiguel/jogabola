"use client";

import { getProfileData } from "@/actions/profile";
import { getJourneyRoute } from "@/components/journey-router";
import { useSession } from "@/lib/auth-client";
import type { Role } from "@/schemas/profile";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Hook para redirecionamento inteligente baseado no status do usuário
 * - Se tem sessão ativa e completou onboarding → vai para dashboard da jornada
 * - Se não tem sessão ou não completou → vai para onboarding
 */
export function useJourneyRedirect() {
  const router = useRouter();
  const { data: session } = useSession();

  const redirectToJourney = useCallback(async () => {
    // Se não tem sessão, vai para onboarding
    if (!session?.user?.id) {
      router.push("/onboard");
      return;
    }

    try {
      // Verificar se completou onboarding
      const profileResult = await getProfileData(session.user.id);

      if (profileResult.success && profileResult.data?.completed) {
        // Já completou onboarding - redirecionar para dashboard da jornada
        const role = profileResult.data.role as Role;
        if (role) {
          const journeyRoute = getJourneyRoute(role);
          router.push(journeyRoute);
        } else {
          // Role não definido, ir para arena padrão
          router.push("/arena");
        }
      } else {
        // Não completou onboarding - ir para onboard
        router.push("/onboard");
      }
    } catch (error) {
      console.error("Error checking profile:", error);
      // Em caso de erro, ir para onboarding
      router.push("/onboard");
    }
  }, [session?.user?.id, router]);

  return { redirectToJourney };
}

