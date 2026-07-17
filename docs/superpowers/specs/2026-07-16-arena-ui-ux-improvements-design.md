# Arena UI/UX Improvements Design

**Data:** 2026-07-16  
**Estado:** Aprovado em sessão de desenho  
**Âmbito:** Arena autenticada, componentes partilhados, traduções e assets de branding

## Objetivo

Tornar a Arena mais rápida, clara e operacional para o capitão, corrigindo falhas de responsividade e carregamento, reorganizando o dashboard em torno da próxima ação e refinando a identidade existente sem a substituir.

## Princípios

- Capitão primeiro: o dashboard responde a “o que tenho de resolver agora?”.
- Mobile-first: interações essenciais funcionam com um polegar e alvos mínimos de 44×44 px.
- Contexto antes de métricas: números só aparecem quando estão ligados a um evento real.
- Identidade evolutiva: preservar a Arena escura e desportiva, reduzindo ruído visual.
- PT-PT natural: texto direto, sentence case e terminologia de domínio consistente.
- Iconografia com papéis distintos: Lucide para operação, assets próprios para branding.

## Fora de âmbito

- Alterações de schema ou migrações de base de dados.
- Novas regras de negócio para convocatórias, pagamentos ou plantel.
- Alterações à autenticação.
- Substituição global da identidade visual ou redesign profundo.
- Substituição dos ícones operacionais Lucide por imagens raster.

## Arquitetura de entrega

### Incremento 1: fundação

Corrigir responsividade, carregamentos, erros, acessibilidade táctil e performance de imagens. O shell da Arena, navegação e cabeçalhos permanecem visíveis durante queries. Dashboard, Plantel e Cobranças passam a usar skeletons estruturais. Erros apresentam mensagem útil e ação “Tentar novamente”; empty states ficam reservados a respostas válidas sem dados.

Os componentes partilhados `EmptyState`, loading, `BottomNav` e shell Arena terão contratos consistentes para os estados loading, error, empty e success. Não serão introduzidas novas queries, autorizações ou regras de domínio no cliente.

### Incremento 2: cockpit do capitão

O dashboard adota a opção aprovada “Ação primeiro”. Sem eventos, apresenta:

1. Bloco “Próxima ação” com “Criar a próxima convocatória” e um único CTA “Criar evento”.
2. Ações secundárias “Adicionar jogador” e “Partilhar equipa”.
3. Plantel resumido para reforçar a identidade da equipa.

Confirmados, Reservas e Pendentes não aparecem sem um evento. “Esta semana” e “Descobrir” são ocultados quando não têm conteúdo.

Com evento ativo, o evento ocupa a posição principal. As métricas aparecem associadas ao evento.

### Definição de evento ativo

Para este trabalho, “sem eventos” significa não existir qualquer evento futuro elegível no resultado de `getEvents({ upcomingOnly: true })`. Eventos passados, realizados ou fechados não impedem o empty state do cockpit.

Um evento é elegível quando tem `startDate >= now` e `status !== "cancelled"`. Quando existem vários, o ativo é o primeiro por `startDate` ascendente; em empate, o menor `id` vence. A lista devolvida pelo servidor já é futura. Um utilitário puro na camada de apresentação do dashboard (`_utils`) normaliza ordenação e exclusão visual de cancelados; não decide acesso, ciclo de vida nem mutações. O cliente recebe apenas eventos já autorizados pelo servidor.

### Matriz da próxima ação

O mapper recebe `hasTeam`, `canManageTeam`, `activeEvent` e `squadCount`. Não recebe dados de pagamentos nem faz chamadas de rede. A saída é composta por uma ação primária e zero ou mais ações secundárias. Se `hasTeam === false`, o mapper devolve `null`; o estado existente de criar/selecionar equipa bloqueia o cockpit.

