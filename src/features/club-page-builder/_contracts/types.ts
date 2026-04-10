// ─── Club Page Builder — Contracts ───────────────────────────────────────────

export type ClubTemplate = "classic" | "modern" | "ultra";

export interface ClubColors {
  primary: string;   // hex — main club color
  secondary: string; // hex — accent / secondary color
  text: string;      // hex — text color override
}

export interface ClubPageConfig {
  template: ClubTemplate;
  clubName: string;
  clubSlogan: string;
  clubDescription: string;
  logoUrl: string | null;
  colors: ClubColors;
  founded?: string;
  city?: string;
  category?: string; // e.g. "Futebol 11", "Futsal"
  features: {
    convocations: boolean;
    calendar: boolean;
    news: boolean;
    gallery: boolean;
    stats: boolean;
  };
  isVisible: boolean;
}

export interface TemplateOption {
  id: ClubTemplate;
  label: string;
  description: string;
  badge?: string; // e.g. "Popular", "Novo"
}

export const DEFAULT_CLUB_COLORS: ClubColors = {
  primary: "#24ffe6",
  secondary: "#0d59f2",
  text: "#ffffff",
};

export const DEFAULT_CONFIG: ClubPageConfig = {
  template: "modern",
  clubName: "Meu Clube",
  clubSlogan: "Juntos somos mais fortes",
  clubDescription: "Uma comunidade apaixonada pelo futebol.",
  logoUrl: null,
  colors: DEFAULT_CLUB_COLORS,
  founded: "2024",
  city: "Lisboa",
  category: "Futebol 11",
  features: {
    convocations: true,
    calendar: true,
    news: true,
    gallery: true,
    stats: true,
  },
  isVisible: true,
};

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: "classic",
    label: "Classic",
    description: "Visual clássico e elegante. Ideal para clubes com tradição e história.",
    badge: undefined,
  },
  {
    id: "modern",
    label: "Modern",
    description: "Design moderno e dinâmico com elementos visuais arrojados.",
    badge: "Popular",
  },
  {
    id: "ultra",
    label: "Ultra",
    description: "Experiência imersiva com efeitos neon e atmosfera de jogo.",
    badge: "Novo",
  },
];
