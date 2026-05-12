# JOGABOLA — Project Instructions

## What this project is
**JogaBola** — plataforma de gestão de equipas de futebol amador. Convocatórias, plantel, estatísticas, chat por evento, rankings, histórico de época.

## Idioma
**Sempre em Português europeu (PT-PT).** Tanto na UI dos protótipos como nas respostas ao utilizador. Tom direto, próximo, desportivo.

## Internacionalização (i18n) — MANDATÓRIO
- **Zero Hardcoded Text**: Nunca adicionar texto diretamente nos componentes. Usar sempre `useTranslations` ou `getTranslations`.
- **Sincronização de Locales**: Sempre que uma chave for adicionada, deve ser incluída em **todos** os ficheiros de tradução: `pt.json`, `en.json`, `es.json` e `fr.json`.
- **Server Actions First**: Preferir sempre Server Actions em vez de rotas de API (REST) para lógica de backend, incluindo uploads, mutações e queries complexas.
- **Idioma Base**: O desenvolvimento é focado em PT-PT, mas a paridade com as outras línguas é obrigatória para cada alteração.

## Design System
**Antes de fazer qualquer alteração, lê o `design.md` na raiz do projeto.** Contém:
- Tokens de cor (dark UI + acento neon green `#7CFF4F`)
- Tipografia (Sora para headings, Inter para UI)
- Componentes (botões, cards, badges, bottom sheet, etc.)
- Microinterações (timings e easings)
- Padrões UX

**Nunca inventar cores ou estilos novos** — usar sempre os tokens definidos. Se algo realmente faltar, propor adição ao design system primeiro.

## Ficheiros principais

| Ficheiro | Não tocar sem razão |
|---|---|
| `JogaBola v2.html` | 📱 Mobile (iOS frame) — protótipo principal |
| `JogaBola Desktop v2.html` | 🖥️ Desktop (Chrome frame) — versão admin |
| `design.md` | Referência viva do design system |

**Versionar com `v3.html`, `v4.html`, etc. quando fizer alterações grandes** — preservar versões anteriores.

## Padrões a manter

- **Aplicar mudanças em ambos** mobile e desktop quando a funcionalidade for partilhada
- **Mobile-first** mas o desktop não é uma versão "esticada" — tem layout próprio (sidebar, drawers, mais densidade)
- **Microinterações sempre** — `.press` / `.btn-press` em qualquer clicável, fade entre ecrãs, stagger em listas
- **Empty states** com ícone + título + sub + CTA
- **Persistência** em `localStorage` para sessão, onboarding, ecrã ativo
- **Iconografia** stroke-based, nunca emoji (exceto 🏆 para campeão e bandeiras)

## Stack
HTML único · React 18 UMD · Babel inline · zero dependências
Frames: `ios-frame.jsx` (mobile) e `browser-window.jsx` (desktop)

## Pedidos comuns
- "Adicionar X" → aplicar em ambos os ficheiros se fizer sentido
- "Refinar" → microinterações, animações, polish — não redesenhar
- "Nova versão" → criar `vN.html` e atualizar o `GEMINI.md`
