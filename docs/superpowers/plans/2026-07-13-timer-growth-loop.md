# Timer Growth Loop (P0 + quick wins) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ligar o loop viral do Cronómetro — OG dinâmico na partilha, CTA de conversão na página de resultado, instrumentação Statsig do funil completo, assinatura de marca, QR local e manifest PWA.

**Architecture:** Todas as alterações são locais ao módulo timer (`src/components/timer` + `src/app/(public)/timer`) exceto o manifest (app-wide, 2 linhas no root layout). Lógica nova de texto/OG vive como funções puras em `share.ts` (testáveis em vitest node); páginas e componentes apenas as consomem. Eventos Statsig usam o padrão existente do repo (`useStatsigClient().logEvent`), disponível em todas as rotas via `AnalyticsProvider` no root `Providers`.

**Tech Stack:** Next.js 16 App Router · React 19 · Statsig (`@statsig/react-bindings`) · next-intl · vitest · react-qr-code (já instalado, `package.json:89`)

## Global Constraints

- UI em PT-PT; identificadores e comentários em inglês.
- Texto novo visível ao utilizador via next-intl com chave em **todos** os locales: `pt.json`, `en.json`, `es.json`, `fr.json` (regra do repo). Exceção documentada: o módulo timer existente está hardcoded em PT — strings existentes ficam como estão (i18n completo do módulo é plano futuro separado).
- Tailwind com tokens Arena (`bg-arena-*`, `text-arena-*`); zero hex hardcoded em JSX exceto valores runtime.
- Conventional commits.
- Verificação por task: `pnpm test`, `pnpm ts-check`, `pnpm lint` — todos exit 0.
- Nomes de eventos Statsig (exatos, snake_case, prefixo `timer_`): `timer_match_created`, `timer_match_ended`, `timer_result_shared`, `timer_result_viewed`, `timer_cta_clicked`.
- **Fora de âmbito** (planos futuros separados — NÃO implementar aqui): guardar jogo na equipa autenticada; botão "Gerir jogo ao vivo" na convocatória Arena; i18n completo do módulo timer + landing SEO; novos modos de jogo.

## Pré-verificação (executor: correr antes da Task 1)

```bash
git status --short          # esperado: limpo (stash/commit se não)
grep -c "logEvent" src/components/timer/*.tsx   # esperado: 0 (nada instrumentado ainda)
grep NEXT_PUBLIC_STATSIG_CLIENT_KEY .env        # esperado: 1 linha com valor
```

Se `NEXT_PUBLIC_STATSIG_CLIENT_KEY` estiver vazio/ausente: continuar (o provider tolera `""`), mas reportar no final que os eventos não serão enviados até a key existir.

Branch: `git checkout -b feat/timer-growth-loop`

---

### Task 1: Funções puras de partilha — título OG, descrição e assinatura de marca

**Files:**
- Modify: `src/components/timer/share.ts` (funções `resultText` linha 85; adicionar `resultOgTitle`, `resultOgDescription` no fim do ficheiro)
- Test (create): `src/components/timer/share.test.ts`

**Interfaces:**
- Consumes: `SharedResult`, `buildSharedResult(match)`, `decodeResult(data)` — já existentes em `share.ts`; `createMatch(type, teamA, teamB, config): Match` de `./use-match-store`.
- Produces: `resultOgTitle(r: SharedResult): string` e `resultOgDescription(r: SharedResult): string` — consumidas pela Task 2. `resultText(match: Match): string` passa a terminar com a linha `via jogabola.app/timer` — visível na Task 4 (partilha).

- [ ] **Step 1: Escrever os testes (falham)**

