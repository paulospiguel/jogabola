/**
 * Constantes da aplicação
 * Este arquivo centraliza informações importantes da aplicação para facilitar a manutenção
 */

// Informações da empresa (independentes de idioma)
export const COMPANY = {
  NAME: "JogaBola", // Nome que não muda com o idioma
  COOKIE_PREFIX: "JOGABOLA",
  SOCIAL: {
    INSTAGRAM: "https://instagram.com/jogabolafun",
    DISCORD: "https://discord.com/jogabolafun",
    TWITTER: "https://x.com/jogabolafun",
  },
  // @deprecated - Use o sistema de tradução com TRANSLATION_KEYS.COMPANY.LEGAL_NAME
  LEGAL_NAME: "JogaBola é Diversão Ltda.",
  // @deprecated - Use o sistema de tradução com TRANSLATION_KEYS.COMPANY.SLOGAN
  SLOGAN: "O melhor lugar para encontrar sua malta e jogar uma pelada.",
};

// Configurações de i18n
export const CONFIG = {
  DEFAULT_LOCALE: "pt",
  SUPPORTED_LOCALES: ["pt", "en", "es", "fr"],
};

// @deprecated - Use o sistema de tradução com TRANSLATION_KEYS.META
export const LAYOUT = {
  META_TITLE: COMPANY.NAME,
  META_DESCRIPTION: COMPANY.SLOGAN,
};

// Valores padrão para conteúdo
export const DEFAULTS = {
  PLAYER_AVATAR: "/images/default-avatar.png",
  TEAM_LOGO: "/images/default-team-logo.png",
};

// Chaves de tradução (para usar com i18n)
export const TRANSLATION_KEYS = {
  COMPANY: {
    SLOGAN: "company.slogan",
    LEGAL_NAME: "company.legalName",
    DESCRIPTION: "company.description",
  },
  META: {
    TITLE: "meta.title",
    DESCRIPTION: "meta.description",
  },
  COMMON: {
    COPYRIGHT: "common.copyright",
    RIGHTS: "common.rights",
  },
};
