# Fluid Page Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminar a sensação de "clique morto" na navegação — feedback instantâneo (skeleton + indicador pending + fade) e menos latência server-side por navegação.

**Architecture:** O problema tem duas metades. (1) Percepção: nenhuma rota arena tem `loading.tsx`, por isso o Next espera o render server completo antes de trocar o ecrã — adicionamos Suspense boundaries por rota com skeletons, indicador de pending nos links de navegação (`useLinkStatus`, Next 16) e fade-in entre ecrãs via `template.tsx`. (2) Latência real: `auth.api.getSession` é chamado 3× por request (layouts + página) sem dedupe, o arena layout faz 2 queries DB em série, e o gate Notion bloqueia navegação quando o cache de 5 min expira — deduplicamos a sessão com React `cache()`, paralelizamos as queries e tornamos o cache Notion stale-while-revalidate.

**Tech Stack:** Next.js 16 App Router (`loading.tsx`, `template.tsx`, `useLinkStatus`), React 19 `cache()`, Vitest, Tailwind CSS 4.

## Global Constraints

- **Zero Hardcoded Text**: todo o texto visível/sr-only via `useTranslations`/`getTranslations`. Este plano só usa chaves já existentes (`common.loading`, `arenaDashboard.loadingArena`) — **não** adicionar chaves novas; se precisares de uma, sincroniza `pt.json`, `en.json`, `es.json`, `fr.json`.
- UI em Português europeu (PT-PT); identificadores e comentários de código em inglês.
- Microinterações: manter `.press` nos clicáveis existentes; skeletons usam `animate-pulse` e tokens `arena-*` já existentes.
- Testes: Vitest, `environment: node`, só `src/**/*.test.ts` (sem testes de componente React — verificação de UI é feita via `pnpm build` + browser).
- Verificação global: `pnpm lint` · `pnpm ts-check` · `pnpm test` · `pnpm build`.

---

### Task 1: Skeletons de rota (`loading.tsx`) para o segmento arena

O maior ganho de UX: com `loading.tsx` por segmento, o clique troca o ecrã imediatamente para um skeleton em vez de congelar.

**Files:**
- Create: `src/components/arena/arena-page-skeleton.tsx`
- Create: `src/app/(mobile)/(protected)/arena/loading.tsx`
- Create: `src/app/(mobile)/(protected)/arena/events/loading.tsx`
- Create: `src/app/(mobile)/(protected)/arena/events/[id]/loading.tsx`
- Create: `src/app/(mobile)/(protected)/arena/calendar/loading.tsx`
- Create: `src/app/(mobile)/(protected)/arena/squads/loading.tsx`
- Create: `src/app/(mobile)/(protected)/arena/squads/player/[id]/loading.tsx`
- Create: `src/app/(mobile)/(protected)/arena/profile/loading.tsx`
- Create: `src/app/(mobile)/(protected)/arena/settings/loading.tsx`
- Create: `src/app/(mobile)/(protected)/arena/notifications/loading.tsx`
- Create: `src/app/(mobile)/(protected)/arena/payments/[id]/loading.tsx`
- Create: `src/app/(mobile)/(athlete)/event/[id]/loading.tsx`

**Interfaces:**
- Consumes: `DashboardSkeleton` de `src/app/(mobile)/(protected)/arena/_components/dashboard-skeleton.tsx` (já existe), chave i18n `common.loading` (já existe).
- Produces: componente `ArenaPageSkeleton` (sem props) reutilizável por qualquer `loading.tsx`.

Notas de semântica do App Router: um `loading.tsx` embrulha o `page.tsx` do seu segmento **e** os segmentos abaixo sem boundary próprio. `arena/loading.tsx` (DashboardSkeleton) cobre o dashboard; as rotas filhas principais recebem skeleton genérico próprio para não mostrarem o skeleton do dashboard. `rankings`, `historical` e `payments` são client pages síncronas — navegação já é instantânea, não precisam de `loading.tsx` (o `arena/loading.tsx` cobre o pior caso).

