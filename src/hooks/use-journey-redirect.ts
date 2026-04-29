"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

export function useJourneyRedirect() {
  const router = useRouter();
  const { data: session } = useSession();

  return {
    redirectToJourney() {
      router.push(session?.user?.id ? "/arena" : "/auth");
    },
  };
}
