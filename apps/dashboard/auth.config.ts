import type { NextAuthConfig } from "next-auth";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import Discord from "next-auth/providers/discord";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";

import { findUserbyEmail } from "@/actions/user";
import { CredentialsSchema } from "@/schemas";
import { UserNotFound } from "./src/lib/auth";

import bcryptjs from "bcryptjs";


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
    Discord,
    Twitter,
    Apple
  ],
} satisfies NextAuthConfig;
