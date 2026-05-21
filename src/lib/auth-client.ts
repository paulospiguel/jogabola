import { emailOTPClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client"
import { createAuthClient } from "better-auth/react";

function getClientBaseURL(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}

export const authClient = createAuthClient({
  baseURL: getClientBaseURL(),
  plugins: [emailOTPClient(), passkeyClient()],
});

export const { signIn, signOut, signUp, getSession, useSession } = authClient;
export const emailOtp = authClient.emailOtp;
export const passkey = authClient.passkey;
