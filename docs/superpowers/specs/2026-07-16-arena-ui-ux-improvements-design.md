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

Os componentes partilhados `EmptyState`, loading, `BottomNav` e shell Arena terão contratos consistentes para os estados loading, error, empty e success. Não serão introduzidas novas queries nem lógica de negócio no cliente.

### Incremento 2: cockpit do capitão

O dashboard adota a opção aprovada “Ação primeiro”. Sem eventos, apresenta:

1. Bloco “Próxima ação” com “Criar a próxima convocatória” e um único CTA “Criar evento”.
2. Ações secundárias “Adicionar jogador” e “Partilhar equipa”.
3. Plantel resumido para reforçar a identidade da equipa.

Confirmados, Reservas e Pendentes não aparecem sem um evento. “Esta semana” e “Descobrir” são ocultados quando não têm conteúdo.

Com evento ativo, o evento ocupa a posição principal. A próxima ação usa apenas dados já disponíveis e pode encaminhar para consultar o evento, completar vagas ou validar pagamentos. As métricas aparecem associadas ao evento.

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

## Estados de interface

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

A revisão cobre chaves usadas pelas rotas Arena, componentes partilhados e navegação.

- Usar sentence case: “Criar evento”, “Adicionar jogador”.
- Usar “capitão” como papel operacional principal; “organizador” apenas quando o contexto o exigir.
- Substituir “pelada” e outros termos brasileiros por linguagem natural de Portugal.
- Rever formatos de data, hora, moeda, género e pluralização.
- Evitar texto hardcoded nos componentes.
- Sincronizar qualquer chave criada ou alterada em `src/locales/pt.json`, `en.json`, `es.json` e `fr.json`.

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

Antes de gerar, será produzido um inventário de assets e emojis em uso. Assets existentes adequados serão reutilizados. A primeira vaga cobre Jogo/Treino e os restantes casos de UI onde emojis funcionam como iconografia, incluindo posições e Cronómetro. Emojis permitidos pelo produto, como o troféu de campeão e bandeiras, não precisam de ser substituídos salvo decisão específica.

Cada asset terá nome semântico, prompt documentado, finalidade, dimensões e regra de utilização. O formato preferido é PNG ou WebP transparente, com variantes 1× e 2×. A integração usa `next/image` com `sizes` e prioridade adequados ao contexto.

## Componentes e responsabilidades

- `ArenaDashboard`: compõe o cockpit e seleciona a próxima ação a partir dos dados já carregados.
- Mapper/utilitário puro de próxima ação: converte estado de equipa/evento numa ação apresentável e testável.
- `BottomNav`: configura cinco destinos e garante contratos de acessibilidade.
- `EmptyState`: apresenta empty states responsivos e aceita asset ou ícone sem impor dimensões fixas.
- Skeletons locais: representam dashboard, plantel e cobranças sem conhecer regras de negócio.
- Componentes de tipo de evento e posições: trocam emojis por assets de branding sem alterar os valores de domínio.
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

## Critérios de sucesso

- O capitão sem eventos encontra e inicia “Criar evento” sem CTAs duplicados.
- O dashboard não mostra métricas sem contexto.
- Nenhum conteúdo ou CTA essencial fica cortado nos breakpoints definidos.
- A navegação mobile apresenta cinco destinos e todos os alvos cumprem 44×44 px.
- Loading, error e empty são estados visual e semanticamente distintos.
- A Arena não usa emojis como iconografia operacional ou de branding nos casos substituídos.
- Os novos assets pertencem visualmente à família existente.
- As quatro traduções permanecem sincronizadas e a UI portuguesa usa PT-PT natural.
