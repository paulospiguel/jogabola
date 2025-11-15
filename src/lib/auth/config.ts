/**
 * Configuração centralizada do Better Auth
 * Centraliza todas as configurações de autenticação em um único lugar
 */

import { getBaseURL } from "@/utils";

/**
 * Valida e retorna as variáveis de ambiente necessárias para o Better Auth
 */
function getAuthEnv() {
  const secret = process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  
  if (!secret) {
    throw new Error(
      "BETTER_AUTH_SECRET ou NEXTAUTH_SECRET deve estar definido nas variáveis de ambiente"
    );
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  const hasGoogleCredentials = Boolean(googleClientId && googleClientSecret);

  const baseURL = getBaseURL();
  
  // Validar que baseURL está configurado corretamente
  if (!baseURL) {
    throw new Error(
      "Base URL não configurada. Defina NEXT_PUBLIC_APP_URL ou NEXTAUTH_URL nas variáveis de ambiente"
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
  };
}

/**
 * Configura os trusted origins de forma segura
 * Suporta múltiplos ambientes e configuração via variáveis de ambiente
 * IMPORTANTE: Deve incluir todas as URLs que podem fazer requisições ao Better Auth
 */
function getTrustedOrigins(): string[] {
  const origins: string[] = ["http://localhost:3000"];
  const baseURL = getBaseURL();

  // Adicionar baseURL se não for localhost
  if (baseURL && baseURL !== "http://localhost:3000") {
    if (!origins.includes(baseURL)) {
      origins.push(baseURL);
    }
  }

  // Adicionar NEXT_PUBLIC_APP_URL se diferente do baseURL
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL !== baseURL) {
    if (!origins.includes(process.env.NEXT_PUBLIC_APP_URL)) {
      origins.push(process.env.NEXT_PUBLIC_APP_URL);
    }
  }

  // Adicionar NEXTAUTH_URL se diferente do baseURL
  if (process.env.NEXTAUTH_URL && process.env.NEXTAUTH_URL !== baseURL) {
    if (!origins.includes(process.env.NEXTAUTH_URL)) {
      origins.push(process.env.NEXTAUTH_URL);
    }
  }

  // Adicionar URLs de TRUSTED_ORIGINS se configuradas
  if (process.env.TRUSTED_ORIGINS) {
    const envOrigins = process.env.TRUSTED_ORIGINS.split(",")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    envOrigins.forEach((origin) => {
      if (!origins.includes(origin)) {
        origins.push(origin);
      }
    });
  }

  return origins;
}

/**
 * Configuração do Better Auth
 * Exporta configurações que podem ser reutilizadas em outros arquivos
 */
export const authConfig = {
  getEnv: getAuthEnv,
  getTrustedOrigins,
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 dias em segundos
    updateAge: 60 * 60 * 24, // 1 dia em segundos
  },
  email: {
    enabled: Boolean(process.env.RESEND_API_KEY),
    from: process.env.RESEND_EMAIL_FROM || "noreply@jogabola.com",
  },
} as const;

