export const APP = {
  APP_NAME: "Jogabola",
  COMPANY: {
    NAME: "company.name",
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
    PLAYER_AVATAR: "/images/default-avatar.png",
    TEAM_LOGO: "/images/default-team-logo.png",
  },
  SOCIAL: {
    INSTAGRAM: "https://instagram.com/jogabolafun",
    DISCORD: "https://discord.com/jogabolafun",
    TWITTER: "https://x.com/jogabolafun",
  },
  ROUTES: {
    HOME: "/",
  },
};

export const CONFIG = {
  DEFAULT_LOCALE: "pt",
  SUPPORTED_LOCALES: ["pt", "en", "es", "fr"],
  COOKIE_PREFIX: "JOGABOLA",
};

export const RELEASE = {
  IS_BETA: process.env.NEXT_PUBLIC_IS_BETA === "true",
  IS_LAUNCHED: process.env.APP_LAUNCHED === "true",
};

export const LAYOUT = {
  META_TITLE: APP.COMPANY.NAME,
  META_DESCRIPTION: APP.COMPANY.SLOGAN,
};
