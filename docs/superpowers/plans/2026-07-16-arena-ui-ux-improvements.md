# Arena UI/UX Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a Arena num cockpit rápido e contextual para o capitão, corrigir loading/responsividade/acessibilidade, rever o PT-PT e substituir emojis de interface por Lucide ou assets de branding coerentes.

**Architecture:** Manter as queries e regras de domínio existentes, enriquecendo o DTO de equipas com a capacidade de gestão calculada no servidor. Derivar evento e ações do cockpit em utilitários puros de apresentação, apresentar loading/error/empty por secção e manter componentes partilhados sem regras de rota. Tratar assets em duas classes: Lucide para operação e imagens de branding versionadas para escolhas Jogo/Treino e ilustrações.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, TanStack Query, next-intl, Tailwind CSS 4, Vitest, Lucide, GPT Images, `next/image`.

**Specification:** `docs/superpowers/specs/2026-07-16-arena-ui-ux-improvements-design.md`

**Required skills during execution:** `@dev-coder`, `@superpowers:test-driven-development`, `@imagegen` (Task 8 only), `@superpowers:verification-before-completion`.

---

## File map

### Create

- `src/app/(mobile)/(protected)/arena/_utils/dashboard-cockpit.ts`: seleção do evento e ações apresentacionais do cockpit.
- `src/app/(mobile)/(protected)/arena/_utils/dashboard-cockpit.test.ts`: matriz de evento, permissões e ações.
- `src/lib/team-capabilities.ts`: papéis de gestão e merge determinístico do DTO de equipas.
- `src/lib/team-capabilities.test.ts`: owner/manager/coach/player, deduplicação e ausência de acesso.
- `src/app/(mobile)/(protected)/arena/_components/dashboard-skeleton.tsx`: skeleton estrutural do cockpit.
- `src/hooks/use-dashboard.test.ts`: composição de estados independentes de eventos/plantel e retry focado.
- `src/components/arena/query-state.tsx`: erro local traduzível com retry e indicador de refetch.
- `src/components/arena/query-state.test.ts`: precedência loading/error/empty/success e refetch com dados anteriores.
- `src/app/(mobile)/(protected)/arena/events/_utils/events-view.ts`: separação determinística de próximos/anteriores.
- `src/app/(mobile)/(protected)/arena/events/_utils/events-view.test.ts`: histórico preservado sem próximos.
- `src/app/(mobile)/(protected)/arena/squads/_hooks/use-squad-client-state.test.ts`: estados e retry do plantel.
- `src/app/(mobile)/(protected)/arena/payments/_hooks/use-payments-page-state.test.ts`: estados independentes de pagamentos/definições.
- `src/components/arena/bottom-nav.test.ts`: cinco destinos e correspondência de subrotas.
- `src/lib/__tests__/arena-locale-contract.test.ts`: paridade de namespaces e placeholders dos quatro locales.
- `src/lib/__tests__/arena-iconography-contract.test.ts`: contrato de emojis permitidos/proibidos nas superfícies em âmbito.
- `src/constants/positions.test.ts`: contrato Lucide das posições sem API emoji.
- `docs/design/arena-brand-assets.md`: inventário, prompts, referências, dimensões e estado de aprovação.
- `docs/verification/arena-ui-ux-2026-07-16.md`: matriz de evidência, fixtures usadas, medições e resultados do browser.
- `src/assets/images/branding/`: fontes e exports aprovados dos novos assets.

### Modify

- `src/actions/teams.actions.ts`: devolver `role` e `canManage` no DTO de `getMyTeams`.
- `src/lib/team-access.ts`: reutilizar a allowlist de papéis de gestão partilhada.
- `src/hooks/use-teams.ts`: tipar e expor a capacidade da equipa ativa.
- `src/hooks/use-dashboard.ts`: expor loading/error/refetch separados para eventos e plantel.
- `src/app/(mobile)/(protected)/arena/_components/arena-dashboard.tsx`: implementar cockpit “Ação primeiro”.
- `src/app/(mobile)/(protected)/arena/events/_components/events-list.tsx`: corrigir empty state dos próximos sem esconder histórico.
- `src/app/(mobile)/(protected)/arena/squads/_hooks/use-squad-client-state.ts`: expor erro/refetch sem loading infinito.
- `src/app/(mobile)/(protected)/arena/squads/_components/squad-client.tsx`: skeleton, erro local e empty state responsivo.
- `src/app/(mobile)/(protected)/arena/payments/_hooks/use-payments-page-state.ts`: separar estados de pagamentos e definições.
- `src/app/(mobile)/(protected)/arena/payments/_components/payments-list-tab.tsx`: skeleton/erro/empty local.
- `src/app/(mobile)/(protected)/arena/payments/page.tsx`: não mostrar métricas falsas durante loading/erro.
- `src/components/arena/empty-state.tsx`: aceitar `icon` ou `image`, reservar dimensões e evitar clipping.
- `src/components/loading.tsx`: corrigir `alt`, `sizes` e limitar o uso a loading inline.
- `src/components/arena/bottom-nav.tsx`: cinco destinos e alvos de 44 px.
- `src/components/arena/mobile-top-bar.tsx`: alvos de 44 px e acesso persistente a Notificações.
- `src/app/(mobile)/(protected)/arena/events/[id]/_components/event-action-bar.tsx`: atalho contextual para Cronómetro.
- `src/components/arena/create-event-step-type.tsx`: usar assets aprovados na escolha Jogo/Treino.
- `src/components/shared/events/create-event-dialog.utils.ts`: trocar `emoji` por metadados de asset/Lucide.
- `src/constants/positions.ts`: remover API de emoji e manter Lucide.
- `src/components/timer/setup-drawer.tsx`, `hub-view.tsx`, `result-view.tsx`, `summary-modal.tsx`: trocar emojis funcionais por Lucide.
- `src/styles/globals.css`: ritmos, fundo, skeleton, responsive empty state e reduced motion.
- `src/locales/pt.json`, `en.json`, `es.json`, `fr.json`: chaves novas e revisão dos namespaces aprovados.
- `src/components/logo.tsx`: descrição PT-PT visível da marca, se ainda for a fonte efetiva após `rg`.
- `DESIGN.md`: alinhar navegação mobile, loading e política de assets.

