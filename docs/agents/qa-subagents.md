# Subagentes de QA

Estão disponíveis dois agentes especializados para Claude Code e Codex. Recolhem
evidências e comunicam conclusões ao agente principal; este mantém a
responsabilidade pelas correções e pela verificação final.

## Escolher um especialista

| Agente | Usar para | Evidência principal |
| --- | --- | --- |
| `qa-integration-database` | Server Actions, autenticação e autorização, persistência Drizzle/Postgres, migrações, integrações de pagamentos/notificações, repetição de pedidos e concorrência. | Testes Vitest existentes, análise dirigida do código, verificações de schema/migrações e comandos locais seguros. |
| `qa-journeys-ui` | Percursos completos na aplicação, transições entre páginas, estados de carregamento/erro/vazio/sucesso, navegação, localização, acessibilidade e comportamento responsivo. | Testes existentes, análise de rotas/componentes, evidência do browser quando houver browser e ambiente de teste seguros, e `docs/qa/production-uat.md`. |

Quando a alteração atravessar ambas as áreas, o agente principal atribui um
âmbito distinto a cada especialista. Por exemplo, o agente de integração
verifica se uma resposta RSVP é persistida e respeita as permissões; o agente de
percursos verifica se o atleta encontra o convite, submete a resposta e percebe
o estado apresentado. O agente principal combina os resultados e resolve
eventuais sobreposições.

Exemplo de atribuição: “Usa `qa-integration-database` para verificar a
persistência e as permissões da resposta RSVP; usa `qa-journeys-ui` apenas para
verificar a descoberta do convite, a submissão e o feedback em mobile e
desktop. Ambos devem ser apenas de leitura e devolver comandos e evidências.”

## Regras comuns

- Começa pelo diff real e pelo estado de trabalho não confirmado. Preserva as
  alterações do utilizador e distingue problemas preexistentes de regressões
  introduzidas pela tarefa.
- Lê `AGENTS.md` e `.agents/context/CONTEXT.md`; consulta também as partes relevantes de
  `.agents/context/PRODUCT.md`, `.agents/context/DESIGN.md`, `docs/adr/` e da checklist UAT quando a tarefa lhes
  diz respeito.
- Segue os padrões Vitest existentes. Prefere o comando mais específico que
  demonstre uma conclusão, como `pnpm exec vitest run <ficheiro-de-teste>`.
  Não instales dependências nem introduzas outra infraestrutura de testes numa
  revisão de QA.
- Não alteres código da aplicação, testes, schema, migrações, configuração nem
  documentação. Devolve ao agente principal as lacunas e os casos de regressão
  sugeridos. O agente principal pode autorizar a implementação separadamente.
- Estas instruções definem o comportamento, mas não criam isolamento técnico:
  agentes Codex herdam as permissões do agente principal e a shell Bash pode
  executar comandos de escrita. O agente principal escolhe o modo de
  permissões; mantém o checkout sem alterações e limita escritas de teste à
  base de dados na stack descartável.
- Não leias nem imprimas valores secretos de `.env*`, configurações de CI ou do
  ambiente da shell. Não contactes serviços de produção nem uses contas reais,
  pagamentos ou dados pessoais.
- Considera os comandos de base de dados operações de escrita. Não executes
  `pnpm db:push`, `pnpm db:migration` nem outras escritas contra uma base de
  dados fora da stack local descartável descrita abaixo. Não uses um valor
  `DATABASE_URL` vindo do ambiente da shell, de ficheiros `.env` ou de serviços
  externos.
- Não afirmes ter verificado o browser sem observar a aplicação em execução.
  Se não houver automação de browser ou ambiente de teste seguro, indica essa
  limitação e usa apenas evidências de código e testes.
- Não invoques nem cries outro agente. Estes perfis são folhas de revisão.

## Stack local descartável

O `docker-compose.yml` é o ambiente local de integração: inicia uma base de
dados Postgres local, Mailpit e a aplicação com credenciais exclusivas para
desenvolvimento; a app executa `pnpm db:local-setup` na inicialização. Esta é a
única base de dados em que os especialistas podem executar escritas sem pedir
confirmação adicional. Nunca apontes estes comandos para um `DATABASE_URL`
externo.

Antes de iniciar, confirma que as portas locais `3000`, `5432`, `1025` e `8025`
estão disponíveis. Usa um nome de projecto Compose dedicado para manter os
volumes separados de outros ambientes locais. Se os dois especialistas
precisarem da mesma stack em paralelo, o agente principal inicia-a uma vez e
coordena a limpeza depois de ambos terminarem.

```sh
set -e
project="jogabola-qa-$(date +%s)-$$"
cleanup() { docker compose -p "$project" down --volumes --remove-orphans; }
trap cleanup EXIT
docker compose -p "$project" up --build -d
curl --fail --silent --retry 40 --retry-delay 3 --retry-all-errors --max-time 60 http://localhost:3000/api/auth/get-session
# Executa apenas quando a alteração envolve autenticação OTP ou entrega de email:
node scripts/smoke-local.mjs
```

O smoke test cria uma conta sintética e valida o fluxo OTP através do Mailpit;
os volumes da stack devem ser removidos no fim. Se a stack não iniciar ou uma
porta estiver ocupada, regista o bloqueio. Nunca pares nem removas serviços de
outro projecto Compose.

## Formato de passagem

Devolve um relatório conciso, nesta ordem:

1. **Âmbito:** ficheiros ou percurso inspecionado e diff/commit comparado.
2. **Problemas encontrados:** primeiro os de maior severidade. Para cada um,
   inclui severidade (`Bloqueador`, `Alta`, `Média` ou `Baixa`), ficheiro e
   símbolo/linha, comportamento observado, comportamento esperado e passos ou
   caso de teste que o reproduzam.
3. **Verificações:** comandos ou passos de browser exactos e resultado:
   passou, falhou ou bloqueado.
4. **Limitações:** comportamento não testado e motivo.

Só reporta defeitos confirmados como problemas encontrados. Identifica
preocupações plausíveis ainda não reproduzidas como riscos ou questões, e diz
explicitamente quando não foram encontrados defeitos confirmados no âmbito
inspecionado.
