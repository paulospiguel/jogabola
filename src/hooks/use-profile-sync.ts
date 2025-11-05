import {
  createProfileFromOnboarding,
  linkOnboardingToUser,
  saveOnboarding,
} from "@/actions/profile";
import { useToast } from "@/hooks/use-toast-custom";
import { useSession } from "@/lib/auth-client";
import { useProfileStore } from "@/stores/profile";
import { useEffect, useRef, useTransition } from "react";

export function useProfileSync(
  userId?: string,
  saveAction?: (userId: string, data: any) => Promise<any>,
) {
  const { data: session } = useSession();
  const { data, completed, reset } = useProfileStore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const hasLinkedRef = useRef(false); // Evitar múltiplas execuções

  useEffect(() => {
    if (!userId || !session?.user?.email) {
      return;
    }

    // Evitar múltiplas execuções
    if (hasLinkedRef.current) {
      return;
    }

    startTransition(async () => {
      try {
        // Primeiro, tentar vincular onboarding pendente se existir
        console.log("Tentando vincular onboarding para:", session.user.email);
        const linkResult = await linkOnboardingToUser(
          userId,
          session.user.email,
        );

        if (linkResult.success) {
          console.log("Onboarding vinculado com sucesso!");
          hasLinkedRef.current = true;
          toast.success(
            "Onboarding recuperado!",
            "Os teus dados do onboarding foram aplicados ao teu perfil.",
          );
          // Reset store após vinculação bem-sucedida
          reset();
          return;
        } else {
          console.log(
            "Nenhum onboarding pendente encontrado:",
            "error" in linkResult ? linkResult.error : "Nenhum erro específico",
          );
        }

        // Se não há onboarding pendente, mas há dados completos no store, salvar
        if (completed && data.role && data.email && data.name) {
          console.log("Salvando dados do store...");
          // Salvar onboarding vinculado ao user
          const onboardingResult = await saveOnboarding(data, userId);

          if (onboardingResult.success) {
            // Criar profile se onboarding está completo
            const profileResult = await createProfileFromOnboarding(userId);

            if (profileResult.success) {
              hasLinkedRef.current = true;
              toast.success(
                "Perfil Configurado!",
                "As tuas preferências foram guardadas com sucesso.",
              );
              // Reset store after successful save
              reset();
            } else {
              toast.error(
                "Erro ao Criar Perfil",
                profileResult.error ||
                  "Onboarding guardado, mas erro ao criar perfil.",
              );
            }
          } else {
            toast.error(
              "Erro ao Guardar",
              onboardingResult.error ||
                "Não foi possível guardar as tuas preferências.",
            );
          }
        }
      } catch (error) {
        console.error("Error syncing profile:", error);
        toast.error("Erro", "Ocorreu um erro ao sincronizar os teus dados.");
      }
    });
  }, [userId, session?.user?.email, completed, data, reset, toast]);

  return { hasProfileData: completed && !!data.role, isPending };
}
