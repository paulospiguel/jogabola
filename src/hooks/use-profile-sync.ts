import { useEffect, useRef, useTransition } from "react";
import {
  createProfileFromOnboarding,
  linkOnboardingToUser,
  saveOnboarding,
} from "@/actions/profile";
import { useToast } from "@/hooks/use-toast-custom";
import { useSession } from "@/lib/auth-client";
import { useProfileStore } from "@/stores/profile";

export function useProfileSync(
  userId?: string,
  saveAction?: (userId: string, data: unknown) => Promise<unknown>,
) {
  const { data: session } = useSession();
  const { reset } = useProfileStore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const hasLinkedRef = useRef(false); // Evitar múltiplas execuções
  const lastUserIdRef = useRef<string | undefined>(undefined);
  const lastEmailRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!userId || !session?.user?.email) {
      return;
    }

    // Se já processamos este userId/email, não processar novamente
    if (
      hasLinkedRef.current &&
      lastUserIdRef.current === userId &&
      lastEmailRef.current === session.user.email
    ) {
      return;
    }

    // Evitar múltiplas execuções simultâneas
    if (hasLinkedRef.current) {
      return;
    }

    lastUserIdRef.current = userId;
    lastEmailRef.current = session.user.email;

    startTransition(async () => {
      try {
        // Verificar dados do store PRIMEIRO
        const storeState = useProfileStore.getState();

        // Se tem dados completos no store, salvar primeiro
        if (
          storeState.completed &&
          storeState.data.role &&
          storeState.data.email &&
          storeState.data.name
        ) {
          // Salvar onboarding vinculado ao user
          const onboardingResult = await saveOnboarding(
            storeState.data,
            userId,
          );

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
              return; // Sucesso, não precisa tentar vincular pendente
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

        // Se não tem dados no store, tentar vincular onboarding pendente
        const linkResult = await linkOnboardingToUser(
          userId,
          session.user.email,
        );

        if (linkResult.success) {
          hasLinkedRef.current = true;
          toast.success(
            "Onboarding recuperado!",
            "Os teus dados do onboarding foram aplicados ao teu perfil.",
          );
          // Reset store após vinculação bem-sucedida
          reset();
          return;
        }
      } catch (error) {
        toast.error("Erro", "Ocorreu um erro ao sincronizar os teus dados.");
      }
    });
  }, [userId, session?.user?.email, reset, toast]); // Removidas dependências que causam loop

  // Obter valores do store apenas quando necessário, sem criar dependência
  const storeState = useProfileStore.getState();
  return {
    hasProfileData: storeState.completed && !!storeState.data.role,
    isPending,
  };
}
