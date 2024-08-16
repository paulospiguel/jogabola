import bcryptjs from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import { UserNotFound } from "./src/lib/auth";
import { CredentialsSchema } from "./src/schemas/auth";
import { findUserbyEmail } from "./src/services";

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validdCredentials = CredentialsSchema.safeParse(credentials);
        if (validdCredentials.success) {
          const { email, password } = validdCredentials.data;
          const user = await findUserbyEmail(email);
          if (!user || !user.password) {
            throw new UserNotFound();
          }
          const validPassword = await bcryptjs.compare(password, user.password);
          if (validPassword) return user;
        }
        //TODO: Would it be better to throw new InvalidCredential?
        return null;
      },
    }),
    Google,
    Facebook,
  ],
} satisfies NextAuthConfig;
