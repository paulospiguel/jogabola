import { createAuthClient } from "better-auth/react";

/**
 * Obtém a baseURL para o cliente React
 * IMPORTANTE: Deve usar NEXT_PUBLIC_APP_URL obrigatoriamente no cliente
 * para garantir consistência com a configuração do servidor
 */
function getClientBaseURL(): string {
  // No cliente, sempre usar NEXT_PUBLIC_APP_URL se disponível
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

  // No servidor (SSR), usar a mesma lógica
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
});

export const { signIn, signOut, signUp, getSession, useSession } = authClient;