Criar `src/components/timer/share.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  buildSharedResult,
  decodeResult,
  encodeResult,
  resultOgDescription,
  resultOgTitle,
  resultText,
} from "./share";
import type { Match } from "./types";
import { createMatch } from "./use-match-store";

function fixture(): Match {
  const m = createMatch(
    "jogo",
    { name: "Leões", color: "#7CFF4F", players: [{ id: "p1", name: "Rui" }] },
    { name: "Águias", color: "#38BDF8", players: [{ id: "p2", name: "Zé" }] },
    { mode: "up", periodLenSec: 1200, periods: 2, sound: false },
  );
  m.events.push(
    { id: "e1", atSec: 300, period: 1, type: "goal", team: "A", playerId: "p1" },
    { id: "e2", atSec: 900, period: 1, type: "goal", team: "B", playerId: "p2" },
    { id: "e3", atSec: 1500, period: 2, type: "goal", team: "A", playerId: "p1" },
  );
  return m;
}

describe("share round-trip", () => {
  it("encodes and decodes a result", () => {
    const r = decodeResult(encodeResult(fixture()));
    expect(r).not.toBeNull();
    expect(r?.sa).toBe(2);
    expect(r?.sb).toBe(1);
  });
});

describe("resultOgTitle", () => {
  it("formats score line with brand", () => {
    const r = buildSharedResult(fixture());
    expect(resultOgTitle(r)).toBe("Leões 2–1 Águias · JogaBola");
  });
});

describe("resultOgDescription", () => {
  it("summarizes goals and brands the tool", () => {
    const r = buildSharedResult(fixture());
    expect(resultOgDescription(r)).toBe(
      "3 golos · Resultado registado ao vivo com o Cronómetro JogaBola — sem login.",
    );
  });

  it("handles zero goals", () => {
    const m = fixture();
    m.events.length = 0;
    const r = buildSharedResult(m);
    expect(resultOgDescription(r)).toBe(
      "Resultado registado ao vivo com o Cronómetro JogaBola — sem login.",
    );
  });
});

describe("resultText signature", () => {
  it("ends with brand attribution line", () => {
    const lines = resultText(fixture()).split("\n");
    expect(lines.at(-1)).toBe("via jogabola.app/timer");
  });
});
```

- [ ] **Step 2: Correr — verificar que falham**

Run: `pnpm test -- share`
Expected: FAIL — `resultOgTitle` / `resultOgDescription` não exportados; assinatura em falta.

- [ ] **Step 3: Implementar em `share.ts`**

Alterar `resultText` (linha 85) — acrescentar a assinatura antes do `join`:

```ts
export function resultText(match: Match): string {
  const r = buildSharedResult(match);
  const lines = [`${r.a.n} ${r.sa} - ${r.sb} ${r.b.n}`];
  for (const [side, min, name] of r.g) {
    const team = side === "A" ? r.a.n : r.b.n;
    lines.push(`⚽ ${formatMinute(min * 60)} ${name} (${team})`);
  }
  lines.push("via jogabola.app/timer");
  return lines.join("\n");
}
```

Acrescentar no fim do ficheiro:

```ts
export function resultOgTitle(r: SharedResult): string {
  return `${r.a.n} ${r.sa}–${r.sb} ${r.b.n} · JogaBola`;
}

export function resultOgDescription(r: SharedResult): string {
  const base = "Resultado registado ao vivo com o Cronómetro JogaBola — sem login.";
  if (r.g.length === 0) return base;
  const plural = r.g.length === 1 ? "golo" : "golos";
  return `${r.g.length} ${plural} · ${base}`;
}
```

- [ ] **Step 4: Correr — verificar que passam**

Run: `pnpm test -- share`
Expected: PASS (5 testes). Depois `pnpm ts-check` e `pnpm lint` — exit 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/timer/share.ts src/components/timer/share.test.ts
git commit -m "feat(timer): add OG title/description helpers and brand attribution in share text"
```

---

### Task 2: Open Graph dinâmico em `/timer/resultado`

**Files:**
- Modify: `src/app/(public)/timer/resultado/page.tsx` (ficheiro completo tem 10 linhas — substituir)

**Interfaces:**
- Consumes: `decodeResult`, `resultOgTitle`, `resultOgDescription` da Task 1 (`@/components/timer/share`).
- Produces: `generateMetadata` — nada a jusante depende disto.

- [ ] **Step 1: Substituir o conteúdo de `page.tsx`**

```tsx
import type { Metadata } from "next";
import { ResultView } from "@/components/timer/result-view";
import {
  decodeResult,
  resultOgDescription,
  resultOgTitle,
} from "@/components/timer/share";

