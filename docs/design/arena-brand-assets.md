# Arena — Inventário de assets de branding e emojis

> Task 7 do plano `docs/superpowers/plans/2026-07-16-arena-ui-ux-improvements.md`.
> Este documento é apenas inventário e contrato — não introduz nem gera imagens novas (isso é a Task 8, com gate humano) e não altera UI (isso é a Task 9).

## 1. Metodologia

Executados os dois comandos definidos no plano, sem qualquer alteração de UI:

```bash
rg --files src/assets public | rg -i '\.(png|jpe?g|webp|gif|svg)$'
rg -n --glob '*.{ts,tsx,json}' '[⚽🏃🏆🥅🎯💰📅👥⭐🔥✅❌⚠️]' src
```

Classificação usada para cada ocorrência:

- **`branding`** — deve tornar-se (ou já é) uma imagem de branding gerada/curada (trabalho da Task 8/9).
- **`operacional`** — deve tornar-se um ícone Lucide (stroke-based), por ser um elemento funcional de interface.
- **`conteúdo permitido`** — conteúdo gerado pelo utilizador, ou uma das duas exceções explícitas do `CLAUDE.md`: 🏆 para campeão e bandeiras.
- **`fora de âmbito`** — fora das superfícies que este plano toca (ex.: emails transacionais, ficheiros de fixtures/testes, secções não referidas nas Tasks 1-11 do plano, assets já integrados sem alterações pendentes).

Nota sobre a regex de emoji do Step 1: a classe de caracteres inclui `⚠️`, que é composto por `U+26A0` + `U+FE0F` (variation selector). Isto faz com que o `rg` também acerte em qualquer emoji seguido do mesmo variation selector (ex.: `🏋️`, `🗣️`), mesmo que o emoji base não conste explicitamente na classe. Essas ocorrências foram mantidas no inventário tal como devolvidas pelo comando (fiel ao Step 1), com a nota indicada por entrada.

---

## 2. Inventário de imagens (`rg --files src/assets public | rg -i '\.(png|jpe?g|webp|gif|svg)$'`)

### 2.1 Saída bruta

```
public/icon-512.png
public/assets/store/screen3.png
public/assets/store/screen2.png
public/assets/store/screen1.png
public/favicon.png
public/icon-192.png
public/images/login-stadium.jpg
public/jogabola-logo-white.svg
public/temp/barreiro.jpg
public/temp/bolacacem.jpg
public/cursor.png
src/assets/animations/jogabola-loop.gif
src/assets/animations/jogabola_animation.gif
src/assets/animations/ball-loading.gif
src/assets/animations/jogabola_splash_screen.gif
src/assets/animations/jb-loading.gif
src/assets/icons/friendship.png
src/assets/icons/jogabola-tube.svg
src/assets/icons/team.svg
src/assets/icons/stadium.png
src/assets/icons/stadium-2.svg
src/assets/icons/abstract.png
src/assets/partners/redbull.svg
src/assets/partners/field.png
src/assets/partners/fila.svg
src/assets/logos/jogabola-logo.svg
src/assets/logos/jogabola-logo.png
src/assets/logos/logo_animado.gif
src/assets/logos/jogabola-white.svg
src/assets/logos/jogabola-white.png
src/assets/images/jb-player.png
src/assets/images/jb-referee.png
src/assets/images/jb-manager.png
src/assets/images/jb-money.png
src/assets/images/jb-other.png
src/assets/images/soccer-field.svg
src/assets/images/jb-receipts.png
src/assets/images/jb-fan.png
src/assets/images/jb-coach.png
src/assets/images/jb-training.png
src/assets/images/jb-challenge.png
src/assets/images/jb-confused-cap.png
src/assets/images/trophy.svg
src/assets/images/JOGABOLA-shield.svg
src/assets/images/jb-game.png
src/assets/images/stadium.svg
```

### 2.2 Classificação

#### Família `jb-*` de branding Arena (`src/assets/images/`)

