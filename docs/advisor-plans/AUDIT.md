# Auditoria de prontidão para produção — JogaBola

**Data:** 2026-07-16  
**Base auditada:** `releases/jogabola-teams/release02` em `73b9c76`, com documentação de agentes em `2c1eb85`  
**Perspetivas:** negócio, co-founder, UX/UI, QA, segurança e operação

## Veredicto executivo

O JogaBola já tem uma identidade visual distinta, uma proposta de valor clara para o capitão e um cronómetro/torneio funcional em contexto mobile. Ainda não deve ser promovido a produção: a branch de hardening já concluída não está integrada, o analytics com gravação de sessão arranca antes do consentimento, o login gera erro de hidratação e o pipeline de CI falha no lint.

Recomendação: **não acrescentar novas funcionalidades antes de fechar a Onda 0**. O caminho mais eficiente é integrar primeiro o trabalho já pronto em `codex/app-hardening-sweep`, corrigir consentimento/autenticação e estabelecer uma gate de release verde. Só depois otimizar aquisição, confiança e ergonomia em campo.

## Cobertura realizada

- Navegação real em mobile e desktop: `/`, `/auth`, `/pricing`, `/roadmap`, `/contact`, `/waitlist`, páginas legais, `/timer` e todo o fluxo `/timer/tournament` até jogo em curso.
- Validação funcional: criação de torneio, início de jogo, cronómetro, registo de golos, agrupamento do mesmo marcador e remoção apenas do golo mais recente.
- Inspeção das rotas protegidas, Server Actions, autenticação, analytics, consentimento, configuração Next.js, CI e testes.
- Verificação: `pnpm ts-check`, `pnpm test` (25 ficheiros/194 testes) e `pnpm build` passam; `pnpm lint` falha com 4 erros, 67 avisos e 6 informações.
- `pnpm audit --prod`: duas vulnerabilidades moderadas transitivas (`esbuild` e `postcss`), sem advisory crítico/alto observado.

Limitação: a segunda passagem visual autenticada não foi possível porque o browser integrado ficou preso na página interna de ligação recusada depois de o servidor terminar entre mensagens; a política do browser bloqueou a recuperação desse separador. Os ecrãs protegidos foram auditados por código e estrutura, mas devem ter UAT autenticado antes do lançamento.

## O que já funciona bem

- A promessa “organizar menos” é compreensível e fala diretamente com a dor do capitão.
- O design Arena é reconhecível, consistente e particularmente forte no cronómetro e no torneio.
- O fluxo de torneio guia bem entre equipas, configuração, sorteio e jogo.
- A alteração pedida para golos está correta: `Rui ×2`, minutos na mesma linha, e remoção apenas do golo mais recente.
- Mobile não apresentou overflow horizontal nas rotas públicas auditadas.
- TypeScript, testes e build de produção têm uma base funcional.

## Achados priorizados

| # | Achado | Categoria | Impacto | Esforço | Risco | Evidência |
|---|---|---|---|---|---|---|
| 1 | Integrar o hardening já concluído antes de lançar | Segurança/correção | Crítico | S | Médio | `codex/app-hardening-sweep` contém 7 commits não presentes em `release02`, incluindo CORS, pagamentos e dados mock |
| 2 | Impedir Statsig, Session Replay e eventos server-side antes do consentimento | RGPD/privacidade | Crítico | M | Médio | `src/providers/index.tsx:24-25`, `src/providers/analytics.tsx:16-23`, `src/lib/analytics-server.ts:49-61`, `src/actions/waitlist.actions.ts:22` |
| 3 | Corrigir o login e remover logging inseguro de autenticação | Autenticação | Alto | M | Médio | `src/constants/app.ts:26`, `src/app/(mobile)/auth/page.tsx:491-498`, `src/lib/auth.ts:48-70` |
| 4 | Tornar a gate de release realmente verde | QA/DX | Alto | M | Baixo | `.github/workflows/ci.yml`; `pnpm lint` falha com 4 erros e 67 avisos |
| 5 | Recuperar confiança e conversão nas páginas públicas | Negócio/UX | Alto | M | Baixo | `src/app/(public)/(website)/contact/page.tsx:14-44`, `pricing/page.tsx:30`; hero principal tem 7 642 px e CTA do hero abaixo da dobra em desktop |
| 6 | Reduzir erros de operação no cronómetro | UX em campo | Médio/alto | S | Baixo | `src/components/timer/log-goal-sheet.tsx:70-76`, `match-controls.tsx:49`, `event-timeline.tsx:28` |
| 7 | Remover PII dos eventos de analytics | Privacidade | Alto | S | Baixo | `src/app/(mobile)/auth/page.tsx:162-165` envia email; `src/actions/waitlist.actions.ts:22` usa email como `distinctId` e nome como metadata |
| 8 | Corrigir links e conteúdos que quebram confiança | Produto/i18n | Médio | S | Baixo | `contact/page.tsx:18-42` tem texto hardcoded e Discord `#`; redes divergem de `src/constants/app.ts:19-25`; `Logo href="home"` em pricing/roadmap |
| 9 | Priorizar imagens acima da dobra | Performance | Médio | S | Baixo | avisos LCP observados no browser para os logótipos e GIF da página de contacto |
| 10 | Criar UAT autenticado repetível | QA | Alto | M/L | Médio | 194 testes sem cobertura browser autenticada observada para onboarding, eventos e pagamentos |

