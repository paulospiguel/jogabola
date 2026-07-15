# Agrupamento de golos por jogador

## Objetivo

Evitar linhas repetidas na cronologia quando o mesmo jogador marca mais do que
um golo. Cada jogador deve aparecer uma única vez por equipa, acompanhado pelos
tempos de todos os seus golos.

## Âmbito

A alteração é exclusivamente de apresentação na cronologia do cronómetro. Os
eventos de golo continuam guardados individualmente no `Match`, preservando o
resultado, as estatísticas, a partilha, a persistência e a integração com
torneios.

## Comportamento

- Agrupar eventos de golo pelo par `team + playerId`.
- Agrupar também golos sem jogador (`playerId === ""`), separadamente por
  equipa. Um ID não vazio cujo jogador já não exista no plantel continua a ser
  agrupado pelo ID persistido e não é combinado com o grupo sem jogador.
- Mostrar uma linha por grupo com o nome do jogador, a equipa e os tempos dos
  golos em ordem cronológica, por exemplo `12' · 27' · 43'`.
- Não mostrar assistências nas linhas agrupadas.
- Manter cada cartão como uma linha individual.
- Ordenar as linhas da cronologia pelo evento mais recente representado em cada
  linha, do mais recente para o mais antigo. `Match.events` guarda a ordem de
  registo; quando dois eventos têm o mesmo `atSec`, o evento com o maior índice
  original é considerado mais recente. O mesmo critério desempata linhas.
- O botão de remoção de uma linha de golos elimina apenas o golo mais recente
  desse grupo, usando o maior par `(atSec, índice original)`. Depois da remoção,
  a linha mantém os restantes tempos; desaparece apenas quando já não houver
  golos no grupo.
- Manter a acessibilidade e a dimensão de alvo tátil existentes no comando de
  remoção.

## Arquitetura

Extrair uma função pura próxima da cronologia que transforma `MatchEvent[]` em
itens de apresentação. Um item representa um grupo de golos ou um cartão. O
componente `EventTimeline` renderiza esses itens sem alterar o modelo persistido.

Cada grupo de golos expõe:

- uma chave estável baseada na equipa e no jogador;
- os eventos de golo ordenados cronologicamente;
- o instante mais recente, usado para ordenar a cronologia;
- o ID do golo mais recente, usado pelo botão de remoção.

Os cartões mantêm o ID do evento como chave e como alvo de remoção. Mesmo quando
intercalado entre golos do mesmo jogador, um cartão nunca integra o grupo nem se
torna o alvo de remoção desse grupo.

A transformação cria novos arrays e itens de apresentação. Não ordena nem
altera diretamente `Match.events` ou os objetos de evento recebidos.

## Testes

O desenvolvimento segue RED-GREEN-REFACTOR. Os testes da função pura devem
provar:

1. dois ou mais golos do mesmo jogador e equipa produzem um único item;
2. os tempos do grupo ficam em ordem cronológica;
3. jogadores iguais em equipas diferentes não são combinados;
4. cartões permanecem individuais;
5. a cronologia é ordenada pelo evento mais recente de cada item;
6. o ID de remoção corresponde ao golo mais recente do grupo;
7. eventos no mesmo segundo usam a ordem original de registo como desempate;
8. golos sem jogador (`playerId === ""`) são agrupados apenas dentro da
   respetiva equipa, enquanto IDs não vazios desconhecidos permanecem separados;
9. uma sequência `golo → cartão → golo` do mesmo jogador produz um grupo de
   golos e um cartão, removendo apenas o segundo golo;
10. a transformação não altera a ordem nem os objetos do array recebido.

Depois dos testes focados, executar a suite completa, `pnpm ts-check`, Biome nos
ficheiros alterados e `git diff --check`.

## Fora de âmbito

- Alterar o modelo de persistência dos eventos.
- Alterar cálculo de resultado, estatísticas ou partilhas.
- Permitir escolher um golo intermédio para remoção.
- Apresentar assistências associadas a cada tempo.