Esta é a família diretamente relevante para a Task 8 (o próprio plano nomeia estes ficheiros no Step 1 da Task 8 como referências a inspecionar).

| Ficheiro | Consumidor atual | Classificação | Decisão |
|---|---|---|---|
| `jb-game.png` | nenhum consumidor em `src/**/*.{ts,tsx}` (asset "fonte", ainda não integrado em nenhuma UI) | `branding` | Candidato a reutilizar para `CreateEventType = "game"` (hoje `emoji: "🏆"` em `create-event-dialog.utils.ts`) **se passar a grelha de qualidade da Task 8** (1024×1024, alpha, safe area 84%, legível a 56px). Task 8 confirma. |
| `jb-training.png` | nenhum consumidor | `branding` | Candidato a reutilizar para `CreateEventType = "training"` (hoje `emoji: "🏋️"`) se passar a grelha. Task 8 confirma. |
| `jb-other.png` | nenhum consumidor | `branding` | Candidato a reutilizar para `CreateEventType = "other"` (hoje `emoji: "📌"`) se passar a grelha. Não mencionado explicitamente no texto do Step 4 da Task 7, mas o nome coincide com o `CreateEventType` existente e o ficheiro está na lista de inspeção da Task 8 — decisão final de reutilização/geração cabe à Task 8. |
| `jb-manager.png` | nenhum consumidor | `branding` | Referência de estilo listada no Step 1 da Task 8 ("registar semelhanças e inconsistências"). Destino funcional exato (que ecrã/estado a usa) não está definido no plano — não inventar aqui; decisão de integração cabe à Task 8/9. |
| `jb-money.png` | nenhum consumidor | `branding` | Referência de estilo listada no Step 1 da Task 8. Candidato natural a Cobranças/pagamentos, mas o plano não define o destino exato — não inventar; decisão cabe à Task 8/9. |
| `jb-challenge.png` | nenhum consumidor | `branding` | Referência de estilo listada no Step 1 da Task 8. Destino funcional exato não definido no plano — não inventar; decisão cabe à Task 8/9. |
| `jb-player.png` | `src/app/(mobile)/(protected)/onboarding/_components/onboarding-client.tsx` | `fora de âmbito` | Já integrado no fluxo de onboarding (fora das superfícies Arena tocadas por este plano). Nenhuma ação. |
| `jb-referee.png` | `src/app/(mobile)/(protected)/onboarding/_components/onboarding-client.tsx` | `fora de âmbito` | Idem — onboarding, fora do plano. |
| `jb-coach.png` | `src/app/(mobile)/(protected)/onboarding/_components/onboarding-client.tsx` | `fora de âmbito` | Idem — onboarding, fora do plano. |
| `jb-receipts.png` | nenhum consumidor | `fora de âmbito` | Não referido em nenhuma task do plano (Task 8 só inspeciona `jb-game`, `jb-training`, `jb-manager`, `jb-money`, `jb-challenge`, `jb-other`). Asset órfão — possível trabalho futuro fora deste plano. |
| `jb-fan.png` | nenhum consumidor | `fora de âmbito` | Idem — órfão, não referido em nenhuma task deste plano. |
| `jb-confused-cap.png` | nenhum consumidor | `fora de âmbito` | Idem — órfão, não referido em nenhuma task deste plano. |

#### Assets de branding globais já integrados (fora do escopo de mudança desta task)

