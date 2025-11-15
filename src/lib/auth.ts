import * as schema from "@/drizzle/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { authConfig } from "./auth/config";

// Obter configurações validadas
const env = authConfig.getEnv();
const trustedOrigins = authConfig.getTrustedOrigins();

// Configurar provedores sociais apenas se as credenciais estiverem disponíveis
const socialProviders = env.google.enabled
  ? {
      google: {
        clientId: env.google.clientId!,
        clientSecret: env.google.clientSecret!,
      },
    }
  : undefined;

export const auth = betterAuth({
  baseURL: env.baseURL,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Pode ser habilitado quando email estiver configurado
  },
  ...(socialProviders && { socialProviders }),
  session: {
    expiresIn: authConfig.session.expiresIn,
    updateAge: authConfig.session.updateAge,
  },
  secret: env.secret,
});
