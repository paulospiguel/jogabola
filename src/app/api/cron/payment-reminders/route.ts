import { isAuthorizedCron } from "@/lib/cron-auth";
import { sendPaymentRemindersCron } from "@/lib/cron-reminders";

/**
 * Cron: dispara lembretes de pagamento em atraso.
 * Schedule: 0 9 * * * (todos os dias às 9h)
 * Varre pagamentos pendentes cujo prazo já passou.
 */
export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { sent, skipped } = await sendPaymentRemindersCron();

  console.info("[cron:payment-reminders] done", { sent, skipped });

  return Response.json({
    ok: true,
    sent,
    skipped,
  });
}
