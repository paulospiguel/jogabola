# JogaBola — Design System

> Plataforma de gestão de equipas de futebol amador.
> Aplicação web responsiva (mobile-first) com versão desktop dedicada.

---

## 1. Identidade

**Personalidade:** desportiva · noturna · enérgica · funcional
**Aesthetic:** dark UI, alto contraste, acento neon-green
**Inspiração:** apps de stats desportivos (FotMob, Strava), com calor de chat de equipa

**Logotipo:** ícone `shield` com fundo `primary @ 22%` e border `primary @ 44%`

---

## 2. Cores (tokens)

| Token | Hex | Uso |
|---|---|---|
| `bg` | `#0B0F14` | Fundo principal (quase preto) |
| `bgSec` | `#111827` | Sidebar, áreas elevadas, modal background |
| `surface` | `#151C26` | Cards, inputs, listas |
| `surfaceEl` | `#1B2430` | Hover states, surfaces aninhados |
| `border` | `#263244` | Divisórias, bordas neutras |
| `text` | `#F5F7FA` | Texto primário |
| `textSec` | `#A7B0BE` | Texto secundário |
| `textMuted` | `#6B7280` | Labels, captions, metadados |
| **`primary`** | **`#7CFF4F`** | **Neon green — CTAs, acentos, brand** |
| `success` | `#22C55E` | Confirmações, vitórias (V) |
| `warning` | `#F59E0B` | Pendentes, empates (E) |
| `danger` | `#EF4444` | Cancelar, derrotas (D), logout |
| `info` | `#38BDF8` | Informativo, assistências |
| `highlight` | `#FACC15` | Estrelas, troféus, "campeão" |

**Regras:**
- O `primary` é o único acento de marca. Usar com moderação — apenas em CTAs principais, navegação ativa, e elementos do clube próprio.
- Estados (success/warning/danger) sempre com background a `cor + 18-20% opacidade` e border a `cor + 33-44% opacidade`.
- Texto sobre `primary` é sempre `#0B0F14` (não branco).

---

## 3. Tipografia

| Família | Uso |
|---|---|
| **Sora** (700–800) | Headings, números grandes, branding |
| **Inter** (400–700) | Corpo, UI, dados tabulares |

**Escala (mobile e desktop):**

| Token | Tamanho | Peso | Uso |
|---|---|---|---|
| Display | 22–28px | 800 | Hero, títulos onboarding |
| H1 | 18–20px | 700–800 | Títulos de ecrã |
| H2 | 14–15px | 700 | Títulos de secção, cards |
| Body | 12–13px | 500–600 | Conteúdo geral |
| Small | 10–11px | 600 | Labels, metadados |
| Micro | 9–10px | 700 + uppercase + letter-spacing 0.5–1 | Tags, etiquetas |

**Sempre `WebkitFontSmoothing: antialiased`.**

---

## 4. Espaçamento e formas

**Grid base:** 4px

| Radius | Uso |
|---|---|
| 4–6px | Tags, chips pequenos |
| 8–10px | Inputs, botões pequenos |
| 11–14px | Botões médios, cards de lista |
| 16–22px | Cards principais, modais |
| 99px | Pills, dots, progress bars |

**Sombras:** quase ausentes. Apenas em modais (`0 32px 80px rgba(0,0,0,.6)`) e em glow neon (`0 0 32px primary @ 15%`).

---

## 5. Componentes

### Botões
- **Primário:** `bg=primary`, `color=#0B0F14`, `radius=10–14`, `weight=700`
- **Secundário:** `bg=surface`, `border=border`, `color=textSec`
- **Destrutivo:** `bg=danger`, `color=white` (modal de logout)
- **Ghost:** `bg=transparent`, `color=textMuted`
- Todos com classe `.press` / `.btn-press` → `scale(0.97)` ao clicar

### Inputs
- Altura: `40–46px` (desktop / mobile)
- `bg=surfaceEl`, `border=border`, `radius=10`
- Focus: border → `primary`

### Cards
- `bg=surface`, `border=1px border`, `radius=14–16`
- Hover: `border → primary @ 44%` + `bg → surfaceEl`

