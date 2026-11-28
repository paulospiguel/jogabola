# 4. Calendário competitivo e convocatórias

Data: 2026-11-26

## Estado

Aceite em 2026-11-26, juntamente com o [ADR 0005](0005-club-calendar-authorization.md). Substitui a parte do [ADR 0001](0001-defer-external-league-model.md) que adiava épocas e jogos contra adversários externos.

## Contexto

O [ADR 0001](0001-defer-external-league-model.md) adiou o modelo de liga externa. As convocatórias atuais associam uma equipa a um evento e sustentam reservas, pagamentos, recorrência e partilha com convidados. O primeiro ciclo do AI Club OS precisa de identificar o adversário e a época de um jogo antes de preparar pedidos de disponibilidade.

## Decisão

- O clube agrega equipas. A ligação `teams.club_id` é opcional e começa vazia nas equipas existentes. A adesão ao clube acontece de forma explícita, segundo o ADR 0005.
- Cada época e cada adversário pertence a um clube. O adversário é um registo local com nome próprio, que pode representar uma equipa sem conta na aplicação. A competição é identificada pelo nome no jogo durante o piloto.
- Um `Fixture` pertence a um clube e a uma das suas equipas. Regista a época, o adversário, o nome da competição e o início do jogo. O início é guardado como instante em `timestamptz`. A interface apresenta-o no fuso escolhido para o calendário.
- Um jogo pode referenciar uma convocatória da mesma equipa. Uma tabela de ligação identifica o jogo, a equipa e a convocatória. A relação é opcional, com um máximo de uma ligação por jogo e por convocatória. Os fluxos existentes continuam a resolver as suas convocatórias pelos próprios identificadores e regras de acesso. A associação tem de ser deliberada, pois uma convocatória pode ter um link partilhável.
- O PostgreSQL garante a coerência das associações com chaves estrangeiras compostas para equipa, época e adversário dentro do clube. A tabela de ligação referencia o jogo e a convocatória pela mesma equipa. Os pares referenciados têm uma restrição de unicidade e as colunas da tabela de ligação são obrigatórias. Ao apagar uma convocatória, o PostgreSQL remove a ligação e conserva o jogo. Criar um jogo com uma ligação é uma operação atómica.
- A eliminação definitiva da equipa segue o ciclo de vida atual, incluindo a eliminação em cascata quando se elimina a conta do capitão. Os jogos dessa equipa são removidos juntamente com ela. Clube, épocas, adversários e jogos de outras equipas são preservados. Uma equipa com jogos fica vinculada ao mesmo clube. A remoção de uma época ou adversário em uso é recusada.

## Notas de implementação

- A vinculação da equipa ao clube usa uma chave estrangeira composta `fixtures (team_id, club_id) → teams (id, club_id)` com `ON DELETE CASCADE ON UPDATE RESTRICT`, em vez de um trigger. Como `teams.club_id` faz parte da chave referenciada, o PostgreSQL recusa limpá-la ou alterá-la enquanto houver jogos. A eliminação da equipa remove os seus jogos.
- Época e adversário usam o mesmo padrão com `ON DELETE RESTRICT`. O PostgreSQL reporta estas recusas com SQLSTATE `23503`.
- A ligação `fixture_match_sessions` referencia `fixtures (id, team_id)` e `match_sessions (id, team_id)`, com unicidade por jogo e por convocatória e `ON DELETE CASCADE` nas duas chaves.

## Consequências

A migração acrescenta o modelo de calendário sem atribuir clubes a dados históricos. O novo percurso de criação de jogo pode ser validado ao lado do percurso de criação de convocatória atual. O calendário competitivo e a convocatória têm datas próprias. Uma alteração num registo não altera automaticamente o outro.

Após aceitação, este ADR substitui a parte do ADR 0001 que adiava épocas e jogos contra adversários externos. O adiamento de tabelas classificativas, resultados e estatísticas de competição mantém-se.

## Verificação

- Aplicar a migração numa base vazia e numa cópia sintética anterior, verificando as ligações e os valores das equipas, reservas e pagamentos.
- Criar um jogo competitivo e uma convocatória recreativa. Validar um jogo sem convocatória e outro com uma convocatória da própria equipa.
- Verificar no PostgreSQL a rejeição de uma época ou de um adversário de outro clube, de uma convocatória de outra equipa e de uma segunda associação à mesma convocatória.
- Verificar que uma ligação recusada durante a criação deixa a base sem um jogo residual e que uma equipa com jogos não pode ser desassociada ou transferida para outro clube.
- Verificar que a eliminação autorizada de uma convocatória preserva o jogo competitivo.
- Verificar que a eliminação definitiva da conta do capitão remove a equipa e os seus jogos, preservando o clube e os jogos das restantes equipas.
