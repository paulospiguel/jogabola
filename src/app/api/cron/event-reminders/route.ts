import { and, between, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { matchSessions } from "@/db/schema";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { sendEventReminderCron } from "@/lib/cron-reminders";

/**
 * Cron: dispara lembretes de jogo para eventos T-24h.
 * Schedule: 0 * * * * (cada hora)
 * Só processa eventos na janela [now+23h, now+25h] para apanhar a marca T-24h.
 */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const in23h = new Date(now.getTime() + 23 * 3_600_000);
  const in25h = new Date(now.getTime() + 25 * 3_600_000);

  const events = await db.query.matchSessions.findMany({
    where: and(
      between(matchSessions.startsAt, in23h, in25h),
      eq(matchSessions.status, "scheduled"),
    ),
  });

  let totalSent = 0;
  let totalSkipped = 0;

  for (const ev of events) {
    const { sent, skipped } = await sendEventReminderCron(ev.id);
    totalSent += sent;
    totalSkipped += skipped;
  }

  console.info("[cron:event-reminders] done", {
    events: events.length,
    sent: totalSent,
    skipped: totalSkipped,
  });

  return Response.json({
    ok: true,
    events: events.length,
    sent: totalSent,
    skipped: totalSkipped,
  });
}