- [ ] **Step 1: Criar o skeleton genérico**

`src/components/arena/arena-page-skeleton.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";

/**
 * Generic structural placeholder for arena sub-pages while their server
 * component streams in. Renders inline inside <main> so the sidebar,
 * top bar and bottom nav (rendered by the arena layout) stay mounted.
 */
export function ArenaPageSkeleton() {
  const t = useTranslations("common");

  return (
    <div className="jb-page">
      <output className="sr-only">{t("loading")}</output>
      <div className="jb-page-inner" aria-hidden="true">
        <header className="jb-topbar">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-24 animate-pulse rounded-full bg-arena-surface-el" />
            <div className="h-6 w-40 animate-pulse rounded-lg bg-arena-surface-el" />
          </div>
          <div className="size-9 animate-pulse rounded-full bg-arena-surface-el" />
        </header>
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map(index => (
            <div
              key={`arena-skeleton-row-${index}`}
              className="jb-card h-20 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Criar `arena/loading.tsx` com o DashboardSkeleton existente**

`src/app/(mobile)/(protected)/arena/loading.tsx`:

```tsx
import { DashboardSkeleton } from "./_components/dashboard-skeleton";

export default function Loading() {
  return <DashboardSkeleton />;
}
```

- [ ] **Step 3: Criar os `loading.tsx` genéricos**

Conteúdo idêntico para **todos** estes ficheiros (`events/loading.tsx`, `events/[id]/loading.tsx`, `calendar/loading.tsx`, `squads/loading.tsx`, `squads/player/[id]/loading.tsx`, `profile/loading.tsx`, `settings/loading.tsx`, `notifications/loading.tsx`, `payments/[id]/loading.tsx` e `(athlete)/event/[id]/loading.tsx`):

```tsx
import { ArenaPageSkeleton } from "@/components/arena/arena-page-skeleton";

export default function Loading() {
  return <ArenaPageSkeleton />;
}
```

- [ ] **Step 4: Verificar tipos e lint**

Run: `pnpm ts-check && pnpm lint`
Expected: exit 0 (warnings pré-existentes OK, zero erros novos)

- [ ] **Step 5: Verificar no browser**

Run: arrancar dev server (launch.json / `pnpm dev`), navegar `/arena` → `/arena/events` → `/arena/profile` com DevTools Network throttling "Fast 4G".
Expected: skeleton aparece imediatamente ao clicar; sidebar/bottom-nav ficam montados; sem layout jump grosseiro quando o conteúdo real chega.

- [ ] **Step 6: Commit**

```bash
git add src/components/arena/arena-page-skeleton.tsx "src/app/(mobile)/(protected)/arena" "src/app/(mobile)/(athlete)/event"
git commit -m "feat(arena): add per-route loading skeletons for instant navigation feedback"
```

---

### Task 2: Indicador de pending nos links de navegação (`useLinkStatus`)

Feedback no próprio link enquanto a rota carrega — cobre o intervalo antes do skeleton aparecer e navegações rápidas.

**Files:**
- Modify: `src/components/arena/bottom-nav.tsx`
- Modify: `src/components/arena/sidebar.tsx:151-185`

**Interfaces:**
- Consumes: `useLinkStatus` de `next/link` (Next 16; só funciona em componente renderizado **dentro** de `<Link>`).
- Produces: nada consumido por outras tasks.

- [ ] **Step 1: Bottom nav — extrair conteúdo do Link para componente com `useLinkStatus`**

Em `src/components/arena/bottom-nav.tsx`, alterar o import de Link:

```tsx
import Link, { useLinkStatus } from "next/link";
```

Adicionar no fim do ficheiro:

```tsx
function BottomNavLinkContent({
  icon: Icon,
  isActive,
  label,
}: {
  icon: LucideIcon;
  isActive: boolean;
  label: string;
}) {
  const { pending } = useLinkStatus();

  return (
    <>
      <Icon
        size={19}
        strokeWidth={isActive ? 2 : 1.7}
        className={cn(
          isActive ? "text-arena-primary" : "text-arena-text-muted",
          pending && "animate-pulse text-arena-primary",
        )}
      />
      <span
        className={cn(
          "max-w-full truncate text-[9px]",
          isActive
            ? "font-bold text-arena-primary"
            : "font-medium text-arena-text-muted",
          pending && "text-arena-primary",
        )}
      >
        {label}
      </span>
    </>
  );
}
```

Precisa do type import: acrescentar `import type { LucideIcon } from "lucide-react";` (o `Lock` importado mantém-se).

Substituir o corpo do `<Link>` (o bloco `<Icon …/><span …>{t(item.labelKey)}</span>`) por:

```tsx
<Link
  key={item.href}
  href={item.href}
  className="press relative flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 no-underline"
