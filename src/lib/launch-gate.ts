import { isTesterEmail } from "@/lib/notion";

/** Whether the app is open to everyone (read per call so tests can stub it). */
export function isAppLaunched(): boolean {
  return process.env.APP_LAUNCHED === "true";
}

/**
 * Same rule the `(protected)` layout applies: before launch only testers
 * (Notion waitlist `Tester`/`Developer`) can use the app.
 */
export async function isPreLaunchEligible(email: string): Promise<boolean> {
  if (isAppLaunched()) return true;
  return isTesterEmail(email);
}
