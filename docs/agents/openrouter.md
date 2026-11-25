# Provider OpenRouter para agentes locais

O adapter em `src/lib/ai/openrouter.ts` faz pedidos server-side para a API de chat completions do OpenRouter. Não existe rota pública nem integração na interface da app. O único ponto de entrada incluído é um runner manual para desenvolvimento local.

## Configuração

Define `OPENROUTER_API_KEY` e `OPENROUTER_MODEL` no ambiente do processo. Mantém a chave num ficheiro local não versionado ou num gestor de segredos; nunca uses uma variável `NEXT_PUBLIC_*` para a chave.

## Executar localmente

Na raiz do repositório, usando `.env.local`:

```sh
pnpm exec dotenv -e .env.local -- tsx scripts/ai/run-openrouter.ts \
  --prompt "Resume o fluxo de criação de convocatórias."
```

Por omissão, o runner envia apenas as instruções curtas e o prompt. Usa `--context <ficheiro>` para incluir contexto local explicitamente, `--system <texto>` para definir as instruções e `--help` para ver as opções. A resposta sai em stdout. Erros são apresentados sem imprimir a chave, o prompt ou o corpo bruto devolvido pelo fornecedor.

Também podes executar no container local da app. Coloca as variáveis OpenRouter no `.env` local usado pelo Docker Compose e recria o serviço para atualizar o ambiente:

```sh
docker compose up -d --build app
docker compose exec app pnpm exec tsx scripts/ai/run-openrouter.ts \
  --prompt "Resume o fluxo de criação de convocatórias."
```

## Limites e utilização

Cada pedido limita a geração a 512 tokens por omissão. `--max-tokens` permite escolher um valor entre 1 e 2048. O valor limita a saída, mas o custo continua a depender do modelo e do tamanho do contexto enviado.

Os dados de tokens e custo só são expostos no resultado se a chamada incluir `includeUsage: true`. No runner, ativa-os com `--usage` ou `OPENROUTER_INCLUDE_USAGE=true`; são enviados para stderr e não são persistidos pela app. O runner só faz uma chamada quando é invocado explicitamente.

O provider usa timeout de 30 segundos e aceita `AbortSignal`. Erros têm códigos estáveis (`CONFIG_MISSING`, `REQUEST_TIMEOUT`, `REQUEST_ABORTED`, `REQUEST_FAILED`, `UPSTREAM_ERROR`, `INVALID_RESPONSE` ou `EMPTY_RESPONSE`); a mensagem do fornecedor e o corpo de erro não são incluídos.

Referência oficial: [OpenRouter chat completions](https://openrouter.ai/docs/api/api-reference/chat/create-a-chat-completion).