---

### Task 1: Contrato de equipa e permissões do cockpit

**Files:**
- Create: `src/lib/team-capabilities.ts`
- Create: `src/lib/team-capabilities.test.ts`
- Modify: `src/lib/team-access.ts`
- Modify: `src/actions/teams.actions.ts`
- Modify: `src/hooks/use-teams.ts`
- Create: `src/app/(mobile)/(protected)/arena/_utils/dashboard-cockpit.ts`
- Create: `src/app/(mobile)/(protected)/arena/_utils/dashboard-cockpit.test.ts`

- [ ] **Step 1: Escrever testes falhados para seleção de evento e ações**

Cobrir: sem equipa devolve `null`; capitão sem evento recebe “create-event”; membro sem evento recebe “view-squad”; evento futuro não cancelado mais próximo vence; empate usa menor `id`; cancelados são ignorados; adicionar jogador é ação secundária apenas para gestor com plantel vazio.

```ts
import { describe, expect, it } from "vitest";
import { buildCockpitActions, selectActiveEvent } from "./dashboard-cockpit";

describe("buildCockpitActions", () => {
  it("blocks cockpit actions when no team exists", () => {
    expect(buildCockpitActions({
      hasTeam: false,
      canManageTeam: false,
      activeEvent: null,
      squadCount: 0,
    })).toBeNull();
  });

  it("creates an event and offers adding a player to an empty managed team", () => {
    expect(buildCockpitActions({
      hasTeam: true,
      canManageTeam: true,
      activeEvent: null,
      squadCount: 0,
    })).toEqual({ primary: { type: "create-event" }, secondary: [{ type: "add-player" }] });
  });
});
```

- [ ] **Step 2: Executar o teste e confirmar que falha**

Run: `pnpm vitest run 'src/app/(mobile)/(protected)/arena/_utils/dashboard-cockpit.test.ts'`

Expected: FAIL porque o utilitário ainda não existe.

- [ ] **Step 3: Implementar os tipos e utilitários puros mínimos**

Usar uma união literal para ações. Receber `now` explicitamente em `selectActiveEvent` para testes determinísticos. Não importar hooks, DB ou React.

```ts
export type CockpitAction =
  | { type: "create-event" }
  | { type: "view-event"; eventId: number }
  | { type: "add-player" }
  | { type: "view-squad" };

export interface CockpitActionInput {
  hasTeam: boolean;
  canManageTeam: boolean;
  activeEvent: DashboardEvent | null;
  squadCount: number;
}
```

- [ ] **Step 4: Escrever testes falhados do DTO de capacidade**

Testar `buildAccessibleTeamSummaries` com: equipa própria (`owner/true`), associação `manager/true`, `coach/false`, `player/false`, equipa presente nas duas listas (owner vence) e ausência de listas (resultado vazio). Testar também `isManagementRole` para a mesma allowlist usada por `canManageTeam`.

Run: `pnpm vitest run src/lib/team-capabilities.test.ts`

Expected: FAIL porque os helpers não existem.

- [ ] **Step 5: Implementar a capacidade partilhada e reutilizá-la no servidor**

Criar `MANAGEMENT_ROLES = ["owner", "manager"] as const` e `isManagementRole`. Usar a mesma constante/helper em `src/lib/team-access.ts` e no mapper do DTO, para provar equivalência com `canManageTeam`. O booleano `canManage` serve apenas apresentação; todas as mutações continuam a chamar `canManageTeam`/`userIsTeamOwner` no servidor.

- [ ] **Step 6: Enriquecer `getMyTeams` sem confiar no cliente**

Devolver para cada equipa `membershipRole: "owner" | "manager" | "coach" | "player"` e `canManage: boolean`. Equipas próprias recebem `owner/true`; equipas associadas recebem o papel real de `teamMembers`. Deduplicar preservando a capacidade mais alta.

- [ ] **Step 7: Tipar o DTO no hook e expor `activeTeamCanManage`**

`useTeams` encontra a equipa ativa no DTO. Não usar `session.user.role` como autorização da equipa.

- [ ] **Step 8: Executar testes e typecheck focado**

