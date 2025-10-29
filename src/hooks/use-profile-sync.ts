import { useToast } from "@/hooks/use-toast-custom";
import { useProfileStore } from "@/stores/profile";
import { useEffect, useTransition } from "react";

export function useProfileSync(
  userId?: string,
  saveAction?: (userId: string, data: any) => Promise<any>
) {
  const { data, completed, reset } = useProfileStore();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!userId || !completed || !data.role || !saveAction) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await saveAction(userId, data);

        if (result.success) {
          toast.success(
            "Perfil Configurado!",
            "As tuas preferências foram guardadas com sucesso."
          );
          // Reset store after successful save
          reset();
        } else {
          toast.error(
            "Erro ao Guardar",
            result.error || "Não foi possível guardar as tuas preferências."
          );
        }
      } catch (error) {
        console.error("Error syncing profile:", error);
        toast.error(
          "Erro",
          "Ocorreu um erro ao sincronizar os teus dados."
        );
      }
    });
  }, [userId, completed, data, reset, toast, saveAction]);

  return { hasProfileData: completed && !!data.role, isPending };
}
