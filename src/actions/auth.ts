"use server";

// Função helper para obter o baseURL de forma consistente
function getBaseURL(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Em produção na Vercel, usar VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Fallback para desenvolvimento
  return "http://localhost:3000";
}

export async function forgotPassword(email: string) {
  try {
    // Better Auth tem suporte nativo para forgot password via API
    // O endpoint é /api/auth/forgot-password e aceita { email }
    const baseUrl = getBaseURL();

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
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      error: error?.message || "Erro ao enviar email de recuperação",
    };
  }
}

export async function resetPassword(token: string, password: string) {
  try {
    const baseUrl = getBaseURL();

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
  } catch (error: any) {
    console.error("Reset password error:", error);
    return {
      success: false,
      error: error?.message || "Erro ao redefinir palavra-passe",
    };
  }
}