Run: `pnpm vitest run 'src/app/(mobile)/(protected)/arena/_utils/dashboard-cockpit.test.ts' src/lib/team-capabilities.test.ts && pnpm ts-check`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add src/lib/team-capabilities.ts src/lib/team-capabilities.test.ts src/lib/team-access.ts src/actions/teams.actions.ts src/hooks/use-teams.ts 'src/app/(mobile)/(protected)/arena/_utils/dashboard-cockpit.ts' 'src/app/(mobile)/(protected)/arena/_utils/dashboard-cockpit.test.ts'
git commit -m "feat(arena): define cockpit permissions and actions"
```

### Task 2: Estados de query e primitives de feedback

**Files:**
- Create: `src/components/arena/query-state.tsx`
- Create: `src/components/arena/query-state.test.ts`
- Modify: `src/components/arena/empty-state.tsx`
- Modify: `src/components/loading.tsx`
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Definir o contrato do feedback local**

`ArenaQueryError` recebe `title`, `description`, `retryLabel`, `onRetry` e `isRetrying`. `ArenaEmptyState` passa a aceitar exatamente um de `icon` ou `image`, com `image.alt`, `image.src`, `image.width` e `image.height`.

- [ ] **Step 2: Escrever testes falhados da máquina de estados**

Exportar no futuro `deriveQueryViewState({ hasData, isInitialLoading, isFetching, error })`. Testar: loading inicial; error prevalece sobre empty; empty só após sucesso sem dados; success com dados; refetch com dados preserva success e marca `isRefreshing`.

No mesmo ficheiro, adicionar testes de contrato que leem `query-state.tsx`, `empty-state.tsx` e `loading.tsx`: `ArenaQueryError` contém `role="alert"` e `aria-busy`; `ArenaEmptyStateProps` é uma união discriminada com ramos `{ icon; image?: never }` e `{ image; icon?: never }`; `Loading` usa `alt=""` e `sizes` quando usa `fill`. O callback de retry é testado nos helpers específicos do Dashboard/Plantel/Cobranças, não na derivação visual genérica.

Run: `pnpm vitest run src/components/arena/query-state.test.ts`

Expected: FAIL porque `deriveQueryViewState` não existe.

- [ ] **Step 3: Implementar a derivação pura e `ArenaQueryError`**

Usar `AlertCircle`, `Cta`, `role="alert"`, foco visível e `aria-busy` durante retry. Exportar props como união/tipo verificável. Não criar modal.

- [ ] **Step 4: Tornar `ArenaEmptyState` responsivo**

Evitar largura/transform fixa; usar `w-full min-w-0`, padding mobile e `max-w` apenas no texto. O asset deve ter caixa reservada e `object-contain`.

- [ ] **Step 5: Corrigir `Loading`**

Usar `alt=""` para GIF decorativo, `sizes` coerente com 32/48/64 px e `aria-hidden`. Manter apenas para loading inline; páginas passam a usar skeletons.

- [ ] **Step 6: Adicionar classes de skeleton e reduced motion**

Criar `.jb-skeleton` com brilho discreto baseado em tokens, sem animar layout. Desativar animação em `prefers-reduced-motion`.

- [ ] **Step 7: Executar testes, lint e typecheck**

Run: `pnpm vitest run src/components/arena/query-state.test.ts && pnpm lint && pnpm ts-check`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/arena/query-state.tsx src/components/arena/query-state.test.ts src/components/arena/empty-state.tsx src/components/loading.tsx src/styles/globals.css
git commit -m "feat(arena): add resilient query feedback states"
```

### Task 3: Dashboard “Ação primeiro” com estados independentes

**Files:**
- Create: `src/hooks/use-dashboard.test.ts`
- Modify: `src/hooks/use-dashboard.ts`
- Create: `src/app/(mobile)/(protected)/arena/_components/dashboard-skeleton.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/_components/arena-dashboard.tsx`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Escrever novos casos falhados do view model do cockpit**

Adicionar casos ainda não implementados para evento ativo, membro sem permissão, equipa gerida com plantel, ordenação determinística e flags de UI: `showMetrics` apenas com evento, `showWeek` apenas com eventos secundários e `showDiscover` apenas com feature ativa e conteúdo. Confirmar que o modelo sem evento produz exatamente um CTA primário.

- [ ] **Step 2: Executar o teste e confirmar os novos casos**

Run: `pnpm vitest run 'src/app/(mobile)/(protected)/arena/_utils/dashboard-cockpit.test.ts'`

Expected: FAIL nos novos campos/flags ainda não implementados.

- [ ] **Step 3: Implementar o view model mínimo e voltar a GREEN**

Run: `pnpm vitest run 'src/app/(mobile)/(protected)/arena/_utils/dashboard-cockpit.test.ts'`

Expected: PASS.

- [ ] **Step 4: Escrever testes falhados da composição de queries do Dashboard**

Extrair depois `deriveDashboardQueryState` para receber snapshots de eventos/plantel e os dois callbacks `refetch`. Testar explicitamente: erro de eventos mantém plantel; erro de plantel mantém evento; duas falhas produzem dois erros locais; cada retry conserva a identidade do callback correto; refetch com dados preserva cada secção; arrays vazios após sucesso são empty e não error.

Run: `pnpm vitest run src/hooks/use-dashboard.test.ts`

Expected: FAIL porque o helper ainda não existe.

- [ ] **Step 5: Expor estados independentes em `useDashboardData` e voltar a GREEN**

Devolver `eventsState` e `squadState` com `isInitialLoading`, `isFetching`, `error` e `refetch`. Preservar dados anteriores durante refetch. Não converter resposta de erro em array vazio.

Run: `pnpm vitest run src/hooks/use-dashboard.test.ts`

