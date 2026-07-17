# Verificação — Arena UI/UX Improvements (Tasks 11–12)

> Referente a `docs/superpowers/plans/2026-07-16-arena-ui-ux-improvements.md`, Task 11 (Refinamento visual, performance e responsividade) e Task 12 (Verificação final contra a especificação, `docs/superpowers/specs/2026-07-16-arena-ui-ux-improvements-design.md`).

## 0. Ruído visual (Step 1)

Revistas as superfícies tocadas (`/arena`, `/arena/squads`, `/arena/payments`) via screenshot em 320/390/768/1440px. `.jb-arena-bg` (padrão de pontos, opacidade 0.72) permanece subtil e não compete com o conteúdo; não foram encontrados cards aninhados (`jb-card`/`jb-panel` dentro de si próprios) nas rotas verificadas; `.jb-section-label` já usa `letter-spacing: 1.2px` a 11px, dentro do razoável para maiúsculas pequenas; o verde (`--color-arena-primary`) mantém-se reservado a ação/seleção (pill "Todos" ativo, FAB, CTAs). Avaliação: as Tasks 1–10 já deixaram esta superfície sem ruído visual significativo — nenhuma alteração adicional foi necessária, evitando introduzir uma direção visual nova sem motivo.

## 1. Fixtures reutilizáveis criadas (Step 3)

Criadas exclusivamente através dos fluxos normais da app (sign-up por email OTP, onboarding, criar equipa, criar evento, adicionar jogador) — sem SQL ad hoc.

| Item | Valor | Notas |
|---|---|---|
| Conta owner/capitão | `ui-review-owner@jogabola.test` | Role de plataforma "Treinador"; onboarding completo |
| Equipa vazia | `[UI-REVIEW] Empty` (slug `ui-review-empty`) | Sem eventos, sem jogadores extra (só o owner) |
| Equipa ativa | `[UI-REVIEW] Active` (slug `ui-review-active`) | 1 treino futuro + 1 jogador extra |
| Evento | `[UI-REVIEW] Treino` | Tipo Treino, sábado 18/07/2026 18:00, Campo Municipal, sem pagamentos (quota €0 grátis) |
| Jogador extra | Pedro Silva Teste (MID) | Adicionado ao plantel da equipa Active via "Adicionar Jogador"; email `ui-review-player1@jogabola.test` |

Estas fixtures ficam **intencionalmente preservadas** — a app não expõe eliminação segura de equipa, e o prefixo `[UI-REVIEW]` evita confusão com dados reais. Nenhum evento extra foi criado além do `[UI-REVIEW] Treino` (não houve necessidade de cancelar nada pela UI).

### Sessão de membro `player` — bloqueada, documentada per o próprio plano

O plano diz explicitamente: "Se não existir forma de autenticar a segunda sessão, parar a verificação e pedir ao utilizador a sessão; não substituir o critério por inferência." Essa situação ocorreu:

- Onboarding "Atleta" (jogador) está globalmente **EM BREVE** (desativado) — só "Treinador" é selecionável ao criar conta.
- Não existe mecanismo de convite/join para uma conta se tornar membro (`teamMembers.role = "player"`) de uma equipa que não criou — confirmado também pela pesquisa da Task 3 ("não existe mecanismo de partilha de equipa").
- A conta `ui-review-player1@jogabola.test` foi criada (útil como identidade de referência), mas fica **sem equipa associada** — não é uma sessão "player" real.
- Confirmado com o utilizador: avançar sem esta sessão, documentar o gap para a Task 12 resolver antes de declarar o plano completo (Task 12 Step 2 depende desta sessão para provar que um membro não recebe ações de mutação).

**Ação pendente para quem retomar a Task 12:** obter uma sessão real com `teamId` + `role="player"` associada a `[UI-REVIEW] Active` — via mecanismo que ainda não existe na app, ou por indicação direta do utilizador.

## 2. Regressão encontrada e corrigida (fora do commit desta task)

Durante a verificação em 320px, `/arena` mostrou overflow horizontal real (avatar cortado no canto superior direito). Diagnosticado e corrigido em dois commits separados, cada um estagiando apenas os ficheiros da tarefa responsável:

