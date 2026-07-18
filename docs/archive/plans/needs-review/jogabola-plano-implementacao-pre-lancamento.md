# JogaBola — Plano de Implementação Pré-Lançamento

> Objetivo: fechar as lacunas que separam o estado atual de um MVP lançável.
> Base: código real da `release02`. Tudo encaixa no teu padrão (Server Actions, `withAuthAction`, Drizzle, Resend + React Email, next-intl).
> Princípio: **fechar lacunas, não adicionar features.**

## Ordem por ROI

| # | Lacuna | Impacto | Esforço | Prioridade |
|---|---|---|---|---|
| 1 | App passiva (sem lembretes automáticos) | Cumpre a promessa da landing | Médio | **Crítica** |
| 2 | Bug de permissão (qualquer player muta) | Segurança/integridade | Baixo | **Crítica** |
| 3 | Stats mockados visíveis | Confiança no dia 1 | Baixo | Alta |
| 4 | Sem PWA | Commodity "instala no telemóvel" | Baixo | Alta |
| 5 | Superfície larga dilui mensagem | Clareza/ativação | Baixo | Média |
| 6 | `players` vs `teamMembers` duplicado | Dívida técnica | Alto | Pós-lançamento |

---

## 1. Lembretes automáticos (a app deixa de ser passiva)

**Problema:** tens a tabela `notifications`, os templates (`EventReminderEmail`, `payment-reminder-email`), o transporte (Resend em `lib/email.ts`) e funções em `notifications.actions.ts`. Mas o disparo é "compute-on-request" — só nasce quando alguém abre a app. Não há agendador. Resultado: o capitão continua a ter de empurrar à mão.

**Solução:** Vercel Cron a chamar endpoints protegidos que varrem eventos por janela de tempo e disparam o que já tens.

Tens os campos certos no schema `match-sessions`: `startsAt` e `paymentDeadlineHours`. Chega.

### 1.1 — `vercel.json` (criar/editar)
```json
{
  "crons": [
    { "path": "/api/cron/event-reminders", "schedule": "0 * * * *" },
    { "path": "/api/cron/payment-reminders", "schedule": "0 9 * * *" }
  ]
}
```
Lembrete de jogo: de hora a hora (apanha a janela T-24h). Lembrete de pagamento: 1x/dia às 9h.

### 1.2 — Proteger os endpoints
Vercel Cron envia `Authorization: Bearer ${CRON_SECRET}`. Guard em cada rota:
```ts
// src/lib/cron-auth.ts
export function isAuthorizedCron(req: Request): boolean {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}
```
Adiciona `CRON_SECRET` às env vars (Vercel + `.env`).

### 1.3 — Endpoint de lembrete de jogo
`src/app/api/cron/event-reminders/route.ts`
```ts
import { and, between, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { matchSessions, attendance } from "@/db/schema";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { sendEventReminder } from "@/actions/notifications.actions"; // ver 1.5

export async function GET(req: Request) {
  if (!isAuthorizedCron(req)) return new Response("Unauthorized", { status: 401 });

  const now = new Date();
  const in23h = new Date(now.getTime() + 23 * 3600_000);
  const in24h = new Date(now.getTime() + 24 * 3600_000);

  // Jogos que começam na janela T-24h e ainda não tiveram reminder
  const events = await db.query.matchSessions.findMany({
    where: and(
      between(matchSessions.startsAt, in23h, in24h),
      eq(matchSessions.status, "scheduled"),
    ),
  });

  let sent = 0;
  for (const ev of events) {
    sent += await sendEventReminder(ev.id); // idempotente: ver 1.5
  }
  return Response.json({ ok: true, events: events.length, reminders: sent });
}
```

### 1.4 — Endpoint de lembrete de pagamento
`src/app/api/cron/payment-reminders/route.ts` — mesma estrutura, mas varre quem tem pagamento em atraso (cruza `payments` com `paymentDeadlineHours` a partir de `startsAt`). Reaproveita o template `payment-reminder-email` e a função `ensureDeadlineReminders` que já tens.

### 1.5 — Idempotência (não enviar 2x)
O cron corre de hora a hora; o mesmo evento cairia na janela várias vezes. Antes de enviar, grava na `notifications` um registo `type: "event_reminder_24h"` para aquele user+evento e verifica se já existe. Se existe, salta. A tua tabela `notifications` já tem `type` e `metadata` (jsonb) para isto — mete `{ matchSessionId }` no metadata.

```ts
// dentro de sendEventReminder(eventId): para cada confirmado,
// 1. checar notifications onde userId+type+metadata.matchSessionId já existe
// 2. se não, render EventReminderEmail + sendEmail + insert notification
// devolve contagem enviada
```

