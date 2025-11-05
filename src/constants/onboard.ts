import coachIcon from "@/assets/images/coach.png";
import fanFriend from "@/assets/images/fan.png";
import organizerIcon from "@/assets/images/manager.png";
import playerIcon from "@/assets/images/player.png";
import { RoleValues } from "@/schemas";
import type { Goal, JourneyOption, WaitlistApp } from "@/types/onboard";
import {
  Calendar,
  Clock,
  Heart,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  Users,
} from "lucide-react";

export const JOURNEY_OPTIONS: JourneyOption[] = [
  {
    id: RoleValues.PLAYER,
    title: "Jogador",
    tags: ["Encontra equipas", "Melhora habilidades", "Conquista glória"],
    icon: playerIcon,
    color: "from-emerald-500 to-teal-600",
    features: [
      "Encontrar equipas",
      "Estatísticas pessoais",
      "Torneios",
      "Treinos",
    ],
  },
  {
    id: RoleValues.MANAGER,
    title: "Gestor/Treinador",
    tags: ["Gere equipa", "Organiza treinos", "Lidera para vitória"],
    icon: coachIcon,
    color: "from-purple-500 to-indigo-600",
    features: [
      "Gestão de equipa",
      "Planeamento de treinos",
      "Análise de performance",
      "Recrutamento",
    ],
  },
  {
    id: RoleValues.FAN,
    title: "Adepto",
    tags: ["Apoia equipa", "Conecta-te", "Comunidade"],
    icon: fanFriend,
    color: "from-orange-500 to-red-600",
    features: [
      "Apoio à equipa",
      "Seguimento de jogos",
      "Interação com a comunidade",
      "Acompanhamento de desempenho",
    ],
  },
  {
    id: RoleValues.ORGANIZER,
    title: "Federação/Organizador",
    tags: ["Organiza eventos", "Apoia equipas", "Conecta comunidade"],
    icon: organizerIcon,
    color: "from-blue-500 to-cyan-600",
    features: [
      "Organização de eventos",
      "Apoio a equipas",
      "Comunidade",
      "Networking",
    ],
  },
];

export const AVAILABLE_APPS: WaitlistApp[] = [
  {
    id: "jogabola-mobile",
    name: "JogaBola Mobile",
    description: "App principal para jogadores e gestores",
    status: "coming-soon",
    estimatedLaunch: "Q2 2024",
  },
  {
    id: "jogabola-timer",
    name: "JogaBola Timer",
    description: "Cronómetro avançado para treinos e jogos",
    status: "beta",
    estimatedLaunch: "Disponível em Beta",
  },
  {
    id: "jogabola-academy",
    name: "JogaBola Academy",
    description: "Plataforma de treino e desenvolvimento",
    status: "coming-soon",
    estimatedLaunch: "Q3 2024",
  },
  {
    id: "jogabola-manager",
    name: "JogaBola Manager",
    description: "Ferramenta avançada para gestores",
    status: "coming-soon",
    estimatedLaunch: "Q4 2024",
  },
];

export const GOALS: Goal[] = [
  {
    id: "improve-skills",
    label: "Melhorar habilidades",
    icon: Target,
  },
  {
    id: "find-team",
    label: "Encontrar uma equipa",
    icon: Users,
  },
  {
    id: "organize-games",
    label: "Organizar jogos",
    icon: Calendar,
  },
  {
    id: "track-stats",
    label: "Acompanhar estatísticas",
    icon: Trophy,
  },
  {
    id: "make-friends",
    label: "Fazer novos amigos",
    icon: Heart,
  },
  {
    id: "compete",
    label: "Competir em torneios",
    icon: Star,
  },
  {
    id: "coach-others",
    label: "Treinar outros",
    icon: User,
  },
  {
    id: "stay-fit",
    label: "Manter-me em forma",
    icon: Clock,
  },
  {
    id: "have-fun",
    label: "Divertir-me",
    icon: Sparkles,
  },
];