| Tipo | Condição | Ação | Destino |
|---|---|---|---|
| Sem ação | `!hasTeam` | O fluxo sem equipa assume o ecrã | Sem destino do cockpit |
| Primária | `hasTeam && canManageTeam && !activeEvent` | Criar evento | Abrir `CreateEventSheet` |
| Primária | `hasTeam && activeEvent` | Ver evento | `/arena/events/{id}` |
| Primária | `hasTeam && !canManageTeam && !activeEvent` | Consultar plantel | `/arena/squads` |
| Secundária | `hasTeam && canManageTeam && !activeEvent && squadCount === 0` | Adicionar jogador | Abrir `AddPlayerSheet` |
| Secundária | `hasTeam && canManageTeam && !activeEvent && squadCount > 0` | Ver plantel | `/arena/squads` |

“Partilhar equipa” é ação secundária apenas quando a equipa e o mecanismo de partilha existentes estiverem disponíveis; não bloqueia o incremento. A validação de pagamentos permanece em Cobranças e não entra no mapper sem uma fonte de dados própria aprovada no futuro.

### Papéis e permissões

O cockpit otimizado serve prioritariamente owner/capitão e co-capitão (`manager`). A capacidade `canManageTeam` é derivada no servidor com as regras existentes de `canManageTeam`, nunca inferida apenas de `user.role` no cliente.

- Owner e `manager`: podem ver ações de criar evento e adicionar jogador, sujeitas às autorizações existentes.
- Coach/player ou outro membro: veem evento, plantel e métricas, mas não recebem CTAs de mutação.
- Utilizador sem equipa: mantém o fluxo atual de criação/seleção de equipa; não vê ações que exijam equipa.
- Convidados sem conta usam o fluxo público de atleta e estão fora do dashboard autenticado.

### Incremento 3: refinamento

Reduzir padrão de fundo, bordas, cards repetidos e letter-spacing onde prejudicam a leitura. Preservar fundo escuro, verde principal, componentes Arena e caráter desportivo. Uniformizar terminologia, capitalização e formatos em todos os locales.

## Navegação mobile

A barra inferior fica com cinco destinos:

1. Equipa
2. Plantel
3. Eventos
4. Cobranças
5. Perfil

O Cronómetro deixa a barra fixa. Passa a estar disponível no contexto de um evento e como atalho secundário do dashboard. Todos os destinos e ações têm área clicável mínima de 44×44 px. O desktop mantém sidebar própria e maior densidade.

Esta é uma alteração deliberada ao mapa mobile descrito em `DESIGN.md`: Cobranças permanece na barra por ser uma tarefa operacional recorrente do capitão. Avisos/Notificações continuam acessíveis pelo sino persistente da `MobileTopBar` e pela rota `/arena/notifications`; não entram na barra inferior. A implementação atualiza `DESIGN.md` para remover a divergência documental. O estado ativo deve reconhecer subrotas de cada destino, enquanto o sino usa estado não lido próprio.

## Estados de interface

### Contratos por superfície

| Superfície | Loading | Erro parcial/total | Empty | Retry |
|---|---|---|---|---|
| Dashboard | Shell + skeletons independentes de evento e plantel | Se uma query falhar, a outra secção continua visível; erro local na secção falhada. Se ambas falharem, dois erros locais, sem bloquear navegação | Sem evento futuro mostra próxima ação; plantel vazio mostra ação secundária se autorizada | Refetch apenas da query da secção |
| Eventos | Cabeçalho + skeleton da lista | Erro da lista substitui apenas a lista | A secção “Próximos” mostra `EmptyState` quando não há futuros; “Anteriores” permanece visível se tiver eventos | Refetch de eventos |
| Plantel | Cabeçalho + skeleton de linhas | Erro substitui a lista, preservando pesquisa/cabeçalho quando úteis | Nenhum membro mostra `EmptyState` | Refetch de plantel |
| Cobranças | Cabeçalho + skeleton de métricas/lista; métodos mantêm estado próprio | Erro de pagamentos não apaga definições carregadas e vice-versa | Nenhum pagamento mostra estado vazio dentro do tab | Refetch da query falhada |

Durante um refetch, conteúdo válido anterior permanece visível com indicação não bloqueante. Loading inicial tem precedência apenas dentro da secção sem dados. Erro tem precedência sobre empty. Empty só é calculado após sucesso.

### Loading

- Preservar shell, navegação e cabeçalhos.
- Usar skeletons que representem o conteúdo final.
- Evitar GIF de loading como substituto de uma página inteira.
- Evitar layout shift entre loading e success.

### Error

