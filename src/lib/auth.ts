import * as schema from "@/drizzle/schema";
import { getBaseURL } from "@/utils";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";

const baseURL = getBaseURL();

// Configurar trustedOrigins dinamicamente
const trustedOrigins: string[] = ["http://localhost:3000"];

// Adicionar baseURL se não for localhost
if (baseURL && baseURL !== "http://localhost:3000") {
  if (!trustedOrigins.includes(baseURL)) {
    trustedOrigins.push(baseURL);
  }
}

// Adicionar URLs de TRUSTED_ORIGINS se configuradas
if (process.env.TRUSTED_ORIGINS) {
  const envOrigins = process.env.TRUSTED_ORIGINS.split(",")
    .map(o => o.trim())
    .filter(o => o.length > 0);

  envOrigins.forEach(origin => {
    if (!trustedOrigins.includes(origin)) {
      trustedOrigins.push(origin);
    }
  });
}

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
});
