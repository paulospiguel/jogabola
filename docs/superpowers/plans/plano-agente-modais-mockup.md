# Plano de Implementação — Para o Agente Executar

> **Para:** Claude Code / Cursor agent no repo JogaBola, branch `releases/jogabola-teams/release02`.
> **Objetivo:** (A) remover o mockup de iPhone e (B) tornar os modais/sheets corretos em desktop.
> **Regra de ouro:** mobile-first. Não introduzir layout desktop novo — apenas conter larguras. Não tocar em lógica, apenas em apresentação e em código morto.
> **Stack:** Next.js 16, React 19, Tailwind 4. Não adicionar dependências.

## Pré-condições

1. Estás na raiz do repo, branch `releases/jogabola-teams/release02`, working tree limpo (`git status` sem alterações pendentes). Se houver, pára e avisa.
2. Cria um branch de trabalho: `git checkout -b fix/desktop-modals-remove-mockup`.
3. Cada tarefa abaixo é um commit separado. Não juntes tudo num commit.

---

## Tarefa 1 — Remover o mockup de iPhone

Contexto: no desktop, a app era envolvida numa moldura de iPhone (`IPhoneMockup`). Decisão tomada: remover. O layout da arena (`src/app/(mobile)/(protected)/arena/layout.tsx`) já é responsivo (tem `ArenaSidebar` em desktop e `BottomNav`/`MobileTopBar` em mobile). A moldura estava a sufocar esse layout. O `MobileWrapper` passa a ser um passthrough neutro.

### 1.1 — `src/components/arena/mobile-wrapper.tsx`
Substituir o ficheiro inteiro por:
```tsx
interface MobileWrapperProps {
  children: React.ReactNode;
}

/**
 * Passthrough do shell da app (arena).
 *
 * A moldura de iPhone (IPhoneMockup) foi removida por não ser eficiente:
 * o layout da arena já é responsivo (sidebar em desktop, top-bar + bottom-nav
 * em mobile). A moldura estava a forçar esse layout para dentro de um telemóvel.
 */
export function MobileWrapper({ children }: MobileWrapperProps) {
  return <>{children}</>;
}
```
Verificação: o ficheiro deixa de importar `IPhoneMockup`, `CONFIG` e `useDevice`.

### 1.2 — Apagar o componente do mockup
```
git rm src/components/arena/iphone-mockup.tsx
```
Antes de apagar, confirma que NENHUM outro ficheiro o importa:
```
grep -rn "IPhoneMockup\|iphone-mockup" src --include=*.tsx --include=*.ts
```
Só deve aparecer (no máximo) o comentário em `mobile-wrapper.tsx`. Se aparecer um import real noutro sítio, pára e avisa.

### 1.3 — Remover a config morta em `src/constants/app.ts`
Apagar a linha dentro do objeto `CONFIG`:
```ts
  SHOW_MOBILE_ONLY: process.env.NEXT_PUBLIC_SHOW_MOBILE_ONLY as string,
```
Deixar o resto do `CONFIG` intacto.

### 1.4 — Remover CSS morto em `src/styles/globals.css`
Remover o bloco completo das classes do mockup. Começa no comentário:
```
/* ─── iPhone Mockup ─────────────────────────────────────────────────────────── */
```
(aprox. linha 706) e vai até ao fecho da última media query `@media (min-width: 768px) and (max-width: 500px) { .iphone-frame { ... } }` (aprox. linha 939). **Não remover por número de linha fixo** — localiza o comentário de início e a última regra `.iphone-*`, remove tudo entre eles inclusive. Confirma depois que `grep -n "iphone" src/styles/globals.css` não devolve nada.

### 1.5 — Verificação da Tarefa 1
```
grep -rn "IPhoneMockup\|iphone-mockup\|SHOW_MOBILE_ONLY\|\.iphone-" src
```
Esperado: zero resultados (ou só o comentário em `mobile-wrapper.tsx`). `useDevice` e `DeviceProvider` continuam a existir — são usados pelo `bottom-nav`. Não os removas.

Commit: `refactor(arena): remove iPhone mockup, MobileWrapper vira passthrough`

---

## Tarefa 2 — Corrigir o BottomSheet em desktop

Contexto: `src/components/arena/bottom-sheet.tsx` é a base de ~12 sheets. A barra interior não tinha largura máxima nem centragem: em desktop estica de borda a borda e cola ao fundo. Conter num só sítio corrige todos os sheets.