**Resultado:** véspera do jogo, todos os confirmados recebem lembrete sem o capitão mexer um dedo. É isto que cumpre o *"a app faz o trabalho sujo"* da tua landing.

> Nota: push real (web-push/FCM) é mais trabalho e exige service worker. Para o MVP, **email + notificação in-app (badge) chega.** Push fica para depois do PWA estar de pé.

---

## 2. Bug de permissão (já tens guia separado)

Implementa o `co-capitao-implementacao.md`: cria `canManageTeam` e troca o guard nas **mutações** (`updatePaymentStatus`, `requestPaymentProof`, criar/editar evento, criar notice) de `userCanAccessTeam` → `canManageTeam`. Leituras ficam como estão. Fecha o buraco de o `player` poder mutar e entrega o co-capitão ao mesmo tempo.

---

## 3. Remover stats mockados

**Problema:** `getTeamSquad` devolve `rating: 7.0, goals: 0` hardcoded; `getAthleteProfile` devolve `rating: 8.5, goals: 12, games: 15` fixos. Número falso a utilizador real = perda de confiança imediata.

**Decisão rápida (recomendada para lançar):** esconder, não inventar.
- Tira os campos `goals/assists/rating/games` do retorno, ou
- Mantém o campo mas devolve `null` e na UI mostra "—" ou esconde a secção de stats.

Stats reais (agregados de `attendance` + `fines` + destaques) são Fase 2. No MVP, não mostres o que não medes.

---

## 4. PWA (instala no telemóvel)

Falta manifest e service worker. Em Next 16 App Router:

### 4.1 — `src/app/manifest.ts`
```ts
import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JogaBola",
    short_name: "JogaBola",
    description: "Organiza jogos sem o caos do WhatsApp.",
    start_url: "/",
    display: "standalone",
    background_color: "#050312",
    theme_color: "#1effbf",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
```

### 4.2 — Service worker
Para o MVP basta um SW mínimo para tornar instalável (sem offline complexo). Opção simples: `@serwist/next` (sucessor do next-pwa, compatível com App Router). Configurar offline real só quando precisares.

### 4.3 — Ícones
Gera `icon-192.png` e `icon-512.png` a partir do logo existente (`jogabola-white.svg`). Mete em `/public`.

**Resultado:** "Adicionar ao ecrã principal" funciona, ícone JogaBola no telemóvel, abre em standalone. Commodity fechada por meio dia de trabalho.

---

## 5. Esconder a superfície larga

Sem apagar. Feature flags simples (env ou constante):
```ts
// src/lib/features.ts
export const FEATURES = {
  rankings: false,
  eventChat: false,
  playerChat: false,
  fines: false,
  teamBalancer: false,
} as const;
```
Esconde a navegação e as entradas de UI dessas áreas quando `false`. O código fica, a superfície encolhe. **Regra dos 3 toques:** após registo, o capitão tem de chegar a marcar jogo → convocar → ver lista sem passar por nenhuma feature escondida.

Atenção especial às **multas**: tóxicas para o casual. Off por defeito.

---

## 6. Dívida técnica `players` vs `teamMembers` (pós-lançamento)

**Não fazer antes de lançar.** Mas saber que existe: tens jogador convidado em `players` (sem `userId`) e membro em `teamMembers`, com lógica de reconciliação frágil (os teus próprios comentários admitem). Quando um convidado vira user, a migração de `players` → `teamMembers` tem de ser limpa e o mesmo jogador em 2 equipas precisa de modelo claro. Resolve quando tiveres tração, antes de escalar. Marca como dívida conhecida, não a deixes crescer em silêncio.

---

## Sequência sugerida (alinha com as 6 semanas do plano de lançamento)

**Semana 0 (antes do dogfooding):**
1. Bug de permissão + co-capitão (#2)
2. Stats mockados fora (#3)
3. Feature flags / esconder superfície (#5)

**Semana 0–1:**
4. Lembretes automáticos (#1) — a peça que cumpre a promessa
5. PWA (#4)

**Durante o dogfooding:** observar se os lembretes chegam na hora certa e se a app deixou de exigir empurrão manual. Essa é a prova de que a lacuna foi fechada.

**Pós-tração:** dívida técnica `players`/`teamMembers` (#6), depois push real, depois Stripe subscription (semana 5 do plano de lançamento).

---

## Definição de "pronto para lançar"

- [ ] Capitão marca jogo → convoca → confirmados recebem lembrete automático na véspera, sem ação manual.
- [ ] Pagamento em atraso gera lembrete automático.
- [ ] Só owner/co-capitão mutam; player não.
- [ ] Nenhum número falso visível.
- [ ] App instalável no telemóvel.
- [ ] Primeiros 3 toques = só o essencial.
- [ ] Testado nos teus próprios grupos durante 1–2 semanas.