| Ficheiro(s) | Consumidor | Classificação | Decisão |
|---|---|---|---|
| `src/assets/animations/jb-loading.gif` | `src/components/loading.tsx` | `branding` | Já integrado e em uso (inclusive nas superfícies Arena via `Loading` partilhado). Nenhuma ação nesta task. |
| `src/assets/animations/jogabola-loop.gif`, `jogabola_animation.gif`, `ball-loading.gif`, `jogabola_splash_screen.gif` | nenhum consumidor encontrado | `fora de âmbito` | Assets órfãos de animação, não referidos em nenhuma task do plano. |
| `src/assets/logos/jogabola-logo.svg`, `jogabola-white.svg`, `logo_animado.gif` | `src/components/logo.tsx` | `branding` | Logótipo global já integrado, fora do escopo deste plano (não é branding "Arena event"). |
| `src/assets/logos/jogabola-logo.png`, `jogabola-white.png` | nenhum consumidor direto encontrado | `fora de âmbito` | Variantes PNG do logótipo, sem consumidor localizado; fora do escopo. |
| `src/assets/images/trophy.svg` | `src/components/tournament/tournament-result-view.tsx`, `tournament-ended-view.tsx` | `fora de âmbito` | Módulo de Torneios, não é uma das superfícies tocadas pelo plano Arena UI/UX. |
| `src/assets/images/JOGABOLA-shield.svg`, `soccer-field.svg`, `stadium.svg` | nenhum consumidor encontrado | `fora de âmbito` | Assets órfãos, não referidos em nenhuma task do plano. |

#### Ícones, parceiros e assets estáticos gerais

| Ficheiro(s) | Consumidor | Classificação | Decisão |
|---|---|---|---|
| `src/assets/icons/friendship.png`, `jogabola-tube.svg`, `team.svg`, `stadium.png`, `stadium-2.svg`, `abstract.png` | nenhum consumidor encontrado (grep total no repo) | `fora de âmbito` | Assets órfãos; possível limpeza futura fora deste plano. |
| `src/assets/partners/redbull.svg`, `field.png`, `fila.svg` | nenhum consumidor encontrado | `fora de âmbito` | Logótipos de parceiros/patrocinadores, sem consumidor localizado; fora do escopo Arena. |
| `public/icon-512.png`, `icon-192.png`, `favicon.png`, `cursor.png` | manifest/PWA (fora de `src/**/*.{ts,tsx}`) | `fora de âmbito` | Ícones de aplicação/PWA, não são branding de conteúdo Arena. |
| `public/assets/store/screen1.png`, `screen2.png`, `screen3.png` | listagens de loja (fora do código da app) | `fora de âmbito` | Screenshots de app store. |
| `public/images/login-stadium.jpg` | ecrã de login (fora das superfícies Arena tocadas) | `fora de âmbito` | Fora do escopo deste plano. |
| `public/jogabola-logo-white.svg` | fora de `src/**/*.{ts,tsx}` (usado provavelmente em metadata/manifest) | `fora de âmbito` | Fora do escopo. |
| `public/temp/barreiro.jpg`, `bolacacem.jpg` | nenhum consumidor localizado | `fora de âmbito` | Ficheiros temporários/teste, candidatos a remoção fora deste plano — não atuado aqui. |

---

## 3. Inventário de emojis (`rg -n --glob '*.{ts,tsx,json}' '[⚽🏃🏆🥅🎯💰📅👥⭐🔥✅❌⚠️]' src`)

### 3.1 Saída bruta