>
  <BottomNavLinkContent
    icon={item.icon}
    isActive={isActive}
    label={t(item.labelKey)}
  />
</Link>
```

(A variável local `const Icon = item.icon;` continua a ser usada no ramo `isLocked`; manter.)

- [ ] **Step 2: Sidebar — mesmo padrão**

Em `src/components/arena/sidebar.tsx`, alterar import: `import Link, { useLinkStatus } from "next/link";`

Adicionar no fim do ficheiro:

```tsx
function SidebarNavLinkContent({
  icon: Icon,
  isActive,
  label,
  collapsed,
  showDot,
  badgeCount,
}: {
  icon: LucideIcon;
  isActive: boolean;
  label: string;
  collapsed: boolean;
  showDot: boolean;
  badgeCount: number;
}) {
  const { pending } = useLinkStatus();

  return (
    <>
      <div className="relative flex items-center justify-center">
        <Icon
          className={cn(
            "size-[18px] shrink-0",
            isActive ? "stroke-[2.5px]" : "stroke-[1.8px]",
            pending && "animate-pulse text-arena-primary",
          )}
        />
        {showDot && (
          <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-arena-primary shadow-[0_0_6px_rgba(124,255,79,0.5)] animate-pulse" />
        )}
      </div>
      <span
        className={cn(
          "font-semibold transition-opacity duration-200 flex flex-1 items-center justify-between",
          collapsed ? "opacity-0 w-0 pointer-events-none" : "opacity-100",
        )}
      >
        <span>{label}</span>
        {badgeCount > 0 && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-arena-primary px-1.5 text-[10px] font-black text-arena-bg shadow-[0_0_8px_rgba(124,255,79,0.3)] animate-pulse ml-2 shrink-0">
            {badgeCount}
          </span>
        )}
      </span>
    </>
  );
}
```

Substituir o conteúdo do ramo não-locked (linhas ~151–185, o `<Link …>…</Link>`) por:

```tsx
<Link
  href={item.href}
  className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center w-full"
>
  <SidebarNavLinkContent
    icon={Icon}
    isActive={isActive}
    label={t(item.labelKey)}
    collapsed={state === "collapsed"}
    showDot={
      item.href === "/arena/notifications" &&
      unreadCount > 0 &&
      state === "collapsed"
    }
    badgeCount={
      item.href === "/arena/notifications" ? unreadCount : 0
    }
  />
