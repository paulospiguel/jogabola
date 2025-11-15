import type { Role } from "@/schemas/profile";
import {
  Briefcase,
  Calendar,
  DollarSign,
  Heart,
  MapPin,
  Medal,
  Shield,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  Users,
} from "lucide-react";

export interface OnboardingQuestion {
  id: string;
  label: string;
  type: "text" | "select" | "radio" | "checkbox" | "multiselect";
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  icon?: any;
  description?: string;
}

export interface RoleQuestions {
  personalInfo: OnboardingQuestion[];
  goals: {
    id: string;
    label: string;
    icon: any;
  }[];
  customFields: OnboardingQuestion[];
}

// Perguntas específicas para JOGADOR
const playerQuestions: RoleQuestions = {
  personalInfo: [
    {
      id: "position",
      label: "Posição Preferida",
      type: "select",
      placeholder: "Seleciona a tua posição",
      required: true,
      options: [
        { value: "goalkeeper", label: "Guarda-Redes" },
        { value: "defender", label: "Defesa" },
        { value: "midfielder", label: "Médio" },
        { value: "forward", label: "Avançado" },
        { value: "versatile", label: "Polivalente" },
      ],
      icon: Shield, // Ícone geral do campo, os ícones específicos estão em constants/positions.ts
    },
    {
      id: "preferredFoot",
      label: "Pé Preferido",
      type: "radio",
      required: false,
      options: [
        { value: "right", label: "Direito" },
        { value: "left", label: "Esquerdo" },
        { value: "both", label: "Ambos" },
      ],
    },
    {
      id: "playingStyle",
      label: "Estilo de Jogo",
      type: "select",
      placeholder: "Seleciona o teu estilo",
      required: false,
      options: [
        { value: "offensive", label: "Ofensivo" },
        { value: "defensive", label: "Defensivo" },
        { value: "balanced", label: "Equilibrado" },
        { value: "technical", label: "Técnico" },
        { value: "physical", label: "Físico" },
      ],
      icon: Sparkles,
    },
  ],
  goals: [
    { id: "find-team", label: "Encontrar uma equipa", icon: Users },
    {
      id: "improve-skills",
      label: "Melhorar habilidades técnicas",
      icon: Target,
    },
    {
      id: "compete-tournaments",
      label: "Participar em torneios",
      icon: Trophy,
    },
    { id: "stay-active", label: "Manter-me ativo e saudável", icon: Heart },
    { id: "make-friends", label: "Conhecer novos jogadores", icon: User },
    { id: "go-professional", label: "Aspirar ao profissionalismo", icon: Star },
  ],
  customFields: [
    {
      id: "teamStatus",
      label: "Situação Atual",
      type: "radio",
      required: false,
      options: [
        { value: "looking", label: "À procura de equipa" },
        { value: "has-team", label: "Já tenho equipa" },
        { value: "flexible", label: "Aberto a novas oportunidades" },
      ],
    },
    {
      id: "availability",
      label: "Disponibilidade",
      type: "radio",
      required: false,
      options: [
        { value: "weekends", label: "Fins de semana" },
        { value: "evenings", label: "Noites durante a semana" },
        { value: "flexible", label: "Horário flexível" },
        { value: "specific", label: "Horários específicos" },
      ],
    },
  ],
};

// Perguntas específicas para GESTOR/TREINADOR
const managerQuestions: RoleQuestions = {
  personalInfo: [
    {
      id: "managementRole",
      label: "Função Principal",
      type: "select",
      placeholder: "Seleciona a tua função",
      required: true,
      options: [
        { value: "head-coach", label: "Treinador Principal" },
        { value: "assistant-coach", label: "Treinador Adjunto" },
        { value: "team-manager", label: "Gestor de Equipa" },
        { value: "technical-director", label: "Diretor Técnico" },
        { value: "sports-director", label: "Diretor Desportivo" },
      ],
      icon: Briefcase,
    },
    {
      id: "certifications",
      label: "Certificações",
      type: "multiselect",
      required: false,
      options: [
        { value: "uefa-pro", label: "UEFA Pro" },
        { value: "uefa-a", label: "UEFA A" },
        { value: "uefa-b", label: "UEFA B" },
        { value: "uefa-c", label: "UEFA C" },
        { value: "grassroots", label: "Grassroots" },
        { value: "none", label: "Sem certificação formal" },
      ],
      icon: Medal,
    },
    {
      id: "teamStatus",
      label: "Situação Atual",
      type: "radio",
      required: true,
      options: [
        { value: "looking", label: "À procura de equipa para gerir" },
        { value: "has-team", label: "Já tenho uma equipa" },
        { value: "building", label: "A formar nova equipa" },
      ],
    },
  ],
  goals: [
    { id: "build-team", label: "Construir uma equipa forte", icon: Users },
    { id: "win-competitions", label: "Ganhar competições", icon: Trophy },
    { id: "develop-players", label: "Desenvolver jogadores", icon: Target },
    {
      id: "improve-tactics",
      label: "Melhorar táticas e estratégias",
      icon: Sparkles,
    },
    {
      id: "professional-growth",
      label: "Crescimento profissional",
      icon: Star,
    },
    { id: "community-impact", label: "Impacto na comunidade", icon: Heart },
  ],
  customFields: [
    {
      id: "coachingExperience",
      label: "Anos de Experiência como Gestor/Treinador",
      type: "select",
      required: false,
      options: [
        { value: "0-1", label: "Menos de 1 ano" },
        { value: "1-3", label: "1-3 anos" },
        { value: "3-5", label: "3-5 anos" },
        { value: "5-10", label: "5-10 anos" },
        { value: "10+", label: "Mais de 10 anos" },
      ],
    },
    {
      id: "teamSize",
      label: "Tamanho de Equipa Preferido",
      type: "radio",
      required: false,
      options: [
        { value: "youth", label: "Equipas Jovens (Sub-15, Sub-17)" },
        { value: "amateur", label: "Equipas Amadoras Adultas" },
        { value: "semi-pro", label: "Semi-Profissional" },
        { value: "flexible", label: "Flexível" },
      ],
    },
  ],
};