- Distinguir erro de empty state.
- Mostrar texto traduzido e ação “Tentar novamente”.
- Manter navegação disponível.
- Não expor erros internos de providers ou base de dados.

### Empty

- Ícone ou asset de branding, título, descrição e CTA.
- Conteúdo centrado e totalmente visível a 320, 390, 768 e 1440 px.
- Um único CTA primário por contexto.

## Traduções PT-PT

A revisão fica limitada aos namespaces `arenaDashboard`, `arenaEvents`, `arenaNav`, `arenaNoTeamModal`, `arenaEventDetail`, `arenaSquad`, `arenaPayments` e `profilePage`, mais as strings dos componentes partilhados diretamente usados por essas superfícies. Emails, Timer fora dos pontos de integração e website público ficam fora deste passe linguístico.

- Usar sentence case: “Criar evento”, “Adicionar jogador”.
- Usar “capitão” como papel operacional principal; “organizador” apenas quando o contexto o exigir.
- Substituir “pelada” e outros termos brasileiros por linguagem natural de Portugal.
- Rever formatos de data, hora, moeda, género e pluralização.
- Evitar texto hardcoded nos componentes.
- Sincronizar qualquer chave criada ou alterada em `src/locales/pt.json`, `en.json`, `es.json` e `fr.json`.
- Verificar paridade por estrutura e placeholders nos quatro ficheiros. A revisão editorial de naturalidade é obrigatória apenas para PT-PT; os restantes idiomas devem conservar significado e interpoladores corretos.

## Sistema de iconografia e assets

### Ícones operacionais

Lucide permanece como sistema para navegação, botões, estados, ações e informação funcional. Os ícones continuam stroke-based, acessíveis e escaláveis.

### Assets de branding

GPT Images será usado apenas para substituir emojis e imagens genéricas em escolhas e momentos de identidade. Os assets existentes em `src/assets/images/`, especialmente `jb-game.png`, `jb-training.png`, `jb-manager.png` e `jb-money.png`, são a referência visual principal.

Características obrigatórias:

- moldura hexagonal inspirada num emblema;
- contorno verde-escuro espesso;
- paleta verde, lima e amarelo;
- formas sólidas, arredondadas e legíveis em tamanho pequeno;
- profundidade ligeira, sem realismo fotográfico;
- fundo transparente;
- enquadramento e espessura consistentes;
- sem texto embutido na imagem.

Antes de gerar, será produzido um inventário de assets e emojis em uso. Assets existentes adequados serão reutilizados. A classificação é explícita:

- **Branding a substituir:** seleção de tipo de evento Jogo e Treino em `create-event-dialog.utils.ts` e fluxos equivalentes; estados vazios que hoje usem bola ou outro emoji como ilustração.
- **Operacional a migrar para Lucide:** emojis funcionais do Cronómetro, resultado e posições. Estes não recebem imagens GPT porque comunicam ação ou estado.
- **Conteúdo permitido:** 🏆 quando significa campeão e bandeiras, conforme `AGENTS.md`; emojis em conteúdo partilhado pelo utilizador não são alterados.
- **Fora desta vaga:** emojis editoriais de emails. Serão registados no inventário, mas exigem um projeto próprio por limitações de clientes de email.

Cada asset será gerado numa tela quadrada de 1024×1024 px, com conteúdo dentro de uma safe area central de 84%. Depois de aprovado, será exportado como WebP transparente a 256×256 (1×) e 512×512 (2×); a fonte PNG de 1024×1024 fica preservada. Deve continuar reconhecível a 56×56 px e não pode conter texto, extremidades cortadas ou halos claros no fundo transparente.

O inventário, prompts, seed/reference notes, finalidade, dimensões e aprovação serão versionados em `docs/design/arena-brand-assets.md`. Ficheiros finais vivem em `src/assets/images/branding/`. O utilizador aprova visualmente cada família antes da integração. A implementação usa `next/image`, reserva dimensões para evitar layout shift e define `sizes` de acordo com o tamanho renderizado.

## Componentes e responsabilidades