</Link>
```

(Confere que `LucideIcon` está importado como type no topo do sidebar — se não, acrescenta `import type { LucideIcon } from "lucide-react";`.)

- [ ] **Step 3: Verificar testes existentes de nav**

Run: `pnpm test`
Expected: PASS (386+ testes; `bottom-nav.test.ts` e `logout-navigation.test.ts` intactos — só testam lógica pura, não JSX)

- [ ] **Step 4: Verificar no browser**

Com throttling "Fast 4G": clicar num tab do bottom nav / item da sidebar.
Expected: ícone pulsa e ganha cor primary imediatamente; ao chegar a rota, estado active normal.

- [ ] **Step 5: Commit**

```bash
git add src/components/arena/bottom-nav.tsx src/components/arena/sidebar.tsx
git commit -m "feat(arena): show pending state on nav links via useLinkStatus"
```

---

### Task 3: Dedupe da sessão por request com React `cache()`

Hoje uma navegação SSR para `/arena/*` faz `auth.api.getSession` 3× ((protected) layout → arena layout → página). `cache()` deduplica dentro do mesmo request RSC.

**Files:**
- Create: `src/lib/get-session.ts`
- Modify: `src/app/(mobile)/(protected)/layout.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/layout.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/page.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/squads/page.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/profile/page.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/profile/self-assessment/page.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/settings/page.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/notifications/page.tsx`
- Modify: `src/app/(mobile)/(protected)/arena/events/[id]/page.tsx`
- Modify: `src/app/(mobile)/(protected)/onboarding/layout.tsx`
- Modify: `src/app/(mobile)/(protected)/onboarding/page.tsx`
- Modify: `src/app/(mobile)/(athlete)/event/[id]/page.tsx`

**Interfaces:**
- Consumes: `auth` de `@/lib/auth`, `headers` de `next/headers`.
- Produces: `getCachedSession(): Promise<Awaited<ReturnType<typeof auth.api.getSession>>>` — mesmo retorno de `auth.api.getSession`, memoizado por request.

- [ ] **Step 1: Criar o helper**

`src/lib/get-session.ts`:

```ts
import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";

/**
 * Per-request memoized session lookup. Layouts and pages in the same RSC
 * render tree all call this; only the first call hits the auth backend.
 */
export const getCachedSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
```

- [ ] **Step 2: Substituir todos os callers**

Padrão A (maioria dos ficheiros — `arena/layout.tsx`, `arena/page.tsx`, `squads/page.tsx`, `profile/page.tsx`, `self-assessment/page.tsx`, `settings/page.tsx`, `notifications/page.tsx`, `events/[id]/page.tsx`, `onboarding/layout.tsx`, `onboarding/page.tsx`, `(athlete)/event/[id]/page.tsx`):

```ts
// remove:
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
const session = await auth.api.getSession({ headers: await headers() });

// add:
import { getCachedSession } from "@/lib/get-session";
const session = await getCachedSession();
```

Atenção: só remover os imports `headers`/`auth` se o ficheiro não os usar para mais nada (o `(protected)/layout.tsx` usa `headers` só para a sessão; o `(mobile)/layout.tsx` usa `headers` para user-agent — esse **não** é tocado nesta task).

Padrão B (`(protected)/layout.tsx`, que usa `headerStore`):

```ts
// remove:
const headerStore = await headers();
const session = await auth.api.getSession({ headers: headerStore });

// add:
const session = await getCachedSession();
```

- [ ] **Step 3: Confirmar que não sobrou nenhum caller direto na árvore app**

Run: `grep -rn "auth.api.getSession" src/app`
Expected: sem resultados

- [ ] **Step 4: Verificar**

Run: `pnpm ts-check && pnpm lint && pnpm test && pnpm build`
Expected: tudo exit 0

- [ ] **Step 5: Commit**

```bash
git add src/lib/get-session.ts src/app
git commit -m "perf(auth): dedupe session lookup per request with React cache"
```

---

### Task 4: Paralelizar queries do arena layout

`teamMembers` e `passkey` são independentes; hoje correm em série em cada SSR do layout.

**Files:**
- Modify: `src/app/(mobile)/(protected)/arena/layout.tsx:35-51`

**Interfaces:**
- Consumes: `getCachedSession` da Task 3 (já aplicado neste ficheiro), `db` de `@/db/client`.
- Produces: nada consumido por outras tasks.

- [ ] **Step 1: Substituir os dois blocos sequenciais**

Substituir (após Task 3 o ficheiro já usa `getCachedSession`):

```ts
let hasTeam = Boolean(sessionData?.teamId);

if (!hasTeam && user?.id) {
  const membership = await db.query.teamMembers.findFirst({
    where: eq(schema.teamMembers.playerId, user.id),
  });
  if (membership) {
    hasTeam = true;
  }
}