Expected: PASS.

- [ ] **Step 6: Criar `DashboardSkeleton` estrutural**

Representar topbar, próxima ação/evento e plantel. Não ocupar o ecrã inteiro nem esconder a navegação.

- [ ] **Step 7: Integrar capacidade e mapper no dashboard**

Usar `activeTeamCanManage`, `selectActiveEvent` e `buildCockpitActions`. A UI apenas traduz tipos de ação para sheets/links.

- [ ] **Step 8: Implementar estado sem evento aprovado**

Mostrar um único CTA primário “Criar evento”; secundário “Adicionar jogador” ou “Ver plantel”. Ocultar métricas, “Esta semana” e “Descobrir” quando não têm conteúdo. Remover o CTA mobile duplicado.

- [ ] **Step 9: Implementar estado com evento**

Mostrar hero e métricas ligadas ao evento. Adicionar atalho secundário do Cronómetro. Erro de eventos não apaga plantel; erro de plantel não apaga evento.

- [ ] **Step 10: Verificar a disponibilidade de “Partilhar equipa”**

Run: `rg -n "Partilhar equipa|shareTeam|team.*share|share.*team|navigator.share" src --glob '*.{ts,tsx,json}'`

Expected no estado atual: não existe mecanismo de partilha de equipa, apenas partilha de evento/timer. Registar no comentário do view model e na especificação de implementação que a ação fica indisponível por não existir URL/contrato seguro; não inventar um link. Se entretanto existir um mecanismo real, integrar como ação secundária e adicionar caso ao teste antes da UI.

- [ ] **Step 11: Adicionar e sincronizar traduções do cockpit**

Adicionar chaves em `arenaDashboard.cockpit` nos quatro locales. PT-PT em sentence case. Não alterar namespaces fora do âmbito.

- [ ] **Step 12: Validar testes, lint e tipos**

Run: `pnpm vitest run 'src/app/(mobile)/(protected)/arena/_utils/dashboard-cockpit.test.ts' src/hooks/use-dashboard.test.ts && pnpm lint && pnpm ts-check`

Expected: PASS.

- [ ] **Step 13: Commit**

```bash
git add src/hooks/use-dashboard.ts src/hooks/use-dashboard.test.ts 'src/app/(mobile)/(protected)/arena/_components/dashboard-skeleton.tsx' 'src/app/(mobile)/(protected)/arena/_components/arena-dashboard.tsx' src/locales/{pt,en,es,fr}.json
git commit -m "feat(arena): prioritize the captain next action"
```

### Task 4: Eventos responsivos sem perder histórico

**Files:**
- Create: `src/app/(mobile)/(protected)/arena/events/_utils/events-view.ts`
- Create: `src/app/(mobile)/(protected)/arena/events/_utils/events-view.test.ts`
- Modify: `src/app/(mobile)/(protected)/arena/events/_components/events-list.tsx`
- Modify: `src/components/arena/empty-state.tsx`
- Modify: `src/styles/globals.css`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Escrever o teste falhado de `partitionEventsByDate`**

Testar em `events-view.test.ts` que ausência de próximos não remove anteriores, cancelados não entram em próximos e a ordenação é ascendente/descendente conforme a secção.

- [ ] **Step 2: Executar o teste falhado**

Run: `pnpm vitest run 'src/app/(mobile)/(protected)/arena/events/_utils/events-view.test.ts'`

Expected: FAIL até existir o utilitário/teste.

- [ ] **Step 3: Implementar `partitionEventsByDate` e voltar a GREEN**

Run: `pnpm vitest run 'src/app/(mobile)/(protected)/arena/events/_utils/events-view.test.ts'`

Expected: PASS.

- [ ] **Step 4: Implementar empty state apenas na secção Próximos**

O cabeçalho e “Anteriores” permanecem. O CTA só aparece para `activeTeamCanManage`; membros recebem ligação para o calendário/plantel conforme contexto.

- [ ] **Step 5: Corrigir o clipping**

Remover dimensões, alinhamentos ou transforms que empurrem o conteúdo. Garantir `min-w-0`, `w-full` e padding mobile.

- [ ] **Step 6: Adicionar skeleton e erro local da lista**

Loading inicial mostra linhas/hero skeleton; erro mostra retry. Refetch preserva conteúdo anterior.

- [ ] **Step 7: Sincronizar traduções**

Rever `arenaEvents.empty`, `hero`, `sections` e `actions` nos quatro locales.

- [ ] **Step 8: Validar route e testes**