type Props = { searchParams: Promise<{ d?: string }> };

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { d } = await searchParams;
  const r = d ? decodeResult(d) : null;
  if (!r) return { title: "Resultado · JogaBola" };
  const title = resultOgTitle(r);
  const description = resultOgDescription(r);
  return {
    title,
    description,
    openGraph: { title, description, siteName: "JogaBola", type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ResultadoPage({ searchParams }: Props) {
  const { d } = await searchParams;
  return <ResultView data={d ?? null} />;
}
```

- [ ] **Step 2: Verificar no dev server**

Servidor dev já corre em `localhost:3000` (senão: `pnpm dev`). Fixture pré-codificada (Leões 2–1 Águias):

```bash
curl -s "http://localhost:3000/timer/resultado?d=eyJ0Ijoiam9nbyIsImEiOnsibiI6Ikxlw7VlcyIsImMiOiIjN0NGRjRGIn0sImIiOnsibiI6IsOBZ3VpYXMiLCJjIjoiIzM4QkRGOCJ9LCJzYSI6Miwic2IiOjEsImciOltbIkEiLDUsIlJ1aSJdLFsiQiIsMTUsIlrDqSJdLFsiQSIsMjUsIlJ1aSJdXSwiayI6W119" | grep -oE '<meta property="og:(title|description)"[^>]*>'
```

Expected: `og:title` com `Leões 2–1 Águias · JogaBola` e `og:description` com `3 golos · Resultado registado ao vivo…`.

```bash
curl -s "http://localhost:3000/timer/resultado" | grep -o "<title>[^<]*"
```

Expected: `<title>Resultado · JogaBola` (fallback sem `d`).

- [ ] **Step 3: Checks e commit**

Run: `pnpm ts-check && pnpm lint`
Expected: exit 0.

```bash
git add "src/app/(public)/timer/resultado/page.tsx"
git commit -m "feat(timer): dynamic Open Graph metadata on shared result page"
```

---

### Task 3: CTA de conversão na página de resultado (com i18n)

**Files:**
- Modify: `src/locales/pt.json`, `src/locales/en.json`, `src/locales/es.json`, `src/locales/fr.json` (novo namespace top-level `timerShared`, inserir por ordem alfabética de chaves top-level)
- Modify: `src/components/timer/result-view.tsx` (imports + bloco final, linhas 135–140)

**Interfaces:**
- Consumes: namespace next-intl `timerShared` (criado neste task); rota `/auth` (existe em `src/app/(mobile)/auth`).
- Produces: elemento com `data-testid="timer-result-cta"` — instrumentado na Task 4.

- [ ] **Step 1: Adicionar chaves aos 4 locales**

`pt.json`:
```json
"timerShared": {
  "cta": "Organiza a tua equipa no JogaBola",
  "ctaHint": "Convocatórias, estatísticas e rankings — grátis."
}
```
`en.json`:
```json
"timerShared": {
  "cta": "Run your team on JogaBola",
  "ctaHint": "Call-ups, stats and rankings — free."
}
```
`es.json`:
```json
"timerShared": {
  "cta": "Organiza tu equipo en JogaBola",
  "ctaHint": "Convocatorias, estadísticas y rankings — gratis."
}
```
`fr.json`:
```json
"timerShared": {
  "cta": "Gère ton équipe sur JogaBola",
  "ctaHint": "Convocations, statistiques et classements — gratuit."
}
```

Validar JSON: `for f in src/locales/*.json; do python3 -m json.tool "$f" > /dev/null && echo "$f OK"; done` — 4× OK.

- [ ] **Step 2: Alterar `result-view.tsx`**

Adicionar import no topo (junto aos existentes):

```tsx
import { useTranslations } from "next-intl";
```

Dentro de `ResultView`, primeira linha do corpo (antes de `const r = ...`):

```tsx
const t = useTranslations("timerShared");
```

Substituir o bloco final (linhas 135–140, o `<Link href="/timer">Criar o meu jogo</Link>`):

```tsx
      <Link
        data-testid="timer-result-cta"
        href="/auth?utm_source=timer&utm_medium=share&utm_campaign=resultado"
        className="mt-2 flex flex-col items-center rounded-[14px] bg-arena-primary px-4 py-3.5 text-center"
      >
        <span className="font-extrabold text-arena-bg">{t("cta")}</span>
        <span className="text-xs font-semibold text-arena-bg/70">
          {t("ctaHint")}
        </span>
      </Link>
      <Link
        href="/timer"
        className="flex items-center justify-center rounded-[14px] border border-arena-border py-3 text-sm font-bold text-arena-text-sec"
      >
        Criar o meu jogo
      </Link>
```

Nota: CTA primário = conversão (recetor da partilha); "Criar o meu jogo" passa a secundário. Não adicionar CTA ao estado de resultado inválido (linhas 13–27) — mantém-se como está.

- [ ] **Step 3: Verificar no browser**

Abrir a fixture da Task 2 Step 2 no browser. Verificar: CTA verde primário com os dois textos PT, link para `/auth?utm_source=timer…`; botão secundário "Criar o meu jogo" abaixo com borda.

- [ ] **Step 4: Checks e commit**

Run: `pnpm test && pnpm ts-check && pnpm lint`
Expected: exit 0.

```bash
git add src/locales/pt.json src/locales/en.json src/locales/es.json src/locales/fr.json src/components/timer/result-view.tsx
git commit -m "feat(timer): conversion CTA on shared result page with utm attribution"
```

---

### Task 4: Instrumentação Statsig do funil

**Files:**
- Modify: `src/components/timer/hub-view.tsx` (função `handleCreate`, linha 99)
- Modify: `src/components/timer/match-view.tsx` (prop `onEnd`, linha 114)
- Modify: `src/components/timer/summary-modal.tsx` (funções `copy` e `share`, linhas 37–60)
- Modify: `src/components/timer/result-view.tsx` (mount + clique no CTA da Task 3)

**Interfaces:**
- Consumes: `useStatsigClient` de `@statsig/react-bindings` (padrão do repo — ver `src/app/(mobile)/auth/page.tsx:67`); todos os 4 ficheiros já são `"use client"`.
- Produces: eventos `timer_match_created {type}`, `timer_match_ended {type}`, `timer_result_shared {method}`, `timer_result_viewed`, `timer_cta_clicked`. Sem consumidores no código — destino é o dashboard Statsig.

- [ ] **Step 1: `hub-view.tsx` — jogo criado**

Import no topo: `import { useStatsigClient } from "@statsig/react-bindings";`

Dentro de `HubView` (linha ~91, junto a `const router = useRouter();`):
```tsx
const { logEvent } = useStatsigClient();
```

Em `handleCreate`, imediatamente após `const match = createMatch(type, teamA, teamB, config);`:
```tsx
logEvent("timer_match_created", undefined, { type });
```

- [ ] **Step 2: `match-view.tsx` — jogo terminado**

Import no topo: `import { useStatsigClient } from "@statsig/react-bindings";`

Dentro do componente: `const { logEvent } = useStatsigClient();`

Linha 114, substituir `onEnd={actions.endMatch}` por:
```tsx
onEnd={() => {
  logEvent("timer_match_ended", undefined, { type: match.type });
  actions.endMatch();
}}
```

Nota: `onEnd` dispara depois da confirmação existente em `MatchControls` — não adicionar nova confirmação.

- [ ] **Step 3: `summary-modal.tsx` — partilha**

Import + `const { logEvent } = useStatsigClient();` como acima.

Na função `copy()`, após o `writeText` bem-sucedido (dentro do `try`, antes do `setCopied(true)`):
```tsx
logEvent("timer_result_shared", undefined, { method: "copy" });
```

Na função `share()`, após o `await navigator.share({...})` bem-sucedido (antes do `return`):
```tsx
logEvent("timer_result_shared", undefined, { method: "web_share" });
```
(O fallback `copy()` no fim de `share()` já regista `method: "copy"` — não duplicar.)

- [ ] **Step 4: `result-view.tsx` — visita e clique no CTA**

Imports: `import { useEffect } from "react";` e `import { useStatsigClient } from "@statsig/react-bindings";`

Dentro de `ResultView`, após `const t = useTranslations(...)`:
```tsx
const { logEvent } = useStatsigClient();

useEffect(() => {
  if (data) logEvent("timer_result_viewed");
}, [data, logEvent]);
```

No `<Link data-testid="timer-result-cta" ...>` da Task 3, adicionar:
```tsx
onClick={() => logEvent("timer_cta_clicked")}
```

- [ ] **Step 5: Verificar**

Run: `pnpm test && pnpm ts-check && pnpm lint` — exit 0.

No browser (dev server): criar um jogo em `/timer`, terminar, partilhar por "Copiar resultado", abrir o link de resultado. Na consola de network do browser, confirmar pedidos a `statsigapi.net` (ou `featureassets.org`) com os event names — se a env key estiver vazia, saltar esta confirmação e reportar.

- [ ] **Step 6: Commit**

```bash
git add src/components/timer/hub-view.tsx src/components/timer/match-view.tsx src/components/timer/summary-modal.tsx src/components/timer/result-view.tsx
git commit -m "feat(timer): instrument acquisition funnel with statsig events"
```

---

### Task 5: QR local com react-qr-code

**Files:**
- Modify: `src/components/timer/summary-modal.tsx` (memo `qrSrc` linhas 33–35; bloco `<img>` linhas 139–148)

**Interfaces:**
- Consumes: `react-qr-code` (default export `QRCode`; já em `package.json:89`); `shareUrl` existente no componente.
- Produces: nada a jusante.

- [ ] **Step 1: Substituir gerador externo**

Import no topo: `import QRCode from "react-qr-code";`

Apagar o memo `qrSrc` (linhas 33–35).

Substituir o bloco do QR (linhas 139–148, incluindo o comentário `biome-ignore`):

```tsx
          {shareUrl && (
            <div className="rounded-lg bg-arena-surface-el p-1.5">
              <QRCode
                value={shareUrl}
                size={76}
                bgColor="transparent"
                fgColor="#7CFF4F"
              />
            </div>
          )}
```

Nota: `fgColor` é prop runtime da lib (SVG interno), não classe — hex permitido pela regra Arena.

- [ ] **Step 2: Verificar no browser**

Terminar um jogo → resumo → QR renderiza offline (sem pedido a `api.qrserver.com` no network panel). Ler o QR com telemóvel: abre `/timer/resultado?d=…`.

- [ ] **Step 3: Checks e commit**

Run: `pnpm test && pnpm ts-check && pnpm lint` — exit 0.

```bash
git add src/components/timer/summary-modal.tsx
git commit -m "feat(timer): generate share QR locally, drop external service"
```

---

### Task 6: Manifest PWA

**Files:**
- Create: `public/manifest.webmanifest`
- Modify: `src/app/layout.tsx` (objeto `metadata`, linha 14)

**Interfaces:**
- Consumes: `/favicon.png` (existe em `public/`); service worker já registado (`src/app/layout.tsx:42`).
- Produces: nada a jusante.

- [ ] **Step 1: Criar `public/manifest.webmanifest`**

```json
{
  "name": "JogaBola",
  "short_name": "JogaBola",
  "description": "Gestão de equipas de futebol amador — convocatórias, estatísticas e cronómetro de jogos.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0B0F14",
  "theme_color": "#0B0F14",
  "icons": [
    { "src": "/favicon.png", "sizes": "any", "type": "image/png", "purpose": "any" }
  ]
}
```

- [ ] **Step 2: Ligar no root layout**

Em `src/app/layout.tsx`, no objeto `metadata` (linha 14), adicionar a propriedade:

```ts
  manifest: "/manifest.webmanifest",
```

- [ ] **Step 3: Verificar**

```bash
curl -s http://localhost:3000/manifest.webmanifest | python3 -m json.tool > /dev/null && echo OK
curl -s http://localhost:3000/timer | grep -c 'rel="manifest"'
```

Expected: `OK` e `1`.

No browser: DevTools → Application → Manifest sem erros (aviso de icon `sizes: any` é aceitável; icons dedicados 192/512 ficam para o plano de SEO/PWA).

- [ ] **Step 4: Checks e commit**

Run: `pnpm test && pnpm ts-check && pnpm lint && pnpm build`
Expected: exit 0 (build completo — última task, verificação larga).

```bash
git add public/manifest.webmanifest src/app/layout.tsx
git commit -m "feat(pwa): add web app manifest"
```

---

## Verificação final do plano

- [ ] `pnpm test && pnpm ts-check && pnpm lint && pnpm build` — tudo exit 0
- [ ] Fluxo manual completo no dev server: criar jogo → golo → terminar → partilhar → abrir link de resultado → ver OG no `curl` → clicar CTA → chega a `/auth` com utm
- [ ] `git log --oneline` mostra 6 commits convencionais no branch `feat/timer-growth-loop`
- [ ] Reportar: estado da `NEXT_PUBLIC_STATSIG_CLIENT_KEY` (eventos ativos ou pendentes de key)

## Planos futuros (fora deste âmbito — criar quando este landar)

1. **Ponte para o produto**: guardar jogo na equipa (server action + mapeamento jogadores→plantel) e botão "Gerir jogo ao vivo" na convocatória Arena. Precisa de brainstorm de schema.
2. **i18n completo do módulo timer + landing SEO** (`/timer` com conteúdo, ícones PWA 192/512).
3. **Novos modos** (futsal 2×20 com faltas, penáltis) — só depois de 4+ semanas de dados dos eventos da Task 4.