let hasPasskey = false;
if (user?.id) {
  const passkeyRecord = await db.query.passkey.findFirst({
    where: eq(schema.passkey.userId, user.id),
  });
  hasPasskey = Boolean(passkeyRecord);
}
```

por:

```ts
let hasTeam = Boolean(sessionData?.teamId);

const [membership, passkeyRecord] = await Promise.all([
  hasTeam
    ? Promise.resolve(null)
    : db.query.teamMembers.findFirst({
        where: eq(schema.teamMembers.playerId, user.id),
      }),
  db.query.passkey.findFirst({
    where: eq(schema.passkey.userId, user.id),
  }),
]);

if (membership) {
  hasTeam = true;
}
const hasPasskey = Boolean(passkeyRecord);
```

(O guard `if (!user) redirect("/auth")` acima garante `user.id` definido — os checks `user?.id` deixam de ser precisos.)

- [ ] **Step 2: Verificar**

Run: `pnpm ts-check && pnpm lint`
Expected: exit 0

- [ ] **Step 3: Commit**

```bash
git add "src/app/(mobile)/(protected)/arena/layout.tsx"
git commit -m "perf(arena): run layout team/passkey queries in parallel"
```

---

### Task 5: Cache Notion stale-while-revalidate (gate de tester nunca bloqueia)

Quando o cache de 5 min expira, `isTesterEmail` bloqueia a navegação à espera da API Notion. Passar a servir o valor stale imediatamente e refrescar em background. Lógica extraída para factory testável.

**Files:**
- Modify: `src/lib/notion.ts:30-66`
- Test: `src/lib/notion.test.ts`

**Interfaces:**
- Consumes: nada de outras tasks.
- Produces: `createTesterChecker(fetchTesterEmails: () => Promise<Set<string>>, ttlMs?: number): (email: string) => Promise<boolean>`; `isTesterEmail(email: string): Promise<boolean>` mantém a assinatura pública atual.

- [ ] **Step 1: Escrever os testes (falham primeiro)**

`src/lib/notion.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createTesterChecker } from "./notion";

