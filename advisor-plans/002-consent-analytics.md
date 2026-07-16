# Plano 002: Aplicar consentimento a analytics cliente e servidor

> **Drift check:** `git diff --stat 2c1eb85..HEAD -- src/providers src/components/cookie-consent.tsx src/lib/analytics-server.ts src/actions`  
> Se os símbolos citados mudaram, comparar antes de editar; divergência material é STOP.

## Estado

- **Prioridade:** P0
- **Esforço:** M
- **Risco:** Médio
- **Depende de:** 001
- **Categoria:** segurança/privacidade
- **Planeado em:** `2c1eb85`, 2026-07-16

## Porque importa

O banner não impede recolha. Statsig cliente, AutoCapture, Session Replay e eventos das Server Actions funcionam sem consentimento; a waitlist usa ainda email/nome no tracking. Isto é bloqueador RGPD.

## Estado atual

- Cliente: `providers/index.tsx:24-25`, `providers/analytics.tsx:16-23`.
- Consentimento: `components/cookie-consent.tsx:74-129` guarda preferências sem controlar providers.
- Servidor: `lib/analytics-server.ts:49-61` não consulta cookies/consentimento.
- Callers após o plano 001: `teams.actions.ts`, `match-sessions.actions.ts`, `guest-rsvp.actions.ts`, `attendance.actions.ts`, `payments/payment-proofs.actions.ts`, `payments/payment-lifecycle.actions.ts`, `waitlist.actions.ts`.
- PII: `auth/page.tsx:162-165` e `waitlist.actions.ts:22`.

## Âmbito

**In:** `src/lib/consent.ts` (novo), `src/lib/analytics-server.ts`, `src/lib/__tests__/{consent,analytics-server}.test.ts`, `src/providers/{index,analytics}.tsx`, `src/components/cookie-consent.tsx`, todos os callers pós-plano-001 acima e `auth/page.tsx`.  
**Out:** fornecedor Statsig, textos jurídicos e identificadores de utilizador já definidos pelo Better Auth.

## Passos

1. Criar `src/lib/consent.ts` com tipo/versionamento e parsers seguros para cookie/localStorage; ausente/inválido = todas as categorias `false`.  
   **Teste:** `src/lib/__tests__/consent.test.ts`, casos absent, declined, custom analytics false/true, malformed.
2. Criar contexto cliente de consentimento; montar Statsig/AutoCapture/Replay somente com `analytics === true`. Alterações do banner atualizam o contexto sem reload.  
   **Verificar:** teste unitário do parser + smoke de rede antes/depois de aceitar.
3. Criar helper server-only assíncrono `hasAnalyticsConsent()` que usa `await cookies()` de `next/headers` e o parser central sobre `cookie-consent-settings`. O cookie é deliberadamente não assinado: só permite ao próprio browser aceitar/recusar telemetria e nunca é usado para autorização. Alterar `trackServerEvent` para `async Promise<void>`; ele deve verificar consentimento antes de chamar `getStatsigClient`.  
   **Teste:** em `analytics-server.test.ts`, mockar `next/headers` com `vi.mock`, devolver cookie ausente/false/true e provar respetivamente zero, zero e um log; confirmar que Statsig nem inicializa sem consentimento.
4. Migrar todos os callers listados de `trackServerEvent(...)` para `await trackServerEvent(...)`, mantendo-os dentro da Server Action request-bound. A waitlist deve remover o evento server-side e emitir evento client-side após sucesso, apenas com consentimento e sem email/nome; não usar hash de email.
5. Remover `email: collectedEmail` do evento de login.

## Verificação final

```bash
pnpm exec vitest run src/lib/__tests__/consent.test.ts src/lib/__tests__/analytics-server.test.ts
npx biome check src/lib/consent.ts src/lib/analytics-server.ts src/providers/index.tsx src/providers/analytics.tsx src/components/cookie-consent.tsx src/actions/teams.actions.ts src/actions/match-sessions.actions.ts src/actions/guest-rsvp.actions.ts src/actions/attendance.actions.ts src/actions/payments/payment-proofs.actions.ts src/actions/payments/payment-lifecycle.actions.ts src/actions/waitlist.actions.ts 'src/app/(mobile)/auth/page.tsx'
pnpm ts-check
pnpm test
pnpm build
git grep 'email: collectedEmail' -- src
git grep 'trackServerEvent(email' -- src
```

Esperado: Biome do scope, testes, tipos e build verdes; ambos greps vazios. O lint global é fechado no plano 004. No browser, nenhuma chamada Statsig sem consentimento.

## Done criteria

- [ ] Cliente e servidor são default-deny.
- [ ] Replay nunca é construído sem opt-in.
- [ ] Retirada de consentimento interrompe recolha futura.
- [ ] Nenhum email/nome de waitlist/login é enviado ao analytics.

## STOP

- Cookie de consentimento não está disponível nas Server Actions: desenhar passagem explícita server-safe e pedir revisão, não confiar em campo livre do cliente.
- SDK não permite shutdown seguro: propor provider isolado/reload explícito.

## Manutenção

Todo novo evento server-side deve usar o helper central; review de PR deve rejeitar chamadas diretas ao SDK.
