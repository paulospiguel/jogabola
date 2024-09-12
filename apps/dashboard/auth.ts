import NextAuth from "next-auth";
import authConfig from "./auth.config";

import { getRolesByUser } from "@/actions/team";
import { findUserbyEmail } from "@/actions/user"
import { prisma as dbClient } from "@/lib/db";
import { isTwoFactorAutenticationEnabled } from "@/services/auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { UserRole } from "@repo/db";

export const {
	handlers: { GET, POST },
	auth,
	signIn,
	signOut,
	unstable_update: update,
} = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(dbClient),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, email, account, profile }) {
      if (
        account &&
        (account.provider === "google" || account.provider === "facebook")
      ) {
        return true;
      }
      if (user.email) {
        const registeredUser = await findUserbyEmail(user?.email);
        if (!registeredUser?.emailVerified) return false;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger && trigger === "update" && session) {
        token.isTwoFactorEnabled = session.user.isTwoFactorEnabled;
        return token;
      }
      if (user) {
        // User is available during sign-in
        if (user.id) {
          const isTwoFactorEnabled = await isTwoFactorAutenticationEnabled(
            user?.id || "",
          );

          const roles = await getRolesByUser(user?.id || "");
          token.role = roles;
          token.isTwoFactorEnabled = isTwoFactorEnabled;
        } else {
          token.role = [UserRole.DEFAULT];
        }
      }
      return token;
    },
    session({ session, token }) {
      // `session.user.role` is now a valid property, and will be type-checked
      // in places like `useSession().data.user` or `auth().user`
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
        session.user.isCompleted = token.role.length > 0;
      }
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role,
        },
      };
    },
  },
});