```
src/constants/positions.ts:17:    emoji: "🥅",
src/constants/positions.ts:23:    emoji: "🛡️",
src/constants/positions.ts:29:    emoji: "⚙️",
src/constants/positions.ts:41:    emoji: "⭐",
src/constants/positions.ts:68:  return config?.emoji || "⚽";
src/locales/es.json:63:      "title": "Bienvenido de vuelta a la Arena ⚽"
src/lib/email.ts:160:    subject: "Bem-vindo à Arena JogaBola! ⚽",
src/lib/email.ts:199:    subject: `✅ Presença confirmada — ${event.title}`,
src/lib/email.ts:229:    subject: `🏆 Lembrete: ${event.title} ${event.hoursUntil <= 24 ? "amanhã" : `em ${Math.round(event.hoursUntil / 24)} dias`}`,
src/locales/fr.json:63:      "title": "Bienvenue dans l'Arena ⚽"
src/locales/pt.json:63:      "title": "Bem-vindo de volta à Arena ⚽"
src/locales/en.json:63:      "title": "Welcome back to the Arena ⚽"
src/components/emails/guest-rsvp-otp-email.tsx:95:                📅 {eventDate}
src/components/emails/payment-reminder-email.tsx:46:      preview={`⚠️ Pagamento pendente — ${urgencyLabel} — ${eventTitle}`}
src/components/emails/payment-reminder-email.tsx:112:            { icon: "📅", label: eventDate },
src/components/emails/payment-reminder-email.tsx:147:              ? "⚠️ O prazo está quase a expirar. A tua reserva pode ser cancelada automaticamente."
src/components/emails/payment-reminder-email.tsx:148:              : "ℹ️ Completa o pagamento para garantires o teu lugar no jogo."}
src/components/emails/event-reminder-email.tsx:49:      preview={`🏆 ${urgencyLabel} ${eventTitle} — ${confirmedCount}/${totalSpots} confirmados`}
src/components/emails/event-reminder-email.tsx:64:          {hoursUntil <= 24 ? "🔔 Lembrete urgente" : "📅 Lembrete de evento"}
src/components/emails/event-reminder-email.tsx:111:            { icon: "📅", label: eventDate },
src/components/emails/welcome-email.tsx:62:            { emoji: "⚽", label: "Confirma presença nos jogos em segundos" },
src/components/emails/welcome-email.tsx:64:            { emoji: "💰", label: "Acompanha pagamentos da equipa" },
src/components/emails/attendance-confirmed-email.tsx:39:      preview={`✅ Presença confirmada em ${eventTitle} — ${eventDate}`}
src/components/emails/attendance-confirmed-email.tsx:56:          <span style={{ color: colors.success }}>✅</span>
src/components/emails/attendance-confirmed-email.tsx:111:              { icon: "📅", label: eventDate },
src/components/shared/events/create-event-dialog.utils.ts:19:    emoji: "🏆",
src/components/shared/events/create-event-dialog.utils.ts:24:    emoji: "🏋️",
src/components/shared/events/create-event-dialog.utils.ts:34:    emoji: "🗣️",
src/components/tournament/tournament-share.test.ts:233:    tournament.name = "Torneio São João ⚽";
src/components/tournament/tournament-share.test.ts:237:    expect(result?.name).toBe("Torneio São João ⚽");
src/components/timer/summary-modal.tsx:122:                  <span>⚽</span>
src/components/timer/result-view.tsx:97:              <span>⚽</span>
src/components/timer/hub-view.tsx:77:          {match.type === "jogo" ? "🏆" : "🎯"}
src/components/timer/hub-view.tsx:215:            <span className="text-3xl">⚽</span>
src/app/(mobile)/(protected)/arena/historical/_components/historical-client.tsx:55:                      🏆 {t("champion")}
src/components/timer/share.ts:90:    lines.push(`⚽ ${formatMinute(min * 60)} ${name} (${team})`);
src/components/timer/setup-drawer.tsx:283:                    {tp === "jogo" ? "🏆" : "🎯"}
```

### 3.2 Classificação

#### `src/constants/positions.ts` — resolvido nesta task (Steps 2-3)

| Ocorrência | Classificação | Decisão |
|---|---|---|
| `emoji: "🥅"` (goalkeeper), `"🛡️"` (defender), `"⚙️"` (midfielder), `"⭐"` (versatile), campo `emoji` em `PositionConfig`, função `getPositionEmoji` | `operacional` | **Removido nesta task.** `PositionConfig` já expunha `icon: LucideIcon` (Shield/Target/Goal/Star) para todas as posições — a API de emoji era 100% redundante. Confirmado por `rg` que não existiam consumidores reais (`getPositionEmoji`, `POSITIONS` deste ficheiro e `constants/positions` não tinham nenhum import em `src/**/*.{ts,tsx}`). Ver secção 4. |

#### `src/components/shared/events/create-event-dialog.utils.ts` — âmbito da Task 9