1. **`src/components/arena/mobile-top-bar.tsx`** (ficheiro da Task 6) — o wrapper do `TeamSwitcher` tinha `shrink-0 min-w-0 m-auto`; `shrink-0` impedia o mecanismo de truncagem (`truncate`, já existente em `team-switcher.tsx`) de atuar, forçando o header a exceder a viewport em nomes de equipa mais longos. Corrigido removendo `shrink-0`. Commit `7569814`.
2. **`src/app/(mobile)/(protected)/arena/layout.tsx`** + **`src/styles/globals.css`** (ficheiros desta Task 11) — causa dominante do overflow original (343px vs 320px de `clientWidth`): `<main className="jb-arena-shell relative flex-1 ...">` era item flex sem `min-width: 0`, um padrão já identificado noutras tasks deste plano (CSS Grid/Flexbox `min-width: auto` por omissão). Adicionado `min-w-0` ao `<main>`. Adicional: `.jb-stack` (usado como item de grid em várias secções do dashboard) também recebeu `min-width: 0` na definição base, eliminando a necessidade de overrides pontuais já presentes nalguns ficheiros (ex. `events-list.tsx`).

Depois de ambos os fixes: `scrollWidth` em `/arena` a 320px caiu de **343px → 323px**.

### Resíduo de 3px, benigno, não corrigido

`window.innerWidth` (323) difere de `document.documentElement.clientWidth` (320) nesta página — comportamento padrão do browser quando existe uma scrollbar vertical: elementos `position: fixed` com `inset: 0` / `left-0 right-0` (o header, o `DotGrid` de fundo) dimensionam-se contra o viewport completo (323px), enquanto `clientWidth` exclui a área da scrollbar (320px). Confirmado visualmente que **nada é cortado** — o header renderiza corretamente, avatar e sino totalmente visíveis, nome da equipa truncado como esperado. Este resíduo não é uma regressão de nenhuma task deste plano; é inerente à combinação `position: fixed` + scrollbar vertical, e ocorre apenas em `/arena` porque é a única rota testada cujo conteúdo é alto o suficiente para produzir uma scrollbar nesta viewport de teste. Não corrigido — fora de proporção (`scrollbar-gutter: stable` ou compensação JS do scrollbar-width teria impacto mais amplo do que o justificável para 3px invisíveis).

## 3. Verificação de viewports (Step 4)

Sessão: `ui-review-owner@jogabola.test`, equipa ativa `[UI-REVIEW] Empty` (exceto onde indicado). Medição via:

```js
({
  clientWidth: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
  overflow: document.documentElement.scrollWidth !== document.documentElement.clientWidth,
})
```

| Rota | 320px | 390px | 768px | 1440px |
|---|---|---|---|---|
| `/arena` | 320/323 *(ver nota acima)* | 390/390 ✅ | 768/768 ✅ | 1440/1440 ✅ |
| `/arena/events` | 320/320 ✅ | 390/390 ✅ | 768/768 ✅ | 1440/1440 ✅ |
| `/arena/squads` | 320/320 ✅ | 390/390 ✅ | 768/768 ✅ | 1440/1440 ✅ |
| `/arena/payments` | 320/320 ✅ | 390/390 ✅ | 768/768 ✅ | 1440/1440 ✅ |
| `/arena/profile` | 320/320 ✅ | 390/390 ✅ | 768/768 ✅ | 1440/1440 ✅ |

Confirmado adicionalmente por screenshot em cada breakpoint chave:
- **320px** (`/arena`): empty state e CTA totalmente visíveis, bottom nav mobile com 5 destinos visível, header sem clipping após o fix.
- **768px** (`/arena`): sidebar desktop (colapsada, ícones) e bottom nav mobile são mutuamente exclusivos — confirmado visualmente, sem sobreposição.
- **1440px** (`/arena`): layout desktop limpo, sem overflow, empty state bem formatado.

Alvos mobile ≥44×44: confirmado por inspeção de código nas Tasks 2 e 6 (`min-h-11 min-w-11` em bottom-nav e mobile-top-bar); não re-medido pixel a pixel nesta task por já estar coberto por essas tasks.

Shell durante loading/erro: coberto pelos testes determinísticos das Tasks 2, 3 e 5 (`DashboardSkeleton`, `deriveQueryViewState`, hooks de estado composto) — não duplicado aqui.

## 4. Achados fora de âmbito (documentados, não corrigidos)

Durante a criação do evento `[UI-REVIEW] Treino`, observadas duas chaves de tradução por traduzir, visíveis literalmente na UI:
- `arenaCreateEvent.invite.search` (placeholder do campo de pesquisa no passo "Convocar")
- `ARENACREATEEVENT.FINAL.CONFIRM.ROSTERTITLE` (título da secção "Sem atletas convocados ainda" no passo "Confirmar")