- `ArenaDashboard`: compõe o cockpit e seleciona a próxima ação a partir dos dados já carregados.
- Mapper/utilitário puro de próxima ação: converte estado de equipa/evento numa ação apresentável e testável.
- `BottomNav`: configura cinco destinos e garante contratos de acessibilidade.
- `EmptyState`: apresenta empty states responsivos e aceita asset ou ícone sem impor dimensões fixas.
- Skeletons locais: representam dashboard, plantel e cobranças sem conhecer regras de negócio.
- Componentes de tipo de evento: trocam emojis de Jogo/Treino por assets de branding sem alterar os valores de domínio.
- Componentes de posições e Cronómetro: trocam emojis funcionais por ícones Lucide adequados.
- Locales: única fonte de texto visível, com paridade entre quatro idiomas.

## Fluxo de dados

As hooks e queries existentes continuam a fornecer equipas, eventos, presenças, plantel e pagamentos. A camada de apresentação deriva:

1. estado da query: loading, error, empty ou success;
2. evento ativo, quando existe;
3. próxima ação operacional, sem nova chamada de rede;
4. métricas contextualizadas ao evento.

Retry invalida ou refaz apenas a query que falhou. A criação de evento e adição de jogador continuam nos sheets e ações existentes.

## Acessibilidade e movimento

- Alvos tácteis mínimos de 44×44 px.
- Icon-only controls com `aria-label` traduzido.
- Estado nunca comunicado apenas por cor.
- Assets decorativos com alt vazio; assets informativos com alt traduzido.
- Foco visível em teclado.
- `prefers-reduced-motion` desativa transições não essenciais.
- Microinterações continuam rápidas e funcionais, com `.press` ou `.btn-press` nos clicáveis.

## Validação

### Automática

- Testes unitários do mapper da próxima ação.
- Testes da configuração e estado ativo da navegação.
- Testes de componentes para loading, error, empty e success.
- Testes para garantir ausência dos emojis substituídos nas superfícies em âmbito.
- `pnpm lint`
- `pnpm ts-check`
- `pnpm test`
- `pnpm build`

### Visual e manual

- Verificar Arena, Eventos, Plantel, Cobranças e Perfil a 320, 390, 768 e 1440 px.
- Confirmar que o empty state de Eventos não corta texto nem CTA.
- Confirmar que o shell permanece durante loading e erro.
- Confirmar áreas clicáveis, labels, foco e reduced motion.
- Percorrer Arena → criar evento → detalhe do evento → Cronómetro.
- Percorrer Plantel, Cobranças e Perfil.
- Validar legibilidade e coerência dos novos assets em fundo escuro.
- Rever PT-PT no contexto, não apenas nos ficheiros JSON.

### Limites mensuráveis

- `document.documentElement.scrollWidth === document.documentElement.clientWidth` a 320, 390, 768 e 1440 px nas cinco rotas auditadas.
- Texto, CTA e ilustração dos empty states ficam integralmente dentro do viewport, sem clipping ou transformações fora da área visível.
- Todas as imagens acima da dobra reservam `width`/`height` ou `fill` + `sizes`; nenhum novo aviso de imagem do Next.js nas rotas em âmbito.
- Skeleton e conteúdo final ocupam a mesma estrutura principal, sem salto visível de cabeçalho ou navegação.
- Simplificação visual concreta: remover o CTA duplicado do dashboard, ocultar “Esta semana” e “Descobrir” quando vazios, reduzir o padrão de fundo sob blocos densos e eliminar cards aninhados nas superfícies tocadas.
- Todos os elementos interativos mobile medem pelo menos 44 px em ambas as dimensões, ou têm uma caixa clicável invisível equivalente.

## Critérios de sucesso

- O capitão sem eventos encontra e inicia “Criar evento” sem CTAs duplicados.
- O dashboard não mostra métricas sem contexto.
- Nenhum conteúdo ou CTA essencial fica cortado nos breakpoints definidos.
- A navegação mobile apresenta cinco destinos e todos os alvos cumprem 44×44 px.
- Loading, error e empty são estados visual e semanticamente distintos.
- A Arena não usa emojis como iconografia operacional ou de branding nos casos substituídos.
- Os novos assets pertencem visualmente à família existente.
- As quatro traduções permanecem sincronizadas e a UI portuguesa usa PT-PT natural.
