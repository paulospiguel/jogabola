import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { eq } from "drizzle-orm";
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
        const { sendAuthOtp } = await import("@/lib/email");
        const result = await sendAuthOtp(email, otp);
        if (!result.success) {
          throw new Error("AUTH_OTP_EMAIL_SEND_FAILED");
        }
      },
    }),
  ],
  session: {
    expiresIn: authConfig.session.expiresIn,
    updateAge: authConfig.session.updateAge,
    additionalFields: {
      teamId: {
        type: "number",
      },
    },
  },
  secret: env.secret,
  databaseHooks: {
    session: {
      create: {
        before: async (session): Promise<{ data: any }> => {
          const userTeams = await db
            .select({ id: schema.teams.id })
            .from(schema.teams)
            .where(eq(schema.teams.ownerId, session.userId))
            .limit(1);

          if (userTeams.length > 0) {
            return {
              data: {
                ...session,
                teamId: userTeams[0].id,
              },
            };
          }
          return { data: session };
        },
      },
    },
    user: {
      create: {
        before: async (user): Promise<{ data: any }> => ({
          data: {
            ...user,
            image: normalizeImage(user.image),
          },
        }),
        after: async user => {
          const { onUserCreated } = await import("@/lib/user-lifecycle");
          await onUserCreated(user);
        },
      },
      update: {
        before: async (user): Promise<{ data: any }> => ({
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
      role: {
        type: "string",
      },
      onboardingCompleted: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },
});
