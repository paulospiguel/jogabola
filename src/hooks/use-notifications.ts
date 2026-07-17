"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";

export function useUnreadNotificationsCount() {
  const { data: session } = useSession();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: async () => {
      const { getUnreadNotificationsCount } = await import(
        "@/actions/notifications.actions"
      );
      const response = await getUnreadNotificationsCount();
      return response.success ? response.count : 0;
    },
    enabled: !!session?.user,
    staleTime: 1000 * 30, // Cache de 30 segundos
    refetchInterval: 1000 * 30, // Atualizar a cada 30 segundos em segundo plano
  });

  return {
    unreadCount: data ?? 0,
    isLoading,
    refetch,
  };
}
