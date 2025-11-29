// Traduções para valores de campos do onboarding

// Traduções para teamStatus (Situação Atual)
export const teamStatusLabels: Record<string, string> = {
  looking: "À procura de equipa",
  "has-team": "Já tenho equipa",
  flexible: "Aberto a novas oportunidades",
  building: "A formar nova equipa",
};

// Traduções para availability (Disponibilidade)
export const availabilityLabels: Record<string, string> = {
  weekends: "Fins de semana",
  evenings: "Noites durante a semana",
  flexible: "Horário flexível",
  specific: "Horários específicos",
};

// Traduções para preferredFoot (Pé Preferido)
export const preferredFootLabels: Record<string, string> = {
  right: "Direito",
  left: "Esquerdo",
  both: "Ambos",
};

// Traduções para playingStyle (Estilo de Jogo)
export const playingStyleLabels: Record<string, string> = {
  offensive: "Ofensivo",
  defensive: "Defensivo",
  balanced: "Equilibrado",
  technical: "Técnico",
  physical: "Físico",
};

// Traduções para managementRole (Função Principal)
export const managementRoleLabels: Record<string, string> = {
  "head-coach": "Treinador Principal",
  "assistant-coach": "Treinador Adjunto",
  "team-manager": "Gestor de Equipa",
  "technical-director": "Diretor Técnico",
  "sports-director": "Diretor Desportivo",
};

// Função helper genérica para traduzir valores de campos
export function translateFieldValue(
  fieldId: string,
  value: string | string[] | undefined | null 
): string {
  if (!value) return "";

  // Se for array, traduzir cada item e juntar
  if (Array.isArray(value)) {
    return value
      .map(v => translateFieldValue(fieldId, v))
      .filter(Boolean)
      .join(", ");
  }

  // Traduzir baseado no fieldId
  switch (fieldId) {
    case "teamStatus":
      return teamStatusLabels[value] || value;
    case "availability":
      return availabilityLabels[value] || value;
    case "preferredFoot":
      return preferredFootLabels[value] || value;
    case "playingStyle":
      return playingStyleLabels[value] || value;
    case "managementRole":
      return managementRoleLabels[value] || value;
    default:
      return String(value);
  }
}