| Ocorrência | Classificação | Decisão |
|---|---|---|
| `emoji: "🏆"` (game), `emoji: "🏋️"` (training), `emoji: "🗣️"` (meeting) — capturados pelo `rg` do Step 1 | `operacional` | Task 9 substitui por `EventTypeVisual` (união discriminada `brand`/`icon`). `game` → `jb-game.png` (branding, pendente de aprovação Task 8); `training` → `jb-training.png` (branding, pendente de aprovação Task 8); `meeting` → gerar novo asset (`generate`, ver secção 4). |
| `emoji: "🤝"` (friendly), `emoji: "📌"` (other) — no mesmo objeto `EVENT_TYPE_META`, **não capturados** pela regex do Step 1 (não contêm variation selector `U+FE0F`) | `operacional` | Mesma decisão da Task 9: `friendly` → gerar novo asset (`generate`); `other` → candidato a `jb-other.png` (branding, pendente de aprovação Task 8). Registado aqui por completude, apesar de fora da saída literal do comando. |
| Consumidor `src/components/arena/create-event-step-type.tsx` (renderiza `meta.emoji` via variável, sem caracter de emoji literal no próprio ficheiro — por isso não aparece na saída do `rg`) | `operacional` | Task 9 migra este ficheiro para consumir `EventTypeVisual` (ícone Lucide ou `next/image`), conforme Step 2-3 da Task 9. |

#### `src/components/timer/*.tsx` — âmbito da Task 9

| Ocorrência | Classificação | Decisão |
|---|---|---|
| `summary-modal.tsx:122` `<span>⚽</span>` | `operacional` | Task 9 Step 4: substituir por `CircleDot` (Lucide). |
| `result-view.tsx:97` `<span>⚽</span>` | `operacional` | Task 9 Step 4: substituir por `CircleDot` (Lucide). |
| `hub-view.tsx:77` `{match.type === "jogo" ? "🏆" : "🎯"}` | `operacional` | Task 9 Step 4: substituir por `Trophy`/`Target` (Lucide). |
| `hub-view.tsx:215` `<span className="text-3xl">⚽</span>` | `operacional` | Task 9 Step 4: substituir por `CircleDot` (Lucide). |
| `setup-drawer.tsx:283` `{tp === "jogo" ? "🏆" : "🎯"}` | `operacional` | Task 9 Step 4: substituir por `Trophy`/`Target` (Lucide). |
| `src/components/timer/share.ts:90` `⚽ ${formatMinute(...)}` | `fora de âmbito` | Gera texto de partilha externo (ex.: WhatsApp), não é um elemento de UI Lucide/branding. **Não está na lista de ficheiros da Task 9** (`create-event-step-type.tsx`, `create-event-dialog.utils.ts`, `setup-drawer.tsx`, `hub-view.tsx`, `result-view.tsx`, `summary-modal.tsx`) — não atuado aqui nem reivindicado para a Task 9. |

#### `src/app/(mobile)/(protected)/arena/historical/_components/historical-client.tsx`

| Ocorrência | Classificação | Decisão |
|---|---|---|
| `historical-client.tsx:55` `🏆 {t("champion")}` | `conteúdo permitido` | Exceção explícita do `CLAUDE.md`: "🏆 para campeão". Manter como está — nenhuma ação. |

#### Locales — títulos de boas-vindas da Arena

| Ocorrência | Classificação | Decisão |
|---|---|---|
| `pt.json:63`, `en.json:63`, `es.json:63`, `fr.json:63` — `header.title`: `"Bem-vindo de volta à Arena ⚽"` (e traduções) | `fora de âmbito` | ⚽ decorativo dentro de uma frase de copy, não é um ícone de interface a substituir — o objetivo do plano é "iconografia" (elementos funcionais), não emojis dentro de texto corrido. Potencialmente revisto pela Task 10 (revisão PT-PT/paridade de locales), mas não é ação desta task. |

#### Emails transacionais (`src/lib/email.ts`, `src/components/emails/*.tsx`)

