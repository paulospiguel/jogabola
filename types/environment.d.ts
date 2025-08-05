declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      RESEND_AUTH_KEY: string;
      RESEND_EMAIL_FROM: string;
      RESEND_EMAIL_TO: string;
      RESEND_API_KEY: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      NEXT_PUBLIC_SUPABASE_URL: string;
    }
  }
}
export type {};
