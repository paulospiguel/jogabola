import { getBaseURL } from "@/utils";
import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signOut, signUp, getSession, useSession } = authClient;
