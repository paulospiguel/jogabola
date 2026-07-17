declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Database
      DATABASE_URL: string;

      // Better Auth
      BETTER_AUTH_SECRET?: string;
      TRUSTED_ORIGINS?: string; // URLs separadas por vírgula

      // Google OAuth (opcional)
      GOOGLE_CLIENT_ID?: string;
      GOOGLE_CLIENT_SECRET?: string;

      // Email (Resend)
      RESEND_AUTH_KEY?: string;
      RESEND_EMAIL_FROM?: string;
      RESEND_EMAIL_TO?: string;
      RESEND_API_KEY?: string;

      // Supabase (se usado)
      NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
      NEXT_PUBLIC_SUPABASE_URL?: string;

      // App URLs
      NEXT_PUBLIC_APP_URL?: string;
      NEXT_PUBLIC_URL?: string; // Variante alternativa (sem APP)
      NEXTAUTH_URL?: string; // Fallback para compatibilidade
      VERCEL_URL?: string;
    }
  }
}
export type {};