**Hero card "próximo evento" (`.jb-hero-card`)**
- `radius=18`, fundo `linear(135°, surfaceEl → #1E2B3C)` + glow `info@16%` no canto sup. dir.
- Variante destaque `.jb-hero-card--live`: borda em **conic-gradient animado** (`primary → info → primary`) a rodar 360° em 4s linear infinite. Fundo em `padding-box`, gradiente da borda em `border-box`. Respeita `prefers-reduced-motion` (borda fica estática). Usar só no evento ativo/destacado, nunca em empty states.

### Badges (estado)
- `confirmed` → success | `pending` → warning | `out` → danger
- Pattern: `bg = color@1A`, `border = color@33`, `color = color`, `radius=4`, micro+uppercase

### Avatares
- `radius=50%`, `bg = aColor(id)`, iniciais em uppercase, weight 800
- Tamanhos: 22 / 28 / 32 / 34 / 46 / 80 px

### Tabs
- Pill (segmented): `bg=surface` + active = `bg=primary`, `color=#0B0F14`
- Inline (mobile): `border-bottom` 2px ao item ativo, `color=primary`

### Bottom sheet (mobile)
- Spring open: `cubic-bezier(.16,1,.3,1)`, 320ms
- Drag handle 32×4 no topo, `radius=99`
- Padding 20px, max-height 85vh

---

## 6. Iconografia

**Sistema:** SVG inline, stroke-based, `strokeWidth=1.7` por defeito (1.5 para tamanhos grandes, 2–2.5 para tamanhos pequenos).
**Tamanhos:** 10 / 12 / 13 / 14 / 16 / 20 / 24 / 36 px

Inspirado em Lucide. Sempre `strokeLinecap=round` + `strokeLinejoin=round`.

---

## 7. Microinterações

| Animação | Duração | Easing | Uso |
|---|---|---|---|
| `screenFade` | 220ms | `cubic-bezier(.4,0,.2,1)` | Mudança de ecrã |
| `rowStagger` | 150–180ms | ease, `delay = i * 25–30ms` | Listas (plantel, rankings) |
| `notifDot` | 1.8s | ease infinite | Pulse no badge não lido |
| `modalIn` | 200ms | ease | Modais desktop |
| `overlayIn` | 150ms | ease | Backdrop fade |
| `.press` / `.btn-press` | 120ms | ease | `scale(0.97)` em todos os clicáveis |
| `jb-border-spin` | 4s | linear infinite | Borda em gradiente do hero "próximo evento" (`.jb-hero-card--live`) |

**Princípio:** rápido (<300ms), natural, nunca decorativo.

---

## 8. Navegação

### Mobile
- **Bottom nav 5 itens:** Equipa · Plantel · Eventos · Avisos · Perfil
- **Header com back arrow** em ecrãs internos (Rankings, Histórico, Player detail)
- Dashboard tem cards "Descobrir" para Rankings / Histórico / Perfil de Equipa

### Desktop
- **Sidebar fixa** colapsável (218px / 62px)
- 8 secções: Dashboard · Eventos · Plantel · Rankings · Histórico · Equipa · Estatísticas · Definições
- **Topbar:** título de ecrã + ações (notificações, criar)
- **Drawer lateral** para notificações e detalhe de jogador

---

## 9. Padrões UX

- **Onboarding** — primeiro uso seleciona jornada (Gestor / Jogador / Árbitro [soon] / Adepto [soon]). Persistido em `localStorage`
- **Empty states** — ícone + título + subtítulo + CTA (ex: "Adicionar jogador")
- **Confirmação destrutiva** — sempre via modal/sheet (logout, eliminar)
- **Feedback imediato** — copy link → flash success 2s, marcar lida → flash verde
- **Persistência de sessão** — `localStorage` para ecrã ativo, onboarding feito, jornada

---

## 10. Conteúdo e tom de voz

- **Língua:** Português europeu
- **Tom:** direto, próximo, desportivo. "Confirma presença" não "Confirmar Presença Para o Próximo Evento"
- **Números > palavras** — exibir "11" em destaque, não "Onze vitórias"
- **Verbos no imperativo** em CTAs: "Criar evento", "Partilhar", "Sair"

