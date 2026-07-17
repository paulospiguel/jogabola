# Plano 004: Tornar a gate de release verde e documentar UAT

> **Drift check:** `git diff --stat 2c1eb85..HEAD -- .github/workflows/ci.yml package.json src/components/timer docs/qa`  
> Se a configuração Biome/Vitest mudou, parar e recalcular o baseline.

## Estado

- **Prioridade:** P0
- **Esforço:** M
- **Risco:** Baixo
- **Depende de:** 001, 002, 003
- **Categoria:** testes/DX
- **Planeado em:** `2c1eb85`, 2026-07-16

## Porque importa

O CI chama `pnpm lint`, mas quatro erros mecânicos fazem a gate falhar. O build de produção também não está no workflow. Antes de automatizar E2E autenticado — que exige uma estratégia própria de fixture/session — a release precisa de gates honestas e uma UAT manual repetível.

## Estado atual

- `.github/workflows/ci.yml`: lint, tipos e testes; sem build.
- Erros Biome: import order em `log-card-sheet.tsx`; format em `log-goal-sheet.tsx`, `player-picker.tsx`, `use-match-store.ts`.
- 67 warnings são dívida existente, mas não causam exit 1.
- Vitest só inclui `src/**/*.test.ts` em ambiente node; não fingir que existe Playwright.

## Âmbito

**In:** os quatro ficheiros timer acima, `.github/workflows/ci.yml`, `docs/qa/production-uat.md` (novo).  
**Out:** instalar Playwright, branch protection externa, refactors para eliminar warnings e lógica funcional do timer.

## Passos

1. Executar `npx biome check --write` apenas nos quatro ficheiros e rever diff para garantir alteração exclusivamente mecânica.  
   **Verificar:** `git diff --word-diff` não mostra mudança de strings/lógica.
2. Executar `pnpm lint`; esperado exit 0, ainda podendo listar warnings.
3. Adicionar `pnpm build` ao fim do job `verify` do CI.  
   **Verificar:** YAML válido e execução local dos quatro gates.
4. Criar `docs/qa/production-uat.md` com matriz mobile/desktop e passos: login, onboarding, criar/trocar equipa, evento, convite/RSVP atleta, pagamento, notificações, rankings/histórico demo, timer/torneio e logout. Cada linha tem esperado e campo PASS/FAIL/evidência.

## Verificação final

```bash
pnpm lint
pnpm ts-check
pnpm test
pnpm build
```

Esperado: tudo exit 0 e pelo menos 194 testes. Executar a checklist com conta/ambiente de teste, nunca dados pessoais.

## Done criteria

- [ ] CI contém os quatro gates e fica verde numa branch/PR.
- [ ] Diff dos quatro ficheiros é apenas mecânico.
- [ ] UAT autenticado mobile/desktop tem responsável, data e evidência.
- [ ] Nenhuma dependência E2E ou script inexistente foi adicionado.

## STOP

- Formatter altera semântica ou snapshots.
- Build exige segredo de produção no CI; documentar mock/variável segura em vez de copiar segredo.

## Manutenção

Automação E2E autenticada fica como projeto posterior, após definir seed e sessão de teste sem credenciais pessoais.

