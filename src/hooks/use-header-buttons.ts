"use client";

import { useSession } from "@/lib/auth-client";

interface HeaderButton {
  label: string;
  href?: string;
  onClick?: () => void;
  variant: "primary" | "secondary";
}

interface UseHeaderButtonsReturn {
  buttons: HeaderButton[];
  isLoading: boolean;
}

export function useHeaderButtons(): UseHeaderButtonsReturn {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return { buttons: [], isLoading: true };
  }

  const isAuthenticated = !!session?.user?.id;

  if (isAuthenticated) {
    return {
      buttons: [
        {
          label: "header.arena",
          href: "/arena",
          variant: "primary",
        },
      ],
      isLoading: false,
    };
  }

  return {
    buttons: [
      {
        label: "header.launchJourney",
        href: "/auth",
        variant: "primary",
      },
    ],
    isLoading: false,
  };
}
