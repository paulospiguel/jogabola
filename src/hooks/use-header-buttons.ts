"use client";

import { getProfileData } from "@/actions/profile";
import { useSession } from "@/lib/auth-client";
import type { Role } from "@/schemas/profile";
import { useEffect, useState } from "react";

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

/**
 * Hook para obter os botões corretos do header baseado no role do usuário
 * - Se não tem sessão: mostra "Entrar" e "Iniciar Jornada"
 * - Se tem sessão (NUNCA mostra "Entrar"):
 *   - PLAYER -> "Play Zone"
 *   - MANAGER -> "Arena"
 *   - FAN -> "Fan Zone"
 *   - ORGANIZER -> "Palco"
 *   - FEDERATION/FIELD_OWNER -> "Universo"
 */
export function useHeaderButtons(): UseHeaderButtonsReturn {
  const { data: session } = useSession();
  const [role, setRole] = useState<Role | null>(null);
  const [specialRole, setSpecialRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const profileResult = await getProfileData(session.user.id);
        if (profileResult.success && profileResult.data) {
          // Obter role
          if (profileResult.data.role) {
            setRole(profileResult.data.role as Role);
          }

          // Verificar se é FEDERATION ou FIELD_OWNER através de customFields
          if (
            profileResult.data.role === "ORGANIZER" &&
            profileResult.data.customFields
          ) {
            const customFields = profileResult.data.customFields;
            if (
              customFields.organizationType === "federation" ||
              customFields.organizationType === "facility" ||
              customFields.roleType === "FEDERATION" ||
              customFields.roleType === "FIELD_OWNER" ||
              customFields.federation === true ||
              customFields.fieldOwner === true
            ) {
              setSpecialRole("UNIVERSO");
            } else {
              setSpecialRole(null);
            }
          } else {
            setSpecialRole(null);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [session?.user?.id]);

  // Se não tem sessão, retorna botões padrão
  if (!session?.user?.id) {
    return {
      buttons: [
        {
          label: "header.signIn",
          href: "/auth",
          variant: "secondary",
        },
        {
          label: "header.launchJourney",
          variant: "primary",
        },
      ],
      isLoading: false,
    };
  }

  // Se tem sessão mas ainda está carregando o role
  if (isLoading) {
    return {
      buttons: [],
      isLoading: true,
    };
  }

  // Mapear role para botões
  const getButtonsForRole = (userRole: Role | null): HeaderButton[] => {
    if (!userRole) {
      // Sem role definido, vai para arena padrão
      return [
        {
          label: "header.arena",
          href: "/arena",
          variant: "primary",
        },
      ];
    }

    switch (userRole) {
      case "PLAYER":
        return [
          {
            label: "header.playZone",
            href: "/playzone",
            variant: "primary",
          },
        ];
      case "MANAGER":
        return [
          {
            label: "header.arena",
            href: "/arena",
            variant: "primary",
          },
        ];
      case "FAN":
        return [
          {
            label: "header.fanZone",
            href: "/fan-zone",
            variant: "primary",
          },
        ];
      case "ORGANIZER":
        return [
          {
            label: "header.palco",
            href: "/organizer",
            variant: "primary",
          },
        ];
      default:
        // Fallback para arena
        return [
          {
            label: "header.arena",
            href: "/arena",
            variant: "primary",
          },
        ];
    }
  };

  // Se for FEDERATION ou FIELD_OWNER, mostrar botão Universo
  if (specialRole === "UNIVERSO") {
    return {
      buttons: [
        {
          label: "header.universo",
          href: "/organizer", // Usar a rota do organizer por enquanto
          variant: "primary",
        },
      ],
      isLoading: false,
    };
  }

  const buttons = getButtonsForRole(role);

  return {
    buttons,
    isLoading: false,
  };
}
