"use client";

import { useQuery } from "@tanstack/react-query";

export function useMyPaymentForEvent(eventId: number) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["myPayment", eventId],
    queryFn: async () => {
      const { getMyPaymentForEvent } = await import("@/actions/payments.actions");
      const res = await getMyPaymentForEvent(eventId);
      if (!res.success) {
        throw new Error(res.error);
      }
      return res.data;
    },
  });

  return { payment: data ?? null, isLoading, error, refetch };
}