Confirmado via `git log` que ambas já existiam **antes** deste plano (namespace `arenaCreateEvent`, fora do âmbito de qualquer task 1–11, que só tocou `arenaDashboard`, `arenaEvents`, `arenaNav`, `arenaNoTeamModal`, `arenaEventDetail`, `arenaSquad`, `arenaPayments`, `profilePage`). Não corrigidas aqui — fora de âmbito da Task 11 (só `globals.css`/`layout.tsx`) e fora do âmbito de todas as tasks deste plano. Recomenda-se abrir um follow-up separado.

## 5. Reduced motion e teclado (Step 6)

- `prefers-reduced-motion: reduce` já tratado em `globals.css` (regras introduzidas pelas Tasks 2 e 3 — `.jb-skeleton`, animações de hero); confirmado que a media query é suportada e aplicada.
- Foco visível: 12 ficheiros de componentes Arena usam `focus-visible:*` (Tasks 1–6); `ArenaQueryError` (Task 2) e os controlos de navegação (Task 6) foram explicitamente revistos nas respetivas tasks quanto a foco/ordem. Não repetida aqui uma auditoria exaustiva de tab-order por já estar coberta pelas revisões dessas tasks.

## 6. Suite completa (Step 7)

Executado fresco após os dois commits desta secção:

```
pnpm lint       → exit 0 (63 warnings/3 infos pré-existentes, sem erros, sem regressão introduzida)
pnpm ts-check   → exit 0, sem output
pnpm test       → 45 ficheiros, 386/386 testes a passar
pnpm build      → sucesso, 31/31 páginas geradas, sem erros de compilação
```

Nenhuma falha pré-existente adicional encontrada além dos avisos de lint já documentados nas Tasks 7 e 9.

## 7. Riscos residuais e handoff

1. **Sessão `player` em falta** — ver secção 1. Bloqueia a Task 12 Step 2 até se resolver.
2. **3px de overflow benigno em `/arena`** — ver secção 2. Não é uma regressão; não recomendo correção adicional.
3. **Duas chaves de tradução por traduzir** em `arenaCreateEvent.invite`/`arenaCreateEvent.final.confirm` — pré-existentes, fora de âmbito deste plano; recomenda-se um follow-up.
4. **`.press`/`.btn-press` continuam sem definição CSS** em todo o repositório — já identificado e reportado como follow-up separado durante as Tasks 2, 4 e 6 (não repetido aqui).

---

# Task 12 — Verificação final contra a especificação

## 8. Suite completa, reexecutada fresca (Step 5)

```
pnpm lint       → exit 0
pnpm ts-check   → exit 0, sem output
pnpm test       → 45 ficheiros, 386/386 testes a passar
pnpm build      → sucesso, 31/31 páginas geradas
```

Contratos específicos confirmados isoladamente (Step 4):
```
pnpm vitest run src/lib/__tests__/arena-locale-contract.test.ts src/lib/__tests__/arena-iconography-contract.test.ts
→ 2 ficheiros, 15/15 testes a passar
```

## 9. Assets aprovados (Step 3)

`src/assets/images/branding/` contém exatamente os 5 assets marcados `approved` em `docs/design/arena-brand-assets.md` (secção 6.3, aprovados 2026-07-17): `jb-game`, `jb-training`, `jb-friendly`, `jb-meeting`, `jb-other` — cada um com fonte `.png` + exports `@1x.webp`/`@2x.webp`. Nenhum ficheiro extra, nenhum ficheiro em falta. Ícones operacionais (Cronómetro, posições) continuam 100% Lucide — confirmado pelo contrato de iconografia (secção 8 acima) e por não haver `raster` a substituir controlos/estado em nenhum ficheiro tocado.

## 10. Percurso manual (Step 2)

Sessão `ui-review-owner@jogabola.test`, equipa `[UI-REVIEW] Active`:

