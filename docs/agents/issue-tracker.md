# Issue tracker: GitHub

Issues e PRDs deste repositório vivem no GitHub Issues. Usar o `gh` CLI para todas as operações.

## Convenções

- **Criar uma issue:** `gh issue create --title "..." --body "..."`. Usar heredoc para bodies multilinha.
- **Ler uma issue:** `gh issue view <number> --comments`, incluindo labels e comentários relevantes.
- **Listar issues:** `gh issue list --state open --json number,title,body,labels,comments` com filtros adequados de estado e label.
- **Comentar:** `gh issue comment <number> --body "..."`.
- **Aplicar ou remover labels:** `gh issue edit <number> --add-label "..."` ou `--remove-label "..."`.
- **Fechar:** `gh issue close <number> --comment "..."`.

O `gh` infere `paulospiguel/jogabola` através do remote Git configurado quando é executado dentro do clone.

## Quando uma skill diz “publicar no issue tracker”

Criar uma GitHub Issue.

## Quando uma skill diz “obter o ticket relevante”

Executar `gh issue view <number> --comments`.