### 2.1 — Overlay (o `div` com `role="dialog"`)
Localiza a className que contém `fixed inset-0 z-[9999] flex flex-col justify-end`.

DE:
```
fixed inset-0 z-[9999] flex flex-col justify-end bg-[#04070A]/75 backdrop-blur-sm animate-[fadeIn_.15s_ease]
```
PARA (acrescentar os 3 utilitários `sm:` no fim):
```
fixed inset-0 z-[9999] flex flex-col justify-end bg-[#04070A]/75 backdrop-blur-sm animate-[fadeIn_.15s_ease] sm:justify-center sm:items-center sm:p-6
```

### 2.2 — Painel interior (o `div` logo a seguir)
Localiza a className que contém `flex max-h-[88%] flex-col rounded-t-[20px] bg-arena-bg-sec`.

DE:
```
flex max-h-[88%] flex-col rounded-t-[20px] bg-arena-bg-sec shadow-[0_-8px_40px_rgba(0,0,0,.5)] animate-[slideUp_.22s_cubic-bezier(.16,1,.3,1)_forwards]
```
PARA:
```
mx-auto flex max-h-[88%] w-full max-w-[480px] flex-col rounded-t-[20px] bg-arena-bg-sec shadow-[0_-8px_40px_rgba(0,0,0,.5)] animate-[slideUp_.22s_cubic-bezier(.16,1,.3,1)_forwards] sm:mb-6 sm:rounded-[20px]
```

Efeito: mobile inalterado (full-width, sobe de baixo). Desktop: painel centrado, largura máx. 480px, cantos arredondados em todo o redor.

Commit: `fix(arena): contain BottomSheet width and center on desktop`

---

## Tarefa 3 — Corrigir o ai-balancer-modal em ecrãs estreitos

`src/components/arena/ai-balancer-modal.tsx`: o painel usa `w-full max-w-[400px]`, que corta em ecrãs <400px.

Localiza a className que contém `fixed left-1/2 top-1/2 z-50 w-full max-w-[400px]`.

DE:
```
fixed left-1/2 top-1/2 z-50 w-full max-w-[400px] -translate-x-1/2 -translate-y-1/2 p-5
```
PARA:
```
fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[400px] -translate-x-1/2 -translate-y-1/2 p-5
```

Commit: `fix(arena): prevent ai-balancer-modal overflow on narrow screens`

---

## O que NÃO alterar

- Não tocar nos modais shadcn base (`ui/dialog.tsx`, `ui/sheet.tsx`) nem em `passkey-prompt-gate.tsx` e `event-chat-tab.tsx` — já têm `max-w` e centragem corretas.
- Não remover `useDevice`/`DeviceProvider`.
- Não mexer na lógica de nenhum sheet (só na className do `BottomSheet` base).
- Não adicionar `md:`/`lg:` a páginas/componentes que não foram listados aqui.
- Não alterar a keyframe `slideUp` (polish opcional para outra altura).

---

## Verificação final (antes de abrir PR)

1. Build passa:
```
npm run build
```
(Se falhar por type-check de `MobileWrapper` ter perdido imports, confirma que removeste os imports não usados.)

2. Lint passa:
```
npm run lint
```

3. Smoke test manual (descreve no PR, não automatizes):
   - Desktop largo: abrir um sheet (ex.: criar equipa) → fica centrado, máx. 480px, não cola ao fundo nem estica.
   - Mobile (<480px): o mesmo sheet sobe de baixo, full-width, como antes.
   - Ecrã ~360px: abrir o ai-balancer-modal → não corta nas laterais.
   - Arena em desktop: sidebar aparece, sem moldura de iPhone, conteúdo respira.
   - Arena em mobile: bottom-nav aparece, top-bar aparece.

4. Abrir PR com título `Desktop modals + remove iPhone mockup` e colar a checklist do smoke test.

---

## Resumo dos ficheiros tocados

| Ficheiro | Ação |
|---|---|
| `src/components/arena/mobile-wrapper.tsx` | reescrito (passthrough) |
| `src/components/arena/iphone-mockup.tsx` | apagado |
| `src/constants/app.ts` | remover linha `SHOW_MOBILE_ONLY` |
| `src/styles/globals.css` | remover bloco `.iphone-*` |
| `src/components/arena/bottom-sheet.tsx` | 2 classNames |
| `src/components/arena/ai-balancer-modal.tsx` | 1 className |

Total: 6 ficheiros, 3 commits, zero alterações de lógica.