// Perguntas específicas para ADEPTO/OBSERVADOR
const fanQuestions: RoleQuestions = {
  personalInfo: [
    {
      id: "supportType",
      label: "Tipo de Envolvimento",
      type: "select",
      placeholder: "Como preferes apoiar?",
      required: true,
      options: [
        { value: "enthusiast", label: "Entusiasta / Fã" },
        { value: "scout", label: "Observador / Scout" },
        { value: "analyst", label: "Analista" },
        { value: "photographer", label: "Fotógrafo / Media" },
        { value: "supporter", label: "Apoiante de Clube" },
      ],
      icon: Heart,
    },
    {
      id: "favoriteTeam",
      label: "Tens uma Equipa Favorita?",
      type: "text",
      placeholder: "Nome da equipa (opcional)",
      required: false,
    },
    {
      id: "followingInterest",
      label: "Interesse Principal",
      type: "radio",
      required: true,
      options: [
        { value: "local", label: "Futebol local / amador" },
        { value: "professional", label: "Futebol profissional" },
        { value: "both", label: "Ambos" },
      ],
    },
  ],
  goals: [
    { id: "follow-games", label: "Seguir jogos e competições", icon: Calendar },
    { id: "support-team", label: "Apoiar a minha equipa", icon: Heart },
    { id: "scout-talent", label: "Descobrir novos talentos", icon: Star },
    { id: "analyze-performance", label: "Analisar desempenhos", icon: Target },
    { id: "community", label: "Conectar com a comunidade", icon: Users },
    { id: "media-coverage", label: "Cobertura mediática", icon: Sparkles },
  ],
  customFields: [
    {
      id: "attendanceFrequency",
      label: "Frequência de Jogos",
      type: "radio",
      required: false,
      options: [
        { value: "weekly", label: "Semanalmente" },
        { value: "monthly", label: "Mensalmente" },
        { value: "occasionally", label: "Ocasionalmente" },
        { value: "rarely", label: "Raramente (principalmente online)" },
      ],
    },
  ],
};

// Perguntas específicas para FEDERAÇÃO/ORGANIZADOR
const organizerQuestions: RoleQuestions = {
  personalInfo: [
    {
      id: "organizationType",
      label: "Tipo de Organização",
      type: "select",
      placeholder: "Seleciona o tipo",
      required: true,
      options: [
        { value: "federation", label: "Federação / Associação" },
        { value: "tournament", label: "Organizador de Torneios" },
        { value: "facility", label: "Gestor de Instalações" },
        { value: "league", label: "Liga / Campeonato" },
        { value: "club", label: "Clube Desportivo" },
        { value: "event-company", label: "Empresa de Eventos" },
      ],
      icon: Briefcase,
    },
    {
      id: "organizationName",
      label: "Nome da Organização",
      type: "text",
      placeholder: "Nome da tua organização",
      required: true,
    },
    {
      id: "organizationSize",
      label: "Dimensão da Organização",
      type: "radio",
      required: false,
      options: [
        { value: "small", label: "Pequena (1-10 pessoas)" },
        { value: "medium", label: "Média (11-50 pessoas)" },
        { value: "large", label: "Grande (50+ pessoas)" },
      ],
    },
  ],
  goals: [
    {
      id: "organize-events",
      label: "Organizar eventos e torneios",
      icon: Calendar,
    },
    {
      id: "manage-facilities",
      label: "Gerir instalações desportivas",
      icon: MapPin,
    },
    { id: "grow-community", label: "Aumentar a comunidade", icon: Users },
    { id: "revenue-generation", label: "Gerar receitas", icon: DollarSign },
    { id: "partnership", label: "Estabelecer parcerias", icon: Sparkles },
    { id: "promote-sport", label: "Promover o desporto", icon: Trophy },
  ],
  customFields: [
    {
      id: "eventsPerYear",
      label: "Eventos Organizados por Ano",
      type: "select",
      required: false,
      options: [
        { value: "0", label: "Nenhum ainda" },
        { value: "1-5", label: "1-5 eventos" },
        { value: "6-12", label: "6-12 eventos" },
        { value: "12-24", label: "12-24 eventos" },
        { value: "24+", label: "Mais de 24 eventos" },
      ],
    },
    {
      id: "geographicScope",
      label: "Âmbito Geográfico",
      type: "radio",
      required: false,
      options: [
        { value: "local", label: "Local / Municipal" },
        { value: "regional", label: "Regional / Distrital" },
        { value: "national", label: "Nacional" },
        { value: "international", label: "Internacional" },
      ],
    },
  ],
};

export const ROLE_QUESTIONS: Record<Role, RoleQuestions> = {
  PLAYER: playerQuestions,
  MANAGER: managerQuestions,
  FAN: fanQuestions,
  ORGANIZER: organizerQuestions,
};

// Helper function to get questions by role
export function getQuestionsByRole(
  role: Role | undefined,
): RoleQuestions | null {
  if (!role) return null;
  return ROLE_QUESTIONS[role] || null;
}
