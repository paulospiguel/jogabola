import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { authConfig } from "./auth/config";

const env = authConfig.getEnv();
const trustedOrigins = authConfig.getTrustedOrigins();

function normalizeImage(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

const socialProviders = {
  ...(env.google.enabled &&
    env.google.clientId &&
    env.google.clientSecret && {
      google: {
        clientId: env.google.clientId,
        clientSecret: env.google.clientSecret,
        scopes: ["openid", "email", "profile"],
        overrideUserInfoOnSignIn: true,
      },
    }),
  ...(env.apple.enabled &&
    env.apple.clientId &&
    env.apple.clientSecret &&
    env.apple.teamId &&
    env.apple.keyId &&
    env.apple.privateKey && {
      apple: {
        clientId: env.apple.clientId,
        clientSecret: env.apple.clientSecret,
        teamId: env.apple.teamId,
        keyId: env.apple.keyId,
        privateKey: env.apple.privateKey,
      },
    }),
};

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
    requireEmailVerification: false,
  },
  ...(socialProviders && { socialProviders }),
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 300,
      allowedAttempts: 5,
      resendStrategy: "reuse",
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "sign-in") return;

        if (
          !process.env.RESEND_API_KEY &&
          process.env.NODE_ENV !== "production"
        ) {
          console.info(`[auth:email-otp] ${email} -> ${otp}`);
          return;
        }

        const { sendEmail } = await import("@/lib/email");
        await sendEmail({
          to: email,
          subject: "Código de acesso JogaBola",
          html: `
            <div style="font-family:Arial,sans-serif;background:#0b0f14;color:#f5f7fa;padding:32px">
              <div style="max-width:420px;margin:auto;background:#111827;border:1px solid #263244;border-radius:18px;padding:28px">
                <h1 style="font-size:20px;margin:0 0 12px">Entrar no JogaBola</h1>
                <p style="color:#a7b0be;margin:0 0 20px">Usa este código para validar o teu login.</p>
                <div style="font-size:32px;letter-spacing:8px;font-weight:800;color:#7cff4f;background:#151c26;border-radius:12px;padding:16px;text-align:center">${otp}</div>
                <p style="color:#6b7280;font-size:12px;margin:20px 0 0">Este código expira em 5 minutos.</p>
              </div>
            </div>
          `,
        });
      },
    }),
  ],
  session: {
    expiresIn: authConfig.session.expiresIn,
    updateAge: authConfig.session.updateAge,
  },
  secret: env.secret,
  databaseHooks: {
    user: {
      create: {
        before: async user => ({
          data: {
            ...user,
            image: normalizeImage(user.image),
          },
        }),
        after: async user => {
          try {
            const { sendEmail } = await import("@/lib/email");
            const { WelcomeEmail } = await import(
              "@/components/emails/welcome-email"
            );
            const React = await import("react");
            await sendEmail({
              to: user.email,
              subject: "Bem-vindo à Jogabola Arena!",
              react: React.createElement(WelcomeEmail, {
                username: user.name,
              }),
            });
          } catch (error) {
            console.error("Failed to send welcome email:", error);
          }
        },
      },
      update: {
        before: async user => ({
          data: {
            ...user,
            ...(Object.hasOwn(user, "image")
              ? { image: normalizeImage(user.image) }
              : {}),
          },
        }),
      },
    },
  },
  user: {
    additionalFields: {
      locale: {
        type: "string",
        defaultValue: "pt",
      },
      notificationsEnabled: {
        type: "boolean",
        defaultValue: true,
      },
    },
  },
});