| Ocorrência | Classificação | Decisão |
|---|---|---|
| `email.ts:160,199,229`; `guest-rsvp-otp-email.tsx:95`; `payment-reminder-email.tsx:46,112,147,148`; `event-reminder-email.tsx:49,64,111`; `welcome-email.tsx:62,64`; `attendance-confirmed-email.tsx:39,56,111` | `fora de âmbito` | Emails são explicitamente excluídos do âmbito de iconografia pelo próprio plano (Task 9 Step 1: "Não incluir emails"). Nenhuma ação. |

#### Fixtures/testes

| Ocorrência | Classificação | Decisão |
|---|---|---|
| `tournament-share.test.ts:233,237` — `"Torneio São João ⚽"` | `fora de âmbito` | Conteúdo de fixture de teste (nome de torneio de exemplo), não é iconografia de interface. Nenhuma ação. |

---

## 4. Primeira família de branding — contrato para a Task 8 (documentação apenas, nada gerado aqui)

A Task 8 usa GPT Images para gerar apenas os assets marcados `generate` abaixo, com as imagens `jb-*` existentes como referência de estilo. **Nenhuma imagem é gerada nesta task.**

### 4.1 Especificação técnica (consistente com o plano, Task 8)

- **Fonte:** PNG 1024×1024, canal alpha (fundo transparente).
- **Safe area:** sujeito central dentro de 84% da tela.
- **Legibilidade alvo:** reconhecível a 56×56 px (tamanho de renderização típico em UI).
- **Exports finais:** WebP em duas resoluções — `@1x` 256×256 (qualidade 88) e `@2x` 512×512 (qualidade 90), via `cwebp` apenas após aprovação humana.
- **Estilo:** contorno grosso verde-floresta escuro, formas sólidas arredondadas, acentos lima e amarelo quente, sombreado subtil com volume, moldura hexagonal tipo emblema, fundo transparente, sem texto, sem letras, sem fotorrealismo.

### 4.2 Prompt-base (definido no plano, Task 8 Step 2 — reproduzido aqui para consistência, não executado nesta task)

```text
Create one square JogaBola amateur-football brand icon matching the supplied references: dark forest-green thick outline, rounded solid shapes, lime and warm yellow accents, subtle dimensional shading, hexagonal badge framing, transparent background, no text, no letters, no photorealism. Keep the subject inside a central 84% safe area and readable at 56×56 px. Subject: {subject}.
```

### 4.3 Estado por subject (assets de tipo de evento / Arena)

| Subject | Asset alvo | Estado | Notas |
|---|---|---|---|
| `game` (Jogo) | `jb-game.png` | `reuse-if-passes-grid` | Já existe em `src/assets/images/`. Task 8 Step 1 avalia contra a grelha de qualidade (1024×1024, alpha, safe area, legibilidade a 56px) antes de decidir reutilizar ou regenerar. |
| `training` (Treino) | `jb-training.png` | `reuse-if-passes-grid` | Idem `jb-game.png`. |
| `other` (Outro) | `jb-other.png` | `reuse-if-passes-grid` | Já existe; nome coincide com `CreateEventType = "other"`. Task 8 confirma se passa a grelha. |
| `friendly` (Amigável) | *(nenhum asset existente)* | `generate` | Sem candidato em `src/assets/images/`. Marcado para geração na Task 8 com o prompt-base acima (`Subject: friendly amateur football match`, a refinar na própria Task 8). |
| `meeting` (Reunião) | *(nenhum asset existente)* | `generate` | Sem candidato em `src/assets/images/`. Marcado para geração na Task 8 (`Subject: team meeting/huddle`, a refinar na própria Task 8). |
| Empty states aprovados (Arena) | *(a definir por design em conjunto com a Task 8)* | `generate` | O plano refere "empty states aprovados" como candidatos a branding; nenhum empty state Arena específico foi aprovado até esta task — não inventar novos aqui. A Task 8 confirma a lista final junto do design antes de gerar. |

