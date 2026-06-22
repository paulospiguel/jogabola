import { and, between, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { matchSessions } from "@/db/schema";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { sendEventReminderCron } from "@/lib/cron-reminders";

/**
 * Cron: dispara lembretes de jogo ~24h antes do evento.
 * Schedule: 0 9 * * * (1×/dia — limite do plano Hobby na Vercel)
 * Janela [now+24h, now+48h]: com execução diária às 09:00 UTC cobre
 * eventos do dia seguinte (idempotente via notificação event_reminder_24h).
 */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 3_600_000);
  const in48h = new Date(now.getTime() + 48 * 3_600_000);

  const events = await db.query.matchSessions.findMany({
    where: and(
      between(matchSessions.startsAt, in24h, in48h),
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
