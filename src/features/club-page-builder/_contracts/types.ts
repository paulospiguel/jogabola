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
  badge?: string;
}

export const DEFAULT_CLUB_COLORS: ClubColors = {
  primary: "#24ffe6",
  secondary: "#0d59f2",
  text: "#ffffff",
};

export const DEFAULT_CONFIG: ClubPageConfig = {
  template: "modern",
  clubName: "",
  clubSlogan: "",
  clubDescription: "",
  logoUrl: null,
  colors: DEFAULT_CLUB_COLORS,
  founded: "",
  city: "",
  category: "",
  features: {
    convocations: true,
    calendar: true,
    news: true,
    gallery: true,
    stats: true,
  },
  isVisible: true,
};

// Template options use i18n keys for label/description — see templateSelector locale keys.
// The label here is the design token name (not translated), descriptions are resolved
// via t("templateSelector.templates.<id>.description") at the call site.
export const TEMPLATE_OPTION_IDS: ClubTemplate[] = ["classic", "modern", "ultra"];

export const TEMPLATE_LABELS: Record<ClubTemplate, string> = {
  classic: "Classic",
  modern: "Modern",
  ultra: "Ultra",
};
