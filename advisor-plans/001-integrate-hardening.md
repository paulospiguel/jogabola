# Plano 001: Integrar o hardening pronto na release02

> **Executor:** executar numa worktree nova. Não fazer `pull`, não reutilizar branches ocupadas e não reimplementar os sete commits.
>
> **Drift check:**
> ```bash
> test "$(git rev-parse releases/jogabola-teams/release02)" = "73b9c760e85eaf48a5811cb387d57bc166123cd1"
> test "$(git rev-parse codex/app-hardening-sweep)" = "1068b27021d974e5e35b77e1ba4d2f8a8ebb22e8"
> ```
> Esperado: ambos exit 0. Caso contrário, **PARAR** e rever o diff novo.

## Estado

- **Prioridade:** P0
- **Esforço:** S
- **Risco:** Médio
- **Depende de:** nenhum
- **Categoria:** segurança/correção
- **Planeado em:** `2c1eb85`, 2026-07-16

## Porque importa

Sete commits de hardening estão completos, mas ausentes da release. Incluem CORS, aprovação de pagamentos, mocks honestos, observabilidade e separação das actions de pagamentos. Integrá-los é o maior ganho por hora.

## Estado atual e convenções

- Release: `73b9c76`; hardening: `1068b27`.
- Ordem dos commits: `19df824`, `05ff559`, `51039c9`, `a9130eb`, `108bbf0`, `bb6aa2d`, `1068b27`.
- `next.config.ts:49-58` ainda publica CORS global.
- Preservar `73b9c76`, que contém agrupamento/remoção de golos já verificado.
- Git usa commits convencionais; exemplo: `feat(timer): group same-player goals into one timeline line`.

## Âmbito

**Incluído:** `.env.example`, `README.md`, `next.config.ts`, actions de attendance/payment/profile, `src/actions/payments/*`, rankings/historical, `src/components/ui/slider.tsx`, `src/hooks/use-event-chat.ts`, `src/lib/{notion,safe-error,utils}.ts`, testes de payments/safe-error e quatro locales.  
**Excluído:** schemas/migrations, componentes do cronómetro e qualquer commit posterior aos SHAs auditados.

## Git workflow

```bash
git worktree add ../jogabola-release02-hardening -b codex/release02-production-hardening 73b9c76
cd ../jogabola-release02-hardening
git merge --no-ff 1068b27 -m "merge: integrate production hardening into release02"
```

Não fazer push/PR sem instrução do operador.

## Passos e verificações

1. Executar drift check e criar a worktree acima.  
   **Verificar:** `git status --short` → vazio.
2. Fazer o merge. Se houver conflito, preservar simultaneamente hardening e `73b9c76`; conflito de regras de negócio é STOP.  
   **Verificar:** `git merge-base --is-ancestor 1068b27 HEAD` → exit 0.
3. Instalar e validar comportamento:
   ```bash
   pnpm install --frozen-lockfile
   pnpm ts-check
   pnpm test
   pnpm build
   git grep 'Access-Control-Allow-Origin' -- next.config.ts
   ```
   Esperado: três gates exit 0 e grep vazio.
4. Validar apenas ficheiros TypeScript alterados pelo merge:
   ```bash
   git diff --name-only 73b9c76..HEAD -- '*.ts' '*.tsx' | xargs npx biome check
   ```
   Esperado: exit 0. O lint global mantém 4 erros de formatação preexistentes até ao plano 004; o merge não pode aumentar esse número.
5. Smoke manual: `/auth`, `/timer`, torneio, rankings/histórico e upload/revisão de pagamento.  
   **Verificar:** sem erro novo na consola; dados mock identificados como demonstração.

## Test plan

- Executar os 194+ testes existentes, incluindo `payments.auth.test.ts` e `safe-error.test.ts` introduzido pelo hardening.
- Confirmar que `timeline-items.test.ts` continua a cobrir agrupamento/remoção do último golo.

## Done criteria

- [ ] Hardening é ancestral de HEAD e `73b9c76` continua ancestral.
- [ ] Tipos, testes, build e Biome do diff passam.
- [ ] CORS global removido; pagamentos não confiam em veredicto do cliente.
- [ ] `git status --short` não mostra alterações inesperadas.

## STOP

- Qualquer SHA do drift check mudou.
- Conflito em pagamentos, autorização, locales ou cronómetro sem resolução inequívoca.
- Um teste de segurança precisaria de ser enfraquecido para passar.

## Manutenção

Depois do merge, os planos seguintes devem partir desta branch. Remover a worktree temporária apenas após integração/PR concluído.
