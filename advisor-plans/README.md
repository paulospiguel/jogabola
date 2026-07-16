# Planos de melhoria para produção

Gerados em 2026-07-16 a partir da auditoria da `release02`. Executar pela ordem abaixo. As quatro primeiras tarefas constituem a **Onda 0 — bloqueadores de lançamento**; as duas últimas são a **Onda 1 — produto e experiência**.

## Ordem e estado

| Plano | Título | Prioridade | Esforço | Depende de | Estado |
|---|---|---:|---:|---|---|
| 001 | Integrar o hardening pronto na release02 | P0 | S | — | TODO |
| 002 | Respeitar consentimento antes de analytics/replay | P0 | M | 001 | TODO |
| 003 | Estabilizar autenticação e logging | P0 | M | 001 | TODO |
| 004 | Tornar a gate de release verde e documentar UAT | P0 | M | 001–003 | TODO |
| 005 | Reforçar confiança e conversão do capitão | P1 | M | 002, 004 | TODO |
| 006 | Tornar o cronómetro seguro para uso em campo | P1 | S | 004 | TODO |

Estados: `TODO`, `IN PROGRESS`, `DONE`, `BLOCKED` ou `REJECTED`.

## Dependências

- O plano 001 reutiliza trabalho já implementado e elimina riscos conhecidos com o menor custo.
- Os planos 002 e 003 partem da release endurecida para evitar conflitos e duplicação.
- O plano 004 só fecha depois das alterações de segurança, porque a gate deve validar o candidato real.
- O plano 005 depende de analytics consentido para medir conversão sem criar nova dívida RGPD.

## Verificação comum

```bash
pnpm lint
pnpm ts-check
pnpm test
pnpm build
```

Sucesso: todos os comandos terminam com exit code 0. O baseline auditado tinha 194 testes a passar, mas o lint falhava.

## Considerado e não priorizado

- Atualizações das duas dependências com advisory moderado: manter no backlog e resolver quando as cadeias Next/Better Auth permitirem, pois não foi encontrado advisory alto/crítico alcançável.
- Novas funcionalidades de gamificação: adiadas até rankings/histórico usarem dados reais e o funil de capitão estar medido.
- Redesign total: não recomendado; a linguagem visual Arena é um ativo e precisa de disciplina, não de reinício.
