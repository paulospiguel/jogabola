/**
 * Guard para endpoints de cron job da Vercel.
 * Verifica o header Authorization: Bearer ${CRON_SECRET}.
 */
export function isAuthorizedCron(req: Request): boolean {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.warn(
      "[cron] CRON_SECRET not configured — cron endpoints unprotected",
    );
    return false;
  }
  return auth === `Bearer ${secret}`;
}
