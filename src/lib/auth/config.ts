import { getBaseURL } from "@/lib/utils";

function getAuthEnv() {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET ou NEXTAUTH_SECRET deve estar definido nas variáveis de ambiente",
    );
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const appleClientId = process.env.APPLE_CLIENT_ID;
  const appleClientSecret = process.env.APPLE_CLIENT_SECRET;
  const appleTeamId = process.env.APPLE_TEAM_ID;
  const appleKeyId = process.env.APPLE_KEY_ID;
  const applePrivateKey = process.env.APPLE_PRIVATE_KEY;

  const hasGoogleCredentials = Boolean(googleClientId && googleClientSecret);
  const hasAppleCredentials = Boolean(
    appleClientId &&
      appleClientSecret &&
      appleTeamId &&
      appleKeyId &&
      applePrivateKey,
  );

  const baseURL = getBaseURL();

  if (!baseURL) {
    throw new Error(
      "Base URL não configurada. Defina NEXT_PUBLIC_APP_URL ou NEXTAUTH_URL nas variáveis de ambiente",
    );
  }

  return {
    secret,
    baseURL,
    google: {
      enabled: hasGoogleCredentials,
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    },
    apple: {
      enabled: hasAppleCredentials,
      clientId: appleClientId,
      clientSecret: appleClientSecret,
      teamId: appleTeamId,
      keyId: appleKeyId,
      privateKey: applePrivateKey,
    },
  };
}

function getTrustedOrigins(): string[] {
  const origins: string[] = ["http://localhost:3000"];
  const baseURL = getBaseURL();

  if (baseURL && baseURL !== "http://localhost:3000") {
    if (!origins.includes(baseURL)) {
      origins.push(baseURL);
    }
  }

  if (
    process.env.NEXT_PUBLIC_APP_URL &&
    process.env.NEXT_PUBLIC_APP_URL !== baseURL
  ) {
    if (!origins.includes(process.env.NEXT_PUBLIC_APP_URL)) {
      origins.push(process.env.NEXT_PUBLIC_APP_URL);
    }
  }

  if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL !== baseURL) {
    if (!origins.includes(process.env.NEXTAUTH_URL)) {
      origins.push(process.env.NEXTAUTH_URL);
    }
  }

  if (process.env.TRUSTED_ORIGINS) {
    const envOrigins = process.env.TRUSTED_ORIGINS.split(",")
      .map(o => o.trim())
      .filter(o => o.length > 0);

    envOrigins.forEach(origin => {
      if (!origins.includes(origin)) {
        origins.push(origin);
      }
    });
  }

  return origins;
}

export const authConfig = {
  getEnv: getAuthEnv,
  getTrustedOrigins,
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  email: {
    enabled: Boolean(process.env.RESEND_API_KEY),
    from: process.env.RESEND_EMAIL_FROM || "noreply@jogabola.com",
  },
} as const;
