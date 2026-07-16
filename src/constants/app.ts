import packageJson from "../../package.json";

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
    INSTAGRAM: "https://instagram.com/jogabola.app",
    TWITTER: "https://x.com/jogabola_app",
    TIKTOK: "https://tiktok.com/jogabola.app",
    FACEBOOK: "https://facebook.com/jogabola.app",
    YOUTUBE: "https://youtube.com/jogabola.app",
  },
  CONTACT: {
    SUPPORT_EMAIL: "suporte@jogabola.pt",
    INSTAGRAM_HANDLE: "@jogabola.app",
    X_HANDLE: "@jogabola_app",
  },
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || packageJson.version,
  ROUTES: {
    HOME: "/",
  },
};

export const CONFIG = {
  DEFAULT_LOCALE: "pt",
  SUPPORTED_LOCALES: ["pt", "en", "es", "fr"],
  COOKIE_PREFIX: "JOGABOLA",
  MAIN_DOMAIN: process.env.NEXT_PUBLIC_MAIN_DOMAIN as string,
};

export const RELEASE = {
  IS_BETA: process.env.NEXT_PUBLIC_IS_BETA === "true",
  IS_LAUNCHED: process.env.APP_LAUNCHED === "true",
};

export const LAYOUT = {
  META_TITLE: APP.COMPANY.NAME,
  META_DESCRIPTION: APP.COMPANY.SLOGAN,
};