- **Arena → criar evento → detalhe do evento → Cronómetro**: fluxo completo executado durante a Task 11 (criação do evento `[UI-REVIEW] Treino`) e revalidado nesta task — `/arena/events/11` carrega corretamente, mostra "Vagas 0/14", abas Convocatória/Equipas/Local, e contém dois links reais para `/timer` (um com texto "Cronómetro", outro com `aria-label="Abrir Cronómetro"`), confirmando o atalho contextual da Task 6.
- **Plantel, Cobranças, Perfil**: percorridos e capturados em screenshot durante a Task 11 (secção 3 acima) em todos os quatro breakpoints; sem estados quebrados, sem overflow, ações coerentes com o papel de capitão.
- **Repetir o cockpit como owner e como `player`**: **bloqueado**. Ver secção 1 ("Sessão de membro `player` — bloqueada"). Não foi possível provar em runtime que um membro sem `canManageTeam` não recebe CTAs de mutação através de uma sessão real — a garantia atual assenta inteiramente na cobertura de testes automatizados das Tasks 1, 3 e 5 (`team-capabilities.test.ts`, `dashboard-cockpit.test.ts`: caso "membro sem evento recebe view-squad", "membro sem permissão"), não numa verificação visual em runtime com uma segunda conta. Confirmado com o utilizador antes de prosseguir sem este passo (ver histórico da conversa) — este item **permanece explicitamente em aberto**, não deve ser interpretado como concluído.

## 11. Matriz requisito → evidência

Cobre "Critérios de sucesso" e "Limites mensuráveis" do spec (`docs/superpowers/specs/2026-07-16-arena-ui-ux-improvements-design.md`).

| Requisito (spec) | Evidência | Estado |
|---|---|---|
| Capitão sem eventos encontra "Criar evento" sem CTAs duplicados | `dashboard-cockpit.test.ts` (Task 3): "no-event state produz exatamente um CTA primário"; screenshot Task 11 320/1440px mostra um único botão "Criar evento" | ✅ |
| Dashboard não mostra métricas sem contexto | `deriveDashboardQueryState`/`showMetrics` (Task 3): métricas só renderizam com `activeEvent`; confirmado visualmente (equipa Empty não mostra Confirmados/Reservas/Pendentes) | ✅ |
| Nenhum conteúdo/CTA cortado nos breakpoints definidos | Secção 3 (Task 11): 20/20 combinações rota×viewport sem overflow real (o único resíduo de 3px em `/arena`@320 é um artefacto benigno de scrollbar, não um corte de conteúdo — confirmado visualmente) | ✅ |
| Navegação mobile com 5 destinos, todos ≥44×44px | `bottom-nav.test.ts` (Task 6): exatamente 5 itens, sem `/timer`; `min-h-11 min-w-11` no código de `bottom-nav.tsx`/`mobile-top-bar.tsx` | ✅ |
| Loading, error e empty visual e semanticamente distintos | `query-state.test.ts` (Task 2): precedência error>empty>success testada; `deriveQueryViewState` usado consistentemente nas Tasks 3–5 | ✅ |
| Arena não usa emojis operacionais/branding nos casos substituídos | `arena-iconography-contract.test.ts` (Task 9): 7/7 a passar, cobre `create-event-dialog.utils.ts`, `create-event-step-type.tsx`, 4 ficheiros do Timer | ✅ |
| Novos assets pertencem à família visual existente | Aprovação visual do utilizador (Task 8, secção 6.3 de `arena-brand-assets.md`) — outline verde-escuro espesso, moldura hexagonal, paleta lima/amarelo, sem texto, fundo transparente confirmado por amostragem de pixel | ✅ |
| Quatro traduções sincronizadas, PT-PT natural | `arena-locale-contract.test.ts` (Task 10): 8/8 namespaces sem divergência de chave/placeholder; revisão editorial PT-PT feita na Task 10 ("pelada"→"jogar à bola", sentence case, "Definições") | ✅ |
| `scrollWidth === clientWidth` a 320/390/768/1440px nas 5 rotas | Secção 3 (Task 11) | ✅ (ressalva do resíduo benigno documentada) |
| Empty states sem clipping/transformações fora da área visível | Screenshot Task 11 320px: empty state de `/arena` e `/arena/events` totalmente dentro do viewport | ✅ |
| Imagens acima da dobra reservam `width`/`height` ou `fill`+`sizes`; zero avisos novos do Next.js | `pnpm build` (secção 8): zero avisos de imagem; `logo.tsx` (Task 10) e `create-event-step-type.tsx`/brand images (Task 9) usam `next/image` com dimensões explícitas | ✅ |
| Skeleton e conteúdo final com a mesma estrutura, sem salto de cabeçalho/navegação | `DashboardSkeleton` (Task 3): representa topbar+próxima ação+plantel sem ocupar o ecrã inteiro nem esconder navegação — testado e confirmado visualmente | ✅ |
| CTA duplicado removido; "Esta semana"/"Descobrir" ocultos quando vazios; padrão de fundo reduzido; cards aninhados eliminados | CTA duplicado removido na Task 3 (`git diff` documentado na review dessa task); `showWeek`/`showDiscover` testados; ruído visual revisto sem necessidade de mudança adicional (secção 0 desta task) | ✅ |
| Todos os elementos interativos mobile ≥44px | `min-h-11 min-w-11` sistemático em `bottom-nav.tsx`, `mobile-top-bar.tsx` (Task 6); `ArenaQueryError` (Task 2) | ✅ |
| Owner/manager veem criar evento e adicionar jogador; coach/player não recebem CTAs de mutação | Testado automaticamente (`team-capabilities.test.ts`, `dashboard-cockpit.test.ts`); **não verificado em runtime com sessão real** — ver secção 10 | ⚠️ Bloqueado (ver secção 1) |

