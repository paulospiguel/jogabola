import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

function getClientBaseURL(): string {
  if (typeof window !== "undefined") {
    const publicUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!publicUrl) {
      console.warn(
        "NEXT_PUBLIC_APP_URL não está definido. Usando window.location.origin como fallback.",
      );
      return window.location.origin;
    }

    return publicUrl;
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

const authClient = createAuthClient({
  baseURL: getClientBaseURL(),
  plugins: [emailOTPClient()],
});

export const { signIn, signOut, signUp, getSession, useSession } = authClient;
export const emailOtp = authClient.emailOtp;
