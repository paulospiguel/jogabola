declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      NEXT_PUBLIC_RESEND_AUTH_KEY: string;
      NEXT_PUBLIC_RESEND_EMAIL_FROM: string;
      NEXT_PUBLIC_RESEND_EMAIL_TO: string;
      NEXT_PUBLIC_RESEND_API_KEY: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      NEXT_PUBLIC_SUPABASE_URL: string;
    }
  }
}
export type {};