## Observações de negócio e design

### Posicionamento

O público principal está bem escolhido: capitães que organizam jogos recorrentes. Porém, a linguagem mistura Portugal e Brasil — “pelada” aparece repetidamente na experiência PT-PT. Para o mercado inicial, “jogo”, “partida” ou “futebolada” deve ser decidido e usado de forma consistente.

### Conversão

No desktop, o título ocupa cerca de 605 px de altura; o CTA principal do hero só surge abaixo dos 900 px, embora exista um CTA no header. A página completa mede cerca de 7 642 px e repete prova/benefícios antes da conversão. A recomendação é manter a força visual, reduzir 25–35% da altura do hero e colocar promessa, prova verificável e CTA principal na primeira dobra.

### Confiança

“+3 capitães nas últimas 24h” e testemunhos devem ter uma fonte real ou ser claramente marcados como demonstração. A página de contacto contém links mortos/inconsistentes e texto fora do sistema de tradução; estes detalhes têm impacto desproporcionado quando alguém avalia se deve confiar pagamentos e dados da equipa à plataforma.

### Experiência em campo

O cronómetro é a superfície mais convincente do produto. A principal falha encontrada é o marcador: escrever “Rui” e carregar diretamente em “Registar golo” regista o golo sem o nome, sem aviso. O utilizador tem de perceber que precisa primeiro de “Adicionar jogador” e depois selecionar Rui. Em campo, este fluxo deve aceitar Enter/confirmar automaticamente ou explicar explicitamente o passo.

### Produção e observabilidade

O consentimento atual é apenas visual: `AnalyticsProvider` monta antes do banner e ativa autocapture + session replay. Além disso, `trackServerEvent` envia eventos de equipas, eventos, presenças, pagamentos e waitlist sem consultar consentimento; a waitlist usa diretamente email/nome. A correção cliente e servidor é obrigatória antes de tráfego real. O `auth-error.log` síncrono também não é adequado a serverless e pode guardar URL/stack com dados sensíveis; deve ser substituído por logging estruturado e minimizado.

## Direção recomendada após estabilização

1. **Fechar o ciclo do capitão:** medir tempo até criar equipa, primeiro evento, primeira convocatória e primeiro pagamento validado. Otimizar esse funil antes de aumentar o roadmap.
2. **Entrada de atleta sem fricção:** tratar link de convite/RSVP como segundo funil principal, com recuperação clara quando não existe conta ou equipa.
3. **Dados reais antes de gamificação:** rankings e histórico só devem ganhar destaque quando forem alimentados por resultados reais; até lá, a branch de hardening deve rotulá-los como demonstração.
4. **Cronómetro como aquisição:** permitir partilha de resultado/torneio com branding discreto e CTA para criar equipa, transformando uma ferramenta pública útil num canal de aquisição.

## Critério de go-live

Só considerar lançamento quando todos forem verdadeiros:

- hardening integrado na `release02` e conflitos revistos;
- analytics e session replay não executam sem consentimento explícito;
- login sem hydration mismatch nem escrita local de logs;
- lint, tipos, testes e build verdes no CI;
- UAT autenticado de capitão e atleta concluído em mobile e desktop;
- links públicos, contactos, idiomas e alegações de prova revistos;
- rollback, monitorização de erros e responsável de resposta definidos.
