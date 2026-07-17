import type { LucideIcon } from "lucide-react";
import { Goal, Shield, Star, Target } from "lucide-react";

export interface PositionConfig {
  value: string;
  label: string;
  icon: LucideIcon;
}

// Mapeamento de posições com ícones e traduções
export const POSITIONS: Record<string, PositionConfig> = {
  goalkeeper: {
    value: "goalkeeper",
    label: "Guarda-Redes",
    icon: Shield,
  },
  defender: {
    value: "defender",
    label: "Defesa",
    icon: Shield,
  },
  midfielder: {
    value: "midfielder",
    label: "Médio",
    icon: Target,
  },
  forward: {
    value: "forward",
    label: "Avançado",
    icon: Goal,
  },
  versatile: {
    value: "versatile",
    label: "Polivalente",
    icon: Star,
  },
};

// Função helper para obter a configuração da posição
export function getPositionConfig(
  positionValue?: string,
): PositionConfig | null {
  if (!positionValue) return null;
  return POSITIONS[positionValue] || null;
}

// Função helper para obter o label traduzido
export function getPositionLabel(positionValue?: string): string {
  const config = getPositionConfig(positionValue);
  return config?.label || positionValue || "Jogador";
}

// Função helper para obter o ícone
export function getPositionIcon(positionValue?: string): LucideIcon | null {
  const config = getPositionConfig(positionValue);
  return config?.icon || null;
}