---

## 11. Ficheiros do projeto

| Ficheiro | Plataforma |
|---|---|
| `JogaBola v2.html` | 📱 Mobile (iOS frame) — protótipo completo |
| `JogaBola Desktop v2.html` | 🖥️ Desktop (Chrome frame) — versão admin |
| `JogaBola.html` | (legacy) v1 mobile |
| `JogaBola v3 - Standalone.html` | 📱 v3 Claude Designer prototype — referência de implementação |

**Stack:** HTML único · React 18 (UMD) · Babel inline · zero dependências
**Frames:** iOS 26 (mobile) e Chrome (desktop) via starter components

---

## 12. Token Mapping (Next.js — Tailwind v4)

### Namespaces ativos

| Namespace | Onde vive | Uso |
|---|---|---|
| `--color-arena-*` | `src/styles/globals.css` (`@theme`) | **App** (arena, autenticação, onboarding) |
| `--color-neon-*` | `src/styles/globals.css` (`@theme`) | **Landing page** e website público |

### Tokens arena (canónicos)

| CSS var | Tailwind utility | Hex |
|---|---|---|
| `--color-arena-bg` | `bg-arena-bg` | `#0B0F14` |
| `--color-arena-bg-sec` | `bg-arena-bg-sec` | `#111827` |
| `--color-arena-surface` | `bg-arena-surface` | `#151C26` |
| `--color-arena-surface-el` | `bg-arena-surface-el` | `#1B2430` |
| `--color-arena-border` | `border-arena-border` | `#263244` |
| `--color-arena-text` | `text-arena-text` | `#F5F7FA` |
| `--color-arena-text-sec` | `text-arena-text-sec` | `#A7B0BE` |
| `--color-arena-text-muted` | `text-arena-text-muted` | `#6B7280` |
| `--color-arena-primary` | `bg-arena-primary` | `#7CFF4F` |
| `--color-arena-success` | `bg-arena-success` | `#22C55E` |
| `--color-arena-warning` | `bg-arena-warning` | `#F59E0B` |
| `--color-arena-danger` | `bg-arena-danger` | `#EF4444` |
| `--color-arena-info` | `bg-arena-info` | `#38BDF8` |
| `--color-arena-highlight` | `bg-arena-highlight` | `#FACC15` |

### Regras de uso
- Nunca misturar namespaces: componentes `arena/*` usam `arena-*`, landing usa `neon-*`.
- `--jb-*` e `--color-journey-*` **removidos** (era dead code — não usar).
- Texto sobre `arena-primary` → sempre `text-arena-bg` (#0B0F14), nunca branco.

### Componentes base (arena)

| Componente | Ficheiro | Notas |
|---|---|---|
| `<Cta>` | `arena/cta.tsx` | variant: primary/secondary/danger/ghost · size: sm/md/lg |
| `<ProgressBar>` | `arena/progress-bar.tsx` | gradient roxo→ciano→lima, `showPercent` |
| `<JbAvatar>` | `arena/avatar.tsx` | Prefixo `Jb` mantido (colisão shadcn `Avatar`) |
| `<JbBadge>` | `arena/badge.tsx` | Prefixo `Jb` mantido (colisão shadcn `Badge`) |
| `<ArenaSidebar>` | `arena/sidebar.tsx` | Renomeado de `Sidebar` (colisão shadcn) |
| `<BottomNav>` | `arena/bottom-nav.tsx` | |
| `<BottomSheet>` | `arena/bottom-sheet.tsx` | spring cubic-bezier(.16,1,.3,1) 320ms |
| `<MobileTopBar>` | `arena/mobile-top-bar.tsx` | |
| `<ScreenHeader>` | `arena/screen-header.tsx` | |
| `<PlayerRow>` | `arena/player-row.tsx` | |
| `<ScoreBar>` | `arena/score-bar.tsx` | |
| `<TeamSwitcher>` | `arena/team-switcher.tsx` | |
| `<UserMenu>` | `arena/user-menu.tsx` | |