Run: `pnpm vitest run 'src/app/(mobile)/(protected)/arena/events/_utils/events-view.test.ts' src/components/arena/query-state.test.ts && pnpm lint && pnpm ts-check`

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add 'src/app/(mobile)/(protected)/arena/events/_utils/events-view.ts' 'src/app/(mobile)/(protected)/arena/events/_utils/events-view.test.ts' 'src/app/(mobile)/(protected)/arena/events/_components/events-list.tsx' src/components/arena/empty-state.tsx src/styles/globals.css src/locales/{pt,en,es,fr}.json
git commit -m "fix(arena): keep event empty states responsive"
```

### Task 5: Plantel e Cobranças com loading/erro/empty distintos

**Files:**
- Create: `src/app/(mobile)/(protected)/arena/squads/_hooks/use-squad-client-state.test.ts`
- Create: `src/app/(mobile)/(protected)/arena/payments/_hooks/use-payments-page-state.test.ts`
- Modify: `src/app/(mobile)/(protected)/arena/squads/_hooks/use-squad-client-state.ts`
- Modify: `src/app/(mobile)/(protected)/arena/squads/_components/squad-client.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/payments/_hooks/use-payments-page-state.ts`
- Modify: `src/app/(mobile)/(protected)/arena/payments/_components/payments-list-tab.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/payments/page.tsx`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Extrair helpers puros e escrever testes falhados dos estados compostos**

Em cada hook, exportar depois um helper puro que recebe snapshots das queries e devolve estados de secção. Testar: `error > empty`, empty só após sucesso, dados anteriores durante refetch, pagamentos e definições independentes, métricas indisponíveis durante loading/erro e callback de retry correto por secção.

Run: `pnpm vitest run 'src/app/(mobile)/(protected)/arena/squads/_hooks/use-squad-client-state.test.ts' 'src/app/(mobile)/(protected)/arena/payments/_hooks/use-payments-page-state.test.ts'`

Expected: FAIL porque os helpers ainda não existem.

- [ ] **Step 2: Parar de converter falhas em arrays vazios e voltar a GREEN**

Nos hooks, preservar `error`, `isInitialLoading`, `isFetching` e `refetch` por query. Distinguir pagamentos de definições de pagamento.

Run: `pnpm vitest run 'src/app/(mobile)/(protected)/arena/squads/_hooks/use-squad-client-state.test.ts' 'src/app/(mobile)/(protected)/arena/payments/_hooks/use-payments-page-state.test.ts'`

Expected: PASS.

- [ ] **Step 3: Implementar skeleton de linhas no Plantel**

Manter cabeçalho/pesquisa visíveis. Erro substitui só a lista; empty após sucesso apresenta CTA apenas a gestores.

- [ ] **Step 4: Implementar estados locais em Cobranças**

Métricas usam skeleton durante loading inicial e nunca mostram `€0,00` como se fosse sucesso. Erro de pagamentos não apaga métodos carregados; erro de métodos não apaga pagamentos.

- [ ] **Step 5: Garantir retry focado**

Cada `ArenaQueryError` chama apenas o `refetch` da query falhada. Durante retry, manter dados anteriores e marcar o controlo como busy.

- [ ] **Step 6: Rever PT-PT destes estados**

Usar “Não foi possível carregar…”, “Tentar novamente”, “Ainda não há…” e sentence case. Sincronizar chaves nos quatro locales.

- [ ] **Step 7: Validar**

Run: `pnpm vitest run 'src/app/(mobile)/(protected)/arena/squads/_hooks/use-squad-client-state.test.ts' 'src/app/(mobile)/(protected)/arena/payments/_hooks/use-payments-page-state.test.ts' src/components/arena/query-state.test.ts && pnpm lint && pnpm ts-check`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add 'src/app/(mobile)/(protected)/arena/squads/_hooks/use-squad-client-state.ts' 'src/app/(mobile)/(protected)/arena/squads/_hooks/use-squad-client-state.test.ts' 'src/app/(mobile)/(protected)/arena/squads/_components/squad-client.tsx' 'src/app/(mobile)/(protected)/arena/payments/_hooks/use-payments-page-state.ts' 'src/app/(mobile)/(protected)/arena/payments/_hooks/use-payments-page-state.test.ts' 'src/app/(mobile)/(protected)/arena/payments/_components/payments-list-tab.tsx' 'src/app/(mobile)/(protected)/arena/payments/page.tsx' src/locales/{pt,en,es,fr}.json
git commit -m "fix(arena): separate roster and payment query states"
```

### Task 6: Navegação mobile e Cronómetro contextual

**Files:**
- Create: `src/components/arena/bottom-nav.test.ts`
- Modify: `src/components/arena/bottom-nav.tsx`
- Modify: `src/components/arena/mobile-top-bar.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/events/[id]/_components/event-action-bar.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/_components/arena-dashboard.tsx`
- Modify: `DESIGN.md`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Criar teste de configuração da navegação**

Extrair `BOTTOM_NAV_ITEMS` para uma constante testável e verificar cinco destinos, sem `/timer`, com subrotas ativas.

- [ ] **Step 2: Executar o teste e confirmar que falha**

Run: `pnpm vitest run src/components/arena/bottom-nav.test.ts`

Expected: FAIL enquanto existem seis itens.

- [ ] **Step 3: Implementar os cinco destinos**

Manter Equipa, Plantel, Eventos, Cobranças e Perfil. Adicionar `min-h-11 min-w-11`/área equivalente e `.press` em todos os destinos.

- [ ] **Step 4: Manter Notificações no topbar**

Aumentar o link e o avatar/menu para pelo menos 44×44 px. Preservar contador não lido e `aria-label` traduzido.

- [ ] **Step 5: Colocar Cronómetro no contexto**

Adicionar link/ação no detalhe de evento e atalho secundário no dashboard com evento. Não criar nova rota nem transportar dados sensíveis no URL.

- [ ] **Step 6: Atualizar `DESIGN.md` e locales**

Documentar cinco destinos, Notificações no sino e Cronómetro contextual. Rever “Configurações” para “Definições” no PT-PT dentro do namespace em âmbito.

- [ ] **Step 7: Validar**