describe("createTesterChecker", () => {
  it("resolves tester emails case- and whitespace-insensitively", async () => {
    const fetcher = vi.fn(async () => new Set(["a@b.com"]));
    const isTester = createTesterChecker(fetcher);

    await expect(isTester(" A@B.com ")).resolves.toBe(true);
    await expect(isTester("other@b.com")).resolves.toBe(false);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("dedupes concurrent cold fetches", async () => {
    const fetcher = vi.fn(async () => new Set(["a@b.com"]));
    const isTester = createTesterChecker(fetcher);

    await Promise.all([isTester("a@b.com"), isTester("a@b.com")]);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("serves stale value without blocking after ttl expiry", async () => {
    vi.useFakeTimers();
    try {
      let call = 0;
      const fetcher = vi.fn(async () => {
        call += 1;
        return call === 1 ? new Set(["old@x.com"]) : new Set(["new@x.com"]);
      });
      const isTester = createTesterChecker(fetcher, 1000);

      await isTester("old@x.com");
      vi.advanceTimersByTime(2000);

      // stale answer returns immediately, refresh kicks off in background
      await expect(isTester("old@x.com")).resolves.toBe(true);
      expect(fetcher).toHaveBeenCalledTimes(2);

      await vi.runAllTimersAsync();
      await expect(isTester("new@x.com")).resolves.toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });
});
```

- [ ] **Step 2: Correr e ver falhar**

Run: `pnpm vitest run src/lib/notion.test.ts`
Expected: FAIL — `createTesterChecker` is not exported

- [ ] **Step 3: Implementar**

Em `src/lib/notion.ts`, substituir o bloco do cache (`let testerCache …` até ao fim de `isTesterEmail`) por:

```ts
export function createTesterChecker(
  fetchTesterEmails: () => Promise<Set<string>>,
  ttlMs = 5 * 60 * 1000,
) {
  let cache: { emails: Set<string>; expiresAt: number } | null = null;
  let refreshing: Promise<void> | null = null;

  function refresh(): Promise<void> {
    if (!refreshing) {
      refreshing = fetchTesterEmails()
        .then(emails => {
          cache = { emails, expiresAt: Date.now() + ttlMs };
        })
        .finally(() => {
          refreshing = null;
        });
    }
    return refreshing;
  }

  return async function isTester(email: string): Promise<boolean> {
    const normalized = email.toLowerCase().trim();

    if (!cache) {
      try {
        await refresh();
      } catch (err) {
        console.error("[notion] failed to fetch testers:", err);
        return process.env.NODE_ENV !== "production";
      }
    } else if (Date.now() > cache.expiresAt) {
      // stale-while-revalidate: answer from stale cache, refresh in background
      refresh().catch(err => {
        console.error("[notion] background tester refresh failed:", err);
      });
    }

    return cache?.emails.has(normalized) ?? false;
  };
}

async function fetchTesterEmails(): Promise<Set<string>> {
  const notion = getNotionClient();
  const dataSourceId = getWaitlistDataSourceId();
  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      or: TESTER_TYPES.map(type => ({
        property: "Type",
        select: { equals: type },
      })),
    },
  });
  const emails = new Set<string>();
  for (const page of response.results) {
    if (!isFullPage(page)) continue;

    const emailProperty = page.properties.Email;
    if (emailProperty?.type === "email" && emailProperty.email) {
      emails.add(emailProperty.email.toLowerCase().trim());
    }
  }
  return emails;
}

export const isTesterEmail = createTesterChecker(fetchTesterEmails);
```

(`addToWaitlist` e os helpers `getNotionClient`/`getWaitlistDataSourceId` ficam como estão. O fallback de erro `NODE_ENV !== "production"` preserva o comportamento atual em cold-cache.)

- [ ] **Step 4: Correr testes**

Run: `pnpm vitest run src/lib/notion.test.ts`
Expected: PASS (3 testes)

- [ ] **Step 5: Suite completa + tipos**

Run: `pnpm test && pnpm ts-check`
Expected: exit 0

- [ ] **Step 6: Commit**

```bash
git add src/lib/notion.ts src/lib/notion.test.ts
git commit -m "perf(notion): serve stale tester cache while revalidating in background"
```

---

### Task 6: Fade entre ecrãs no segmento arena

DESIGN.md pede "fade entre ecrãs". `template.tsx` remonta a cada navegação dentro do segmento — ideal para animação de entrada.

**Files:**
- Create: `src/app/(mobile)/(protected)/arena/template.tsx`
- Modify: `src/styles/globals.css` (append no fim do ficheiro; keyframes `fadeIn` já existem na linha ~658)

**Interfaces:**
- Consumes: keyframes `fadeIn` já definidos em `src/styles/globals.css`.
- Produces: classe utilitária `.jb-screen-fade`.

- [ ] **Step 1: Criar o template**

`src/app/(mobile)/(protected)/arena/template.tsx`:

```tsx
export default function ArenaTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="jb-screen-fade w-full">{children}</div>;
}
```

- [ ] **Step 2: Adicionar a classe ao globals.css (append no fim)**

```css
/* Screen-to-screen fade for arena route changes (template.tsx) */
.jb-screen-fade {
  animation: fadeIn 0.18s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .jb-screen-fade {
    animation: none;
  }
}
```

- [ ] **Step 3: Verificar no browser**

Navegar entre tabs da arena.
Expected: novo ecrã entra com fade curto (~180 ms); skeletons da Task 1 também fazem fade; sidebar/bottom-nav não piscam. Confirmar que estado de página não é perdido de forma inesperada (template remonta children a cada navegação — comportamento pretendido para tabs; se alguma rota interna sofrer com o remount, mover o template para mais fundo em vez de o remover).

- [ ] **Step 4: Verificação final completa**

Run: `pnpm lint && pnpm ts-check && pnpm test && pnpm build`
Expected: tudo exit 0

- [ ] **Step 5: Commit**

```bash
git add "src/app/(mobile)/(protected)/arena/template.tsx" src/styles/globals.css
git commit -m "feat(arena): fade screen transitions via route template"
```
