import {
  Shield,
  Target,
  Star,
  Goal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PositionConfig {
  value: string;
  label: string;
  icon: LucideIcon;
  emoji?: string;
}

// Mapeamento de posições com ícones e traduções
export const POSITIONS: Record<string, PositionConfig> = {
  goalkeeper: {
    value: "goalkeeper",
    label: "Guarda-Redes",
    icon: Shield,
    emoji: "🥅",
  },
  defender: {
    value: "defender",
    label: "Defesa",
    icon: Shield,
    emoji: "🛡️",
  },
  midfielder: {
    value: "midfielder",
    label: "Médio",
    icon: Target,
    emoji: "⚙️",
  },
  forward: {
    value: "forward",
    label: "Avançado",
    icon: Goal,
    emoji: "⚡",
  },
  versatile: {
    value: "versatile",
    label: "Polivalente",
    icon: Star,
    emoji: "⭐",
  },
};

// Função helper para obter a configuração da posição
export function getPositionConfig(positionValue?: string): PositionConfig | null {
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

// Função helper para obter o emoji
export function getPositionEmoji(positionValue?: string): string {
  const config = getPositionConfig(positionValue);
  return config?.emoji || "⚽";
}

