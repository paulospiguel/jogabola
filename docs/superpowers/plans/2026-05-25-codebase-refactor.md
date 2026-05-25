# Plano de Refactor — Codebase JogaBola

**Objetivo:** Código manutenível, claro, sem texto hardcoded, com padrão consistente em toda a `src/`.  
**Âmbito:** Todo o `src/`, priorizado por impacto descendente.  
**Padrão de referência:** Ver `CONTEXT.md` → secção "Convenções de Código"

---

## Regras do Padrão

### 1. Inglês em tudo (exceto UI)
- Variáveis, tipos, funções, constantes, ficheiros → inglês
- Strings na UI → sempre via `useTranslations`, nunca hardcoded

### 2. Sem strings literais de status espalhadas
```ts
// ❌ Errado
if (status === "A VALIDAR") { ... }

// ✅ Correto
import { ATTENDANCE_STATUS } from "@/constants/attendance"
if (status === ATTENDANCE_STATUS.TO_VALIDATE) { ... }
```

### 3. Estrutura de feature
```
feature/
  page.tsx              ← server component: fetch + pass props (~50-80 linhas)
  _components/          ← UI por responsabilidade (uma responsabilidade por ficheiro)
  _hooks/               ← lógica de estado/efeitos da feature
  _utils/               ← funções puras específicas da feature
  _fixtures/            ← mock data tipado (remover quando dados reais chegarem)
```

### 4. Mock data fora dos componentes
- Mock data inline → mover para `_fixtures/event-mock.ts`
- Tipado com os mesmos types que a DB vai retornar
- Componente recebe dados como props, nunca os define

### 5. Componente tem uma responsabilidade
- `page.tsx` → só fetch e layout
- Componente de orquestração → estado + tab routing (~1 responsabilidade)
- Sub-componente → UI de uma secção

### 6. Hooks por feature
- Lógica de estado, `useEffect`, mutações → extrair para `_hooks/`
- Hooks partilhados entre features → `src/hooks/` global
- Nome: `use-[feature]-[responsabilidade].ts`

---

## Prioridade de Execução

### Tier 1 — Core features (maior impacto, mais dívida)

| Feature | Ficheiros principais | Problema |
|---|---|---|
| `events/[id]` | `event-detail.tsx` (1213 linhas) | Mock data inline, tudo num ficheiro |
| `payments` | `payments/page.tsx` (663), `payments/[id]/page.tsx` (590) | Lógica de UI misturada |
| `squads` | `squad-client.tsx` (521) | Estado + UI + lógica num componente |
| `calendar` | `calendar-events.tsx` (946) | Componente monolítico |
| `athlete/event/[id]` | `athlete-rsvp-sheet.tsx` (955) | Sheet com demasiada responsabilidade |

### Tier 2 — Components arena

| Componente | Ficheiro | Problema |
|---|---|---|
| Equipas tab | `equipas-tab.tsx` (690) | Múltiplas responsabilidades |
| Create event | `create-event-sheet.tsx` (858) | Form + lógica inline |
| Payment method | `payment-method-card.tsx` (581) | UI + lógica misturada |

### Tier 3 — Restante
- `notifications`, `profile`, `rankings`, `historico`, `settings`
- `src/constants/` — completar com todos os status strings do domínio
- `src/types/` — garantir inglês em todos os tipos

---

## Checklist por Feature (aplicar a cada Tier 1)

Para cada feature a refatorar:

- [ ] **Criar `_fixtures/`** — mover mock data inline, tipar com interfaces reais
- [ ] **Criar `_hooks/`** — extrair `useState`, `useEffect`, handlers para hooks dedicados
- [ ] **Dividir componente** — uma secção/tab → um ficheiro em `_components/`
- [ ] **Limpar strings** — substituir literais por constantes de `src/constants/`
- [ ] **Inglês** — renomear variáveis/types em português para inglês
- [ ] **`page.tsx` limpo** — só fetch + pass props para componente cliente

---

## O que NÃO mudar

- `src/actions/` — mantém estrutura flat por domínio, só limpar internamente se necessário
- `src/lib/utils.ts` — só genéricos (`cn`, `formatDate`), não partir
- `src/hooks/` global — manter hooks verdadeiramente partilhados
- Design tokens, classes Tailwind — fora do âmbito deste refactor