### 4.4 Referências de estilo a inspecionar na Task 8 (Step 1 dessa task)

`jb-game.png`, `jb-training.png`, `jb-manager.png`, `jb-money.png`, `jb-challenge.png`, `jb-other.png` — conforme listado no próprio plano. `jb-manager.png`, `jb-money.png` e `jb-challenge.png` servem apenas como referência de consistência visual nesta fase; o destino funcional exato de cada um (que ecrã/estado os usa) não está definido no plano e não deve ser inventado aqui — cabe à Task 8/9 decidir com base na grelha de qualidade e nas necessidades reais de UI identificadas nessas tasks.

---

## 5. Resumo de decisões desta task (Steps 2-3)

- `PositionConfig.emoji` removido.
- `getPositionEmoji` eliminado.
- `getPositionIcon` mantido (devolve `LucideIcon | null`, com fallback `null` previsível para posição desconhecida/`undefined`).
- Confirmado por `rg` (ver `.superpowers/sdd/task-7-report.md`) que não existiam consumidores reais de `getPositionEmoji` nem do campo `emoji` de `constants/positions.ts` em todo o `src/`.
- Nenhum ficheiro `.tsx` foi alterado.
- Nenhuma imagem foi gerada.

---

## 6. Task 8 — geração e aprovação (execução real)

### 6.1 Step 1 — inspeção das referências

Inspecionadas as seis imagens listadas na secção 4.4 (`jb-game.png`, `jb-training.png`, `jb-manager.png`, `jb-money.png`, `jb-challenge.png`, `jb-other.png`, todas em `src/assets/images/`). Nenhuma passa a grelha de qualidade definida na secção 4.1:

| Ficheiro | Dimensões reais | Alpha | Estilo |
|---|---|---|---|
| `jb-game.png` | 768×868 | sim | contorno grosso, fundo transparente — família A |
| `jb-challenge.png` | 768×868 | sim (parcial) | contorno grosso, fundo transparente — família A |
| `jb-training.png` | 768×868 | **não** (fundo branco opaco) | contorno fino, fundo branco — família B |
| `jb-other.png` | 768×868 | **não** (fundo branco opaco) | contorno fino, fundo branco — família B |
| `jb-money.png` | 768×868 | **não** (fundo branco opaco) | contorno fino, fundo branco — família B |
| `jb-manager.png` | 375×375 | sim | clip-art semi-realista, estilo totalmente diferente das restantes |

**Inconsistências registadas:** (1) nenhum ficheiro é 1024×1024 conforme a especificação da secção 4.1; (2) existem duas famílias de estilo distintas e incompatíveis entre si (contorno grosso/transparente vs. contorno fino/fundo branco); (3) `jb-manager.png` não pertence a nenhuma das duas famílias. Decisão: nenhum dos três candidatos `reuse-if-passes-grid` (`game`/`training`/`other`) passa a grelha — todos os cinco assets de tipo de evento (`game`, `training`, `friendly`, `meeting`, `other`) foram gerados de novo para garantir um conjunto visualmente consistente, em vez de misturar ativos antigos inconsistentes com os dois novos. Decisão aprovada com o utilizador antes da geração.

### 6.2 Step 2 — geração

**Desvio de ferramenta registado:** o plano nomeia "GPT Images" como gerador; esse serviço não estava disponível neste ambiente. Confirmado com o utilizador, a geração foi feita via **FLUX.2 [pro]** (skill `flux-imagegen`, BFL API), fornecendo o mesmo prompt-base da secção 4.2 com o `{subject}` preenchido por ícone. A API FLUX não devolve canal alpha nativo (fundo sempre opaco, apesar do prompt pedir "transparent background") — o fundo branco foi removido localmente após a geração com ImageMagick (`-fuzz 6% -transparent white`), não com nenhum serviço de remoção de fundo pago (tentativa inicial via Higgsfield falhou por falta de créditos na conta). Verificado por amostragem de pixel (`identify -format '%[pixel:p{x,y}]'`) que o canto e o fundo interior do hexágono ficam `srgba(0,0,0,0)` e que a arte (troféu, apito, etc.) mantém alpha`=1` e cor original — sem halo nem perda de detalhe.

