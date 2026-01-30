"use server";

import { getBaseURL } from "@/lib/utils";

export async function forgotPassword(email: string) {
  try {
    // Better Auth tem suporte nativo para forgot password via API
    // O endpoint é /api/auth/forgot-password e aceita { email }
    const baseUrl = getBaseURL();
    
    if (!baseUrl) {
      throw new Error("Base URL não configurada");
    }

    const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Erro ao enviar email de recuperação. Verifica se o email está correto.",
      );
    }

    // Sempre retornar sucesso para não expor se o email existe ou não
    return {
      success: true,
      message: "Se o email existir, receberás um link de recuperação",
    };
  } catch (error: unknown) {
    console.error("Forgot password error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao enviar email de recuperação";
    return {
      success: false,
      error: message,
    };
  }
}

export async function resetPassword(token: string, password: string) {
  try {
    const baseUrl = getBaseURL();
    
    if (!baseUrl) {
      throw new Error("Base URL não configurada");
    }

    const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message ||
          "Erro ao redefinir palavra-passe. O token pode ter expirado.",
      );
    }

    return {
      success: true,
      message: "Palavra-passe redefinida com sucesso",
    };
  } catch (error: unknown) {
    console.error("Reset password error:", error);
    const message =
      error instanceof Error ? error.message : "Erro ao redefinir palavra-passe";
    return {
      success: false,
      error: message,
    };
  }
}
