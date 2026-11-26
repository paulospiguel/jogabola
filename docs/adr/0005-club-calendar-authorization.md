# 5. Autorização do calendário competitivo

Data: 2026-11-26

## Estado

Aceite em 2026-11-26.

## Contexto

O controlo atual é por equipa. O capitão é proprietário da equipa e o co-capitão tem o papel `manager`. A leitura de uma convocatória também suporta o acesso por link para convidados. Os dados do calendário competitivo exigem uma verificação própria no servidor.

## Decisão

O clube tem membros com papel `admin` ou `member` e um único vínculo por utilizador e clube. O PostgreSQL aplica ambas as restrições. A criação de um clube atribui ao criador a primeira administração. Para o piloto, a criação do clube e a associação da primeira equipa decorrem na mesma transação, a pedido de quem já é proprietário dessa equipa. A associação posterior de uma equipa exige que o interveniente seja administrador do clube de destino e proprietário da equipa. A equipa tem de estar livre, com essa condição verificada na escrita para impedir associações em simultâneo. A atribuição e remoção dos restantes vínculos do piloto usam dados sintéticos. O fluxo de convites ao clube terá decisão própria antes de alargar o piloto.

| Ação | Condição |
| --- | --- |
| Ler um jogo privado | Ser membro do clube e ter um vínculo à equipa do jogo validado pelo servidor. |
| Criar um jogo ou associar uma convocatória | Ser membro do clube e proprietário da equipa. |
| Gerir épocas e adversários do clube | Ser administrador do clube. |
| Gerir uma convocatória | Aplicar as permissões atuais dessa operação na equipa. |

As Server Actions obtêm a identidade da sessão e validam os dados de entrada. Para consultas, filtram a autorização na consulta que devolve os dados. Para mutações, verificam a autorização e o âmbito na operação de escrita ou na mesma transação com as garantias de concorrência necessárias. Nas operações por identificador, o âmbito é obtido a partir do registo persistido. A aplicação devolve a mesma resposta para jogos inexistentes e jogos privados fora do âmbito autorizado.

As leituras de jogos devolvem apenas os dados necessários ao calendário. Consultas de convocatórias, páginas de convidados e respetivos objetos de resposta não incluem dados competitivos. Se o capitão associar uma convocatória partilhável, os dados que já pertencem à convocatória continuam sujeitos às regras do link. A leitura por um membro do plantel depende de proteger as entradas atuais de escrita em `team_members` contra alterações por utilizadores sem autorização de gestão. A revisão deve incluir `addTeamMember` e `addPlayerToRoster`. Esta proteção é um pré-requisito para ligar a leitura competitiva à aplicação. As permissões do staff virtual ficam para o ADR da etapa 3.

## Consequências

A pertença a um clube e o vínculo à equipa são verificados separadamente. O acesso de escrita do piloto usa a propriedade da equipa registada na base de dados. O co-capitão mantém as permissões recreativas atuais. Delegar-lhe a escrita competitiva exige rever as entradas legadas que podem atribuir papéis no plantel. A eliminação da conta remove a pertença ao clube e conserva os dados partilhados. A transferência de administração fica fora do piloto. Se sair o último administrador, as operações administrativas ficam indisponíveis até haver um fluxo de recuperação autorizado.

## Verificação

- Com dois clubes sintéticos, verificar que um membro do clube B recebe a mesma resposta para um jogo privado do clube A e para um identificador inexistente.
- Verificar leitura pelo capitão e pelo atleta com vínculo ao clube e à equipa. Verificar recusa para um membro do mesmo clube sem acesso à equipa e para um membro da equipa cujo vínculo ao clube foi removido.
- Verificar a criação pelo capitão vinculado ao clube e a recusa para atleta, co-capitão e administrador sem propriedade da equipa. Um papel `owner` gravado no plantel não substitui o proprietário registado em `teams.owner_id`.
- Verificar que um utilizador sem autorização de gestão não consegue criar nem alterar vínculos na equipa através das ações de plantel.
- Verificar a gestão de uma convocatória recreativa pelo capitão e o acesso por link de convidado sem dados competitivos.
