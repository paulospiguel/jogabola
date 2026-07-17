# Verificação — Arena UI/UX Improvements (Task 11)

> Referente a `docs/superpowers/plans/2026-07-16-arena-ui-ux-improvements.md`, Task 11 (Refinamento visual, performance e responsividade).

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
