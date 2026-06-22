import { passkeyClient } from "@better-auth/passkey/client";
import { emailOTPClient } from "better-auth/client/plugins";
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

export type PasskeyErrorCode =
  | "unsupported"
  | "insecureContext"
  | "rpIdMismatch"
  | "cancelled"
  | "alreadyRegistered"
  | "failed";

export type PasskeyResult =
  | { ok: true }
  | { ok: false; code: PasskeyErrorCode; detail?: string };

/**
 * Mapeia um erro WebAuthn/better-auth para um código estável e traduzível.
 * Os nomes de erro do WebAuthn (DOMException.name) são o sinal mais fiável.
 */
function normalizePasskeyError(error: unknown): PasskeyErrorCode {
  const name = (error as { name?: string } | null)?.name ?? "";
  const message =
    (error instanceof Error ? error.message : String(error ?? "")) || "";
  const haystack = `${name} ${message}`.toLowerCase();

  if (name === "NotAllowedError" || haystack.includes("not allowed")) {
    return "cancelled";
  }
  if (name === "InvalidStateError" || haystack.includes("already")) {
    return "alreadyRegistered";
  }
  if (
    name === "SecurityError" ||
    haystack.includes("registrable") ||
    haystack.includes("relying party") ||
    haystack.includes("rp id") ||
    haystack.includes("rpid")
  ) {
    return "rpIdMismatch";
  }
  return "failed";
}

/**
 * Regista uma passkey de forma robusta.
 *
 * Faz pré-verificações ANTES de chamar o WebAuthn para falhar com uma
 * mensagem clara em vez do genérico "não foi possível associar":
 *  - o navegador suporta passkeys (PublicKeyCredential)
 *  - estamos num contexto seguro (HTTPS ou localhost) — WebAuthn é bloqueado
 *    em http:// fora de localhost (ex.: aceder via IP da rede no telemóvel)
 */
export async function registerPasskey(): Promise<PasskeyResult> {
  if (typeof window === "undefined") {
    return { ok: false, code: "unsupported" };
  }

  if (
    typeof window.PublicKeyCredential === "undefined" ||
    !window.navigator?.credentials
  ) {
    return { ok: false, code: "unsupported" };
  }

  // WebAuthn exige um contexto seguro. `localhost` é considerado seguro mesmo
  // em http; qualquer outro host em http (ex.: 192.168.x.x) não é.
  if (!window.isSecureContext) {
    return {
      ok: false,
      code: "insecureContext",
      detail: window.location.origin,
    };
  }

  try {
    const result = await passkey.addPasskey();
    if (result?.error) {
      return {
        ok: false,
        code: normalizePasskeyError(result.error),
        detail: result.error.message,
      };
    }
    return { ok: true };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[passkey] addPasskey failed:", error);
    }
    return {
      ok: false,
      code: normalizePasskeyError(error),
      detail: error instanceof Error ? error.message : undefined,
    };
  }
}