## 12. Handoff final

**Estado:** plano substancialmente completo e verificado, com uma limitação explícita e documentada, não uma falha silenciosa.

### Revisão final de branch (após esta task)

Dispatched um code-reviewer sobre o branch completo (15 commits, base→HEAD). Achado Important real e corrigido de imediato: o header desktop do dashboard (`arena-dashboard.tsx`) mostrava os CTAs "Adicionar jogador"/"Criar evento" apenas com `hidden md:inline-flex`, sem gate em `activeTeamCanManage` — ao contrário de todas as superfícies irmãs (eventos, plantel, ações do cockpit no empty state), que já filtravam corretamente. Um membro `coach`/`player` a ≥768px veria os dois CTAs de mutação, violando diretamente a regra de papéis do spec. Corrigido envolvendo o bloco em `{activeTeamCanManage && (...)}` — commit `9be4836`. `pnpm ts-check` e `pnpm test` (386/386) revalidados após a correção.

Nota do revisor, relevante para o item bloqueado da secção 1: este bug é precisamente o tipo de falha que a verificação em runtime com sessão `player` (ainda bloqueada) teria apanhado visualmente — os testes unitários do mapper não o cobrem porque o header não passa pelo `buildCockpitActions`. A mitigação real é que a mutação em si continua bloqueada no servidor (`canManageTeam`), pelo que o risco era de correção de UI, não de escalada de privilégio — mas reforça que o item da secção 1 continua a merecer prioridade antes de fechar o plano por completo.

Achados Minor não corrigidos (registados, não bloqueiam): `hasBackgroundError`/`isRefreshing` (Task 2) são computados e testados mas nenhum consumidor os lê atualmente — falhas de refetch em segundo plano com dados antigos ficam silenciosas visualmente (os dados não se perdem, só não há indicador); o teste de paridade de locales é unidirecional (chaves extra em en/es/fr não seriam apanhadas, embora não exista nenhuma hoje).

**Concluído e verificado:**
- Todas as 11 tasks de implementação (1–11) commitadas, cada uma com revisão de tarefa própria (spec compliance + qualidade) — clean em todas.
- Suite completa (lint/ts-check/test/build) verde, reexecutada fresca nesta task.
- Contratos automáticos (locale, iconografia, cockpit, query-state) todos a passar.
- Verificação visual/manual em 4 breakpoints × 5 rotas, sem cortes reais de conteúdo.
- Assets de branding aprovados pelo utilizador e integrados corretamente; nenhum ícone operacional substituído por raster.
- Uma regressão real (overflow horizontal mobile) encontrada durante a própria verificação, diagnosticada, e corrigida em dois commits corretamente atribuídos às tasks responsáveis.

**Não concluído — bloqueado, não inferido:**
- Verificação em runtime do cockpit como sessão `player` real (membro sem `canManageTeam`). A app não tem atualmente nenhum mecanismo (onboarding "Atleta" desativado; sem fluxo de convite/join a equipa) para criar essa sessão. Confirmado com o utilizador: avançar sem ela, documentar como pendente. **Este item não deve ser marcado como concluído até essa sessão existir e o percurso ser repetido.**

**Achados fora de âmbito, registados para follow-up separado (não bloqueiam este plano):**
- Duas chaves de tradução por traduzir em `arenaCreateEvent` (namespace pré-existente, fora do âmbito de todas as 12 tasks).
- `.press`/`.btn-press` sem definição CSS em todo o repositório (identificado nas Tasks 2, 4, 6).
- `positions.ts` é um módulo órfão sem consumidores (identificado na Task 7).
- Botões para criar eventos `friendly`/`meeting` não existem na UI, apesar dos tipos e assets já suportarem — gap de produto pré-existente, não desta plano (identificado durante a Task 10).