Subjects usados (mapeados ao `EVENT_TYPE_META` existente em `create-event-dialog.utils.ts`):

| Subject | Prompt subject usado |
|---|---|
| `game` | "a golden championship trophy with a football beside it, celebrating a competitive match" |
| `training` | "a football training cone next to a coach's whistle with motion lines, drill practice" |
| `friendly` | "two hands shaking warmly over a football, a friendly casual match" |
| `meeting` | "a speech bubble with three dots next to a small football team huddle icon, team meeting" |
| `other` | "a location pin marker with a small football beside it, miscellaneous calendar event" |

### 6.3 Step 3 — aprovação visual

Apresentadas as 5 variantes lado a lado (300px) e a 56px (teste de legibilidade real) num artifact HTML (`arena-brand-review.html`, montagem com checkerboard a confirmar transparência real por amostragem de pixel, não apenas visual). Utilizador aprovou as 5 variantes sem pedir regeneração.

| Subject | Estado | Aprovado em | Ficheiro escolhido |
|---|---|---|---|
| `game` | `approved` | 2026-07-17 | `src/assets/images/branding/jb-game.png` |
| `training` | `approved` | 2026-07-17 | `src/assets/images/branding/jb-training.png` |
| `friendly` | `approved` | 2026-07-17 | `src/assets/images/branding/jb-friendly.png` |
| `meeting` | `approved` | 2026-07-17 | `src/assets/images/branding/jb-meeting.png` |
| `other` | `approved` | 2026-07-17 | `src/assets/images/branding/jb-other.png` |

Nota: `meeting` e `other` são visualmente mais ocupados a 56px (mais elementos compostos) do que `game`/`training`/`friendly`, mas ainda legíveis — aprovados nesse estado pelo utilizador sem pedido de simplificação.

### 6.4 Step 4 — exports finais

Fonte PNG 1024×1024 com alpha mantida (`jb-*.png`); exports WebP gerados via `cwebp` (`-q 88 -resize 256 256` para `@1x`, `-q 90 -resize 512 512` para `@2x`) **apenas** após a aprovação da secção 6.3. Verificado com `identify -format '%f %wx%h %[channels]\n' src/assets/images/branding/*`:

```
jb-friendly.png 1024x1024 srgba
jb-friendly@1x.webp 256x256 srgba
jb-friendly@2x.webp 512x512 srgba
jb-game.png 1024x1024 srgba
jb-game@1x.webp 256x256 srgba
jb-game@2x.webp 512x512 srgba
jb-meeting.png 1024x1024 srgba
jb-meeting@1x.webp 256x256 srgba
jb-meeting@2x.webp 512x512 srgba
jb-other.png 1024x1024 srgba
jb-other@1x.webp 256x256 srgba
jb-other@2x.webp 512x512 srgba
jb-training.png 1024x1024 srgba
jb-training@1x.webp 256x256 srgba
jb-training@2x.webp 512x512 srgba
```

Todos os 15 ficheiros (5 subjects × 3 formatos) confirmam 4 canais (`srgba`, alpha preservado nos exports WebP) e as dimensões esperadas.

### 6.5 Nota para a Task 9

Os novos assets vivem em `src/assets/images/branding/` (diretório novo desta task), distinto de `src/assets/images/` onde ficam os `jb-*.png` antigos (agora supersedidos para os cinco subjects de tipo de evento, mas não apagados — `jb-manager.png`, `jb-money.png` e `jb-challenge.png` continuam sem consumidor e fora do âmbito deste plano, ver secção 3). A Task 9 deve importar de `src/assets/images/branding/jb-{game,training,friendly,meeting,other}.png` (ou os exports WebP, conforme o padrão `next/image` já usado no resto do projeto), não dos ficheiros antigos em `src/assets/images/`.
