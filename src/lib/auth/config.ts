import { getBaseURL } from "@/lib/utils";

function getAuthEnv() {
  const secret = process.env.BETTER_AUTH_SECRET;

  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET");
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
  const origins: string[] = ["http://localhost:3000", "http://127.0.0.1:3000"];
  const baseURL = getBaseURL();
  const port = baseURL ? new URL(baseURL).port : "3000";
  const portSuffix = port ? `:${port}` : "";

  // Add parsed baseURL base variants
  if (baseURL) {
    try {
      const url = new URL(baseURL);
      const baseOrigin = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}`;
      if (!origins.includes(baseOrigin)) {
        origins.push(baseOrigin);
      }
      
      const localIpVariant = `${url.protocol}//127.0.0.1${url.port ? `:${url.port}` : ""}`;
      if (!origins.includes(localIpVariant)) {
        origins.push(localIpVariant);
      }
    } catch {}
  }

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

  // Programmatically trust local network IPs (e.g. 192.168.x.x) during development
  if (process.env.NODE_ENV !== "production") {
    try {
      const os = require("os");
      const interfaces = os.networkInterfaces();
      for (const name of Object.keys(interfaces)) {
        const ifaceList = interfaces[name];
        if (ifaceList) {
          for (const iface of ifaceList) {
            if (iface.family === "IPv4" && !iface.internal) {
              const localIpOrigin = `http://${iface.address}${portSuffix}`;
              if (!origins.includes(localIpOrigin)) {
                origins.push(localIpOrigin);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to dynamically add local IPs to trusted origins", e);
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