Run: `pnpm vitest run src/components/arena/bottom-nav.test.ts && pnpm lint && pnpm ts-check`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/arena/bottom-nav.tsx src/components/arena/bottom-nav.test.ts src/components/arena/mobile-top-bar.tsx 'src/app/(mobile)/(protected)/arena/events/[id]/_components/event-action-bar.tsx' 'src/app/(mobile)/(protected)/arena/_components/arena-dashboard.tsx' DESIGN.md src/locales/{pt,en,es,fr}.json
git commit -m "feat(arena): focus mobile navigation on team operations"
```

### Task 7: Inventário e contrato dos assets de branding

**Files:**
- Create: `docs/design/arena-brand-assets.md`
- Create: `src/constants/positions.test.ts`
- Modify: `src/constants/positions.ts`

- [ ] **Step 1: Inventariar imagens e emojis sem alterar UI**

Run:

```bash
rg --files src/assets public | rg -i '\.(png|jpe?g|webp|gif|svg)$'
rg -n --glob '*.{ts,tsx,json}' '[⚽🏃🏆🥅🎯💰📅👥⭐🔥✅❌⚠️]' src
```

Registar em `docs/design/arena-brand-assets.md`: ocorrência, classificação (`branding`, `operacional`, `conteúdo permitido`, `fora de âmbito`), decisão e asset/Lucide de destino.

- [ ] **Step 2: Escrever o teste falhado das posições**

Testar que todas as posições expõem um `LucideIcon`, que `getPositionIcon` tem fallback previsível e que a API pública não contém `emoji`/`getPositionEmoji`.

Run: `pnpm vitest run src/constants/positions.test.ts`

Expected: FAIL enquanto a API emoji existir.

- [ ] **Step 3: Remover a API de emoji das posições**

Eliminar `emoji` de `PositionConfig` e `getPositionEmoji`. Confirmar com `rg` que não existem consumidores. Manter `getPositionIcon` com Lucide.

- [ ] **Step 4: Definir a primeira família de branding**

Reutilizar `jb-game.png` e `jb-training.png` se passarem a grelha; marcar como `generate` apenas itens em falta para `friendly`, `meeting` e empty states aprovados. Não gerar nesta tarefa. Documentar prompt-base, 1024×1024, safe area 84%, fundo transparente, leitura a 56 px, exports WebP 256/512.

- [ ] **Step 5: Executar teste e validar inventário**

Run: `pnpm vitest run src/constants/positions.test.ts && rg -n 'getPositionEmoji|emoji:' src/constants/positions.ts`

Expected: PASS e zero ocorrências na API de posições. O inventário pode listar ocorrências pendentes noutras superfícies, sem introduzir um teste vermelho no commit.

- [ ] **Step 6: Commit**

```bash
git add docs/design/arena-brand-assets.md src/constants/positions.ts src/constants/positions.test.ts
git commit -m "docs(arena): define branding asset inventory"
```

### Task 8: Gerar e aprovar os assets GPT Images

**Required skill:** `@imagegen`

**Files:**
- Create: `src/assets/images/branding/*.png`
- Create: `src/assets/images/branding/*@1x.webp`
- Create: `src/assets/images/branding/*@2x.webp`
- Modify: `docs/design/arena-brand-assets.md`

- [ ] **Step 1: Inspecionar as referências antes de gerar**

Abrir `jb-game.png`, `jb-training.png`, `jb-manager.png`, `jb-money.png`, `jb-challenge.png` e `jb-other.png`. Registar semelhanças e inconsistências no documento.

- [ ] **Step 2: Gerar uma família por vez**

Usar GPT Images com as imagens locais como referências. Gerar apenas os assets marcados `generate` no inventário. Prompt-base:

```text
Create one square JogaBola amateur-football brand icon matching the supplied references: dark forest-green thick outline, rounded solid shapes, lime and warm yellow accents, subtle dimensional shading, hexagonal badge framing, transparent background, no text, no letters, no photorealism. Keep the subject inside a central 84% safe area and readable at 56×56 px. Subject: {subject}.
```

- [ ] **Step 3: Parar para aprovação visual do utilizador**

Apresentar as variantes lado a lado. Não integrar assets rejeitados. Registar `approved`, data e ficheiro escolhido no documento.

- [ ] **Step 4: Exportar formatos finais após aprovação**

Usar ImageMagick/cwebp apenas depois da aprovação:

```bash
cwebp -quiet -q 88 -resize 256 256 input.png -o output@1x.webp
cwebp -quiet -q 90 -resize 512 512 input.png -o output@2x.webp
```

Manter `input.png` como fonte 1024×1024 e usar nomes semânticos reais definidos no inventário. Verificar automaticamente:

```bash
identify -format '%f %wx%h %[channels]\n' src/assets/images/branding/*
```

Expected: fonte PNG 1024×1024 com alpha; WebP 256×256 e 512×512. Criar uma montagem temporária a 56 px para aprovação visual da legibilidade e confirmar safe area/halo antes do commit.

- [ ] **Step 5: Commit**

```bash
git add src/assets/images/branding docs/design/arena-brand-assets.md
git commit -m "feat(brand): add approved Arena event artwork"
```

### Task 9: Integrar assets e eliminar emojis funcionais

**Files:**
- Modify: `src/components/arena/create-event-step-type.tsx`
- Modify: `src/components/shared/events/create-event-dialog.utils.ts`
- Modify: `src/components/timer/setup-drawer.tsx`
- Modify: `src/components/timer/hub-view.tsx`
- Modify: `src/components/timer/result-view.tsx`
- Modify: `src/components/timer/summary-modal.tsx`
- Create: `src/lib/__tests__/arena-iconography-contract.test.ts`

- [ ] **Step 1: Escrever o contrato falhado de iconografia**

O teste lê apenas `create-event-dialog.utils.ts`, `create-event-step-type.tsx` e os quatro componentes Timer em âmbito. Deve falhar para emojis funcionais e aceitar Lucide/imports de assets. Não incluir emails, conteúdo partilhado pelo utilizador nem 🏆 de campeão.

Run: `pnpm vitest run src/lib/__tests__/arena-iconography-contract.test.ts`

Expected: FAIL com as ocorrências atuais.

- [ ] **Step 2: Atualizar metadados dos tipos de evento**

Trocar `emoji` por uma união discriminada:

```ts
type EventTypeVisual =
  | { kind: "brand"; image: StaticImageData; altKey: string }
  | { kind: "icon"; icon: LucideIcon };
```

Jogo/Treino e novos elementos aprovados usam branding; ações/checks continuam Lucide.

- [ ] **Step 3: Integrar com `next/image`**

Reservar dimensões, usar `sizes="56px"` ou tamanho real e alt traduzido quando informativo. Imagens decorativas recebem alt vazio.

- [ ] **Step 4: Migrar Cronómetro para Lucide**

Substituir bola/troféu/alvo usados como controlos ou estado por `CircleDot`, `Trophy`, `Target`, `Timer` ou equivalente semanticamente correto. Não substituir 🏆 de campeão fora do âmbito.

- [ ] **Step 5: Executar o contrato de iconografia**

Run: `pnpm vitest run src/lib/__tests__/arena-iconography-contract.test.ts && rg -n 'emoji:' src/components/shared/events src/constants/positions.ts`

Expected: PASS e zero ocorrências funcionais no âmbito.

- [ ] **Step 6: Validar lint/tipos**

Run: `pnpm lint && pnpm ts-check`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/components/arena/create-event-step-type.tsx src/components/shared/events/create-event-dialog.utils.ts src/components/timer/{setup-drawer,hub-view,result-view,summary-modal}.tsx src/lib/__tests__/arena-iconography-contract.test.ts
git commit -m "feat(arena): replace functional emoji visuals"
```

### Task 10: Revisão PT-PT e paridade dos locales

**Files:**
- Create: `src/lib/__tests__/arena-locale-contract.test.ts`
- Modify: `src/locales/pt.json`
- Modify: `src/locales/en.json`
- Modify: `src/locales/es.json`
- Modify: `src/locales/fr.json`
- Modify: `src/components/logo.tsx`

- [ ] **Step 1: Escrever o teste de paridade falhado**

Carregar os quatro JSON e comparar recursivamente chaves e placeholders dos namespaces aprovados: `arenaDashboard`, `arenaEvents`, `arenaNav`, `arenaNoTeamModal`, `arenaEventDetail`, `arenaSquad`, `arenaPayments`, `profilePage`.

- [ ] **Step 2: Executar e recolher divergências**

Run: `pnpm vitest run src/lib/__tests__/arena-locale-contract.test.ts`

Expected: FAIL com chaves/placeholders divergentes ou até a implementação do helper.

- [ ] **Step 3: Rever PT-PT no contexto**

Uniformizar sentence case e termos: “Criar evento”, “Adicionar jogador”, “Próximo jogo”, “Definições”, “Eliminar evento”, “Tem a certeza?”, “Tentar novamente”. Substituir “pelada” por “jogar à bola” na chave `APP.COMPANY.SLOGAN` usada por `Logo`. Em `logo.tsx`, trocar o texto hardcoded “Beta” por chave traduzida e definir `sizes` do `Image`. Evitar alterar emails/website fora do âmbito.

- [ ] **Step 4: Sincronizar os restantes locales**

Preservar significado e placeholders; não exigir revisão editorial profunda de EN/ES/FR. Não adicionar texto hardcoded a componentes.

- [ ] **Step 5: Executar contrato e pesquisa de hardcoded strings tocadas**

Run: `pnpm vitest run src/lib/__tests__/arena-locale-contract.test.ts && pnpm lint && pnpm ts-check`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/__tests__/arena-locale-contract.test.ts src/locales/{pt,en,es,fr}.json src/components/logo.tsx
git commit -m "fix(i18n): align Arena copy with European Portuguese"
```

### Task 11: Refinamento visual, performance e responsividade

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `src/app/(mobile)/(protected)/arena/layout.tsx`
- Create: `docs/verification/arena-ui-ux-2026-07-16.md`

- [ ] **Step 1: Reduzir ruído visual nas superfícies tocadas**

Diminuir a opacidade do `DotGrid` sob conteúdo denso, remover cards aninhados, reduzir letter-spacing em texto pequeno e manter o verde para ação/seleção. Não criar nova direção visual.

- [ ] **Step 2: Garantir dimensões reservadas de imagens**

Confirmar `width/height` ou `fill + sizes` em todas as imagens acima da dobra e nos assets novos. Corrigir o warning do logótipo LCP com prioridade apenas quando realmente acima da dobra.

- [ ] **Step 3: Preparar estados de dados reproduzíveis pela UI**

Run: `pnpm dev`

No browser integrado autenticado, procurar primeiro pelo nome e reutilizar, sem duplicar. Se não existirem, criar e registar no documento:

1. equipa `[UI-REVIEW] Empty`, sem eventos e sem jogadores adicionais;
2. equipa `[UI-REVIEW] Active`, com um treino futuro intitulado `[UI-REVIEW] Treino`, um jogador e evento sem pagamentos;
3. sessão owner/capitão dessa equipa;
4. sessão de um membro `player` associado à mesma equipa.

Criar os dados apenas através dos fluxos normais da app, sem SQL ad hoc. Registar IDs, ownership e passos, nunca credenciais. Estas fixtures ficam intencionalmente preservadas para regressões futuras porque a app não expõe eliminação segura de equipa; o prefixo reservado evita confusão com dados reais e torna a tarefa idempotente. No fim, cancelar pela UI qualquer evento extra criado durante o percurso e deixar apenas `[UI-REVIEW] Treino`. Se não existir forma de autenticar a segunda sessão, parar a verificação e pedir ao utilizador a sessão; não substituir o critério por inferência.

- [ ] **Step 4: Verificar 320, 390, 768 e 1440 px no browser integrado**

Rotas: `/arena`, `/arena/events`, `/arena/squads`, `/arena/payments`, `/arena/profile`.

Em cada viewport confirmar:

- `scrollWidth === clientWidth`;
- empty state e CTA totalmente visíveis;
- alvos mobile ≥44×44;
- sidebar desktop e bottom nav mobile exclusivas;
- shell permanece durante loading/erro;
- sem novos warnings de `next/image`.

Usar a capacidade de viewport do browser e registar para cada rota/viewport o resultado de:

```js
({
  clientWidth: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
  overflow: document.documentElement.scrollWidth !== document.documentElement.clientWidth,
})
```

Guardar no documento a rota, equipa/role, viewport, medição, screenshot de referência e resultado. Loading/error/refetch são provados pelos testes determinísticos das Tasks 2, 3 e 5; o browser valida os estados empty/success reais e a transição observável sem substituir esses testes.

- [ ] **Step 5: Corrigir apenas regressões observadas nos dois ficheiros em âmbito**

Aplicar aqui apenas ajustes em `src/styles/globals.css` e `src/app/(mobile)/(protected)/arena/layout.tsx`. Se a causa estiver num componente de Tasks 3–6, reabrir a tarefa responsável, editar e stagear explicitamente esse ficheiro num commit de correção separado.

- [ ] **Step 6: Validar reduced motion e teclado**

Confirmar foco visível, ordem lógica e ausência de animação não essencial com `prefers-reduced-motion`.

- [ ] **Step 7: Executar suite completa**

Run: `pnpm lint && pnpm ts-check && pnpm test && pnpm build`

Expected: todos os comandos PASS. Se existir falha pré-existente, registar comando, ficheiro/linha e provar que não é causada por estas alterações.

- [ ] **Step 8: Commit**

```bash
git add src/styles/globals.css 'src/app/(mobile)/(protected)/arena/layout.tsx' docs/verification/arena-ui-ux-2026-07-16.md
git commit -m "polish(arena): refine responsive operational UI"
```

### Task 12: Verificação final contra a especificação

**Required skill:** `@superpowers:verification-before-completion`

**Files:**
- Verify: `docs/superpowers/specs/2026-07-16-arena-ui-ux-improvements-design.md`
- Verify: all files changed in Tasks 1–11

- [ ] **Step 1: Construir matriz requisito → evidência**

Para cada critério de sucesso da especificação, ligar a teste, medição do browser, pesquisa `rg`, screenshot ou comando de build.

- [ ] **Step 2: Percorrer os fluxos manuais**

Com as fixtures e sessões registadas na Task 11: Arena → criar evento → detalhe → Cronómetro; Plantel; Cobranças; Perfil; notificações pelo sino. Repetir o cockpit como owner e como `player`, provando que o membro não recebe ações de mutação. A ausência de uma destas sessões bloqueia este passo e deve ser resolvida antes da conclusão.

- [ ] **Step 3: Confirmar assets aprovados**

Comparar com `docs/design/arena-brand-assets.md`, verificar que só assets `approved` estão integrados e que Lucide continua operacional.

- [ ] **Step 4: Confirmar PT-PT e paridade**

Run: `pnpm vitest run src/lib/__tests__/arena-locale-contract.test.ts src/lib/__tests__/arena-iconography-contract.test.ts`

Expected: PASS.

- [ ] **Step 5: Reexecutar verificação completa fresca**

Run: `pnpm lint && pnpm ts-check && pnpm test && pnpm build`

Expected: PASS com output recente.

- [ ] **Step 6: Registar riscos residuais e handoff**

Documentar apenas limitações comprovadas, sem declarar completo com critérios por verificar.

---

## Execution order and checkpoints

1. Tasks 1–6 podem ser executadas sem geração de imagens.
2. Task 7 fecha o inventário antes de qualquer geração.
3. Task 8 contém um gate humano obrigatório para aprovar imagens.
4. Tasks 9–10 integram assets e copy apenas após aprovação.
5. Tasks 11–12 fazem a validação visual e técnica global.

Não combinar os commits acima num único commit durante execução. Preservar alterações não relacionadas já presentes no worktree.
