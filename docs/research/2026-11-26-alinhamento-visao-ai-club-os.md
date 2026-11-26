# Alinhamento da visão do JogaBola com o plano AI Club OS

Análise da [conversa partilhada «Rever modelo de negócio»](https://chatgpt.com/share/6b081ace-cbc0-83eb-a5d6-7d10da53fec8) face ao estado local do repositório em 26 de novembro de 2026.

## Conclusão

A visão de gerir clubes competitivos com staff virtual encaixa no AI Club OS. O plano atual cobre uma primeira entrega operacional com clubes, calendário competitivo e o Secretário. A conversa acrescenta uma demonstração comercial mais abrangente e uma hipótese de expansão para organizadores, atletas e proprietários de instalações. Essas propostas têm implicações diferentes para a etapa 2 consoante precisem de funcionar em dados partilhados ou possam ser apresentadas como conceitos com dados fictícios. [Direção de produto](../../.agents/context/PRODUCT.md#strategic-direction--ai-club-os) · [Plano AI Club OS](../superpowers/plans/2026-11-25-ai-club-os.md)

## Comparação por área

| Proposta discutida | O que está previsto no repositório | Implicação |
| --- | --- | --- |
| Gestão de clubes e equipas com épocas, jogos e convocatórias | A etapa 2 acrescenta clube, época, adversário e jogo competitivo. A ligação à convocatória da própria equipa é opcional. | A base coincide e preserva os percursos recreativos existentes. |
| Staff virtual que comunica com atletas e interpreta respostas | As etapas 3 e 4 preveem identidade do agente, autorização, registo, quotas, revogação e um Secretário para pedidos de disponibilidade. Respostas ambíguas pedem esclarecimento e os envios ao plantel passam por revisão humana. | O fluxo de presenças encaixa. Um criador genérico de agentes, grupos de chat com agentes e comunicação autónoma em múltiplos canais ampliam o âmbito. |
| Informação sobre adversários e relatórios | A etapa 5 prevê um dossiê de adversário com proveniência por afirmação e revisão humana. | É uma evolução já prevista. Scouting e recrutamento de atletas são uma frente distinta. |
| Chamadas individuais, reuniões entre agentes e tarefas em segundo plano | A conversa inclui chamadas funcionais na demonstração. O plano coloca voz depois de evidência do piloto e adia worker alojado e base vetorial até haver necessidade medida. | Tornar voz funcional um requisito da primeira demonstração altera a sequência atual. A arquitetura local já permite validar a utilidade do Secretário por texto. |
| Organizadores criam competições, clubes inscrevem-se e participantes partilham calendário, resultados e classificações | O ADR 0004 proposto guarda o nome da competição no jogo, com época e adversário no âmbito do clube. O ADR 0001 mantém o adiamento de classificações e resultados. O ADR 0005 proposto autoriza dentro do clube e da equipa. | Uma prova partilhada precisa de identidade própria, organizador, inscrições e regras de acesso entre clubes, incluindo a fronteira entre dados públicos e privados. |
| Organização com vários papéis, incluindo clube, organizador e proprietário de instalações | Os ADRs propostos dão ao clube a função de agregar equipas e delimitar as permissões deste piloto. | Um núcleo comum de organizações e papéis é uma decisão de arquitetura adicional. Vale reabrir o desenho antes do schema se as inscrições entre clubes tiverem de funcionar já na primeira entrega. |
| Perfis de atletas adultos, captação geográfica e Instagram | Os planos ativos não incluem um diretório público de atletas, descoberta geográfica ou aquisição através do Instagram. | São hipóteses de produto próprias. A inscrição voluntária de atletas e a aquisição por campanhas são decisões diferentes de monitorizar contas sociais. |
| Formação, encarregados de educação, escalões e veteranos | O primeiro ciclo foca-se numa equipa sénior. O plano não define relação de tutela, permissões familiares ou regras de escalões. | A segmentação e as permissões de formação requerem desenho próprio, em especial para dados e interações de menores. |
| Instalações, reservas, alugueres e pagamentos a terceiros | O percurso atual contempla locais de convocatória e pagamentos do racha. | Inventário de campos, disponibilidade, reservas e intermediação de pagamentos são um domínio adicional. |

Fontes do repositório para a comparação. [Plano AI Club OS](../superpowers/plans/2026-11-25-ai-club-os.md#ordem-de-execução-e-critérios-de-passagem) · [Regras de domínio](../../.agents/context/CONTEXT.md#invariantes-para-funcionalidades-de-ia-e-multi-clube) · [ADR 0001 aceite](../adr/0001-defer-external-league-model.md) · [ADR 0004 proposto](../adr/0004-competitive-calendar.md) · [ADR 0005 proposto](../adr/0005-club-calendar-authorization.md) · [Índice de planos](../superpowers/plans/README.md)

## Decisão que afeta a próxima implementação

Se a primeira reunião comercial precisa de mostrar o valor para **um clube**, a etapa 2 proposta é suficiente como base. Uma demonstração pode encadear criação de jogo, convocatória, pedido de disponibilidade, interpretação da resposta e revisão do treinador à medida que as etapas 2 a 4 são concluídas. As áreas de expansão podem ser apresentadas com dados fictícios e indicação clara do seu estado.

Se a primeira reunião precisa de demonstrar que **um organizador cria uma prova e duas equipas de clubes diferentes se inscrevem**, convém rever os ADRs 0004 e 0005 antes da primeira migração. O modelo proposto de jogo serve o calendário privado. A prova e as inscrições precisam de identidade e permissões partilhadas. O organizador passa a ser um dos perfis a validar desde a primeira entrega.

A conversa apresenta cenários de preços, custos e prazos para âmbitos diferentes e revê as estimativas quando acrescenta formação, competições e reservas. Para este plano, o compromisso documentado é medir tempo poupado, correções e duplicações no fluxo inicial, bem como custo e latência por tarefa, antes de confirmar o preço por clube. Os números da conversa servem como hipóteses de planeamento. [Piloto e métricas](../superpowers/plans/2026-11-25-ai-club-os.md#objetivo-do-primeiro-ciclo) · [Revisão antes do piloto](../superpowers/plans/2026-11-25-ai-club-os.md#revisão-antes-do-piloto)

## Simulador de Jogo 3D

**Proposta para a Arena.** O treinador abre o simulador a partir de um jogo do calendário competitivo e testa um plano para esse adversário. O objetivo é comparar decisões táticas e mostrar à equipa os movimentos e espaços que essas decisões criam. Os cenários e resultados são privados da equipa e identificados como simulados.

### Primeira versão proposta

1. **Escolher o adversário.** Usar o adversário do jogo ou escolher um perfil fictício na demonstração. Ajustar manualmente o nível e o estilo, por exemplo pressão alta ou bloco baixo. O nível altera parâmetros visíveis, como rapidez da pressão e eficácia do passe, para o treinador saber o que está a testar.
2. **Preparar a equipa.** Escolher titulares e suplentes, selecionar a formação e ajustar posições no terreno. O primeiro protótipo assume futebol de 11.
3. **Simular e intervir.** Ver a partida num campo 3D, com jogadores e bola animados, câmara tática e controlos de pausa, velocidade e repetição. Programar uma substituição para um minuto ou carregar em pausa para testar uma troca ou um ajuste de posição a partir daquele momento.
4. **Comparar duas versões.** Repetir o cenário com o mesmo adversário e a mesma sequência aleatória de base, alterando a formação, uma posição ou o momento de uma substituição. Comparar remates, recuperações e zonas de espaço cedido, com acesso aos lances relevantes. Os resultados descrevem o comportamento do cenário configurado e devem ser apresentados como tal.

**Exemplo para uma reunião.** Preparar um 4‑3‑3 contra um adversário forte em pressão alta. Repetir a partida com o médio mais recuado e um extremo fresco aos 60 minutos. Comparar as perdas de bola na saída e rever no campo os lances em que o espaço mudou. Para avaliar o efeito de cada decisão em separado, repetir uma alteração de cada vez.

### Como funciona na aplicação

Um motor em TypeScript calcula posições, estados e eventos da partida a partir de regras explícitas e de uma sequência aleatória reproduzível. O Three.js apresenta o campo, o movimento e as animações. O React Three Fiber pode integrar a cena na interface React 19. Esta divisão permite repetir um cenário e verificar a lógica das substituições independentemente da renderização. O protótipo pode correr no navegador com dados fictícios e sem chamadas a modelos de IA. [Animação no Three.js](https://threejs.org/docs/pages/AnimationMixer.html) · [Instalação do React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/installation)

O primeiro alvo visual é um campo à escala com movimentos legíveis, modelos leves e uma câmara que mostre a organização das equipas. A versão móvel deve suportar a configuração e o controlo da partida. A vista tática 2D pode mostrar os mesmos eventos quando o dispositivo não conseguir renderizar a cena 3D. Um protótipo deve demonstrar que o nível escolhido altera o cenário, que a substituição troca os jogadores no minuto definido e que a repetição com a mesma configuração produz o mesmo resultado.

### Encaixe no AI Club OS

O jogo e o adversário propostos na etapa 2 podem servir de ponto de entrada para a integração. Um protótipo isolado com dados fictícios já permite validar a experiência e o desempenho do 3D. Mais tarde, o Analista pode sugerir um perfil a partir de observações com fontes, sujeito a confirmação do treinador. As hipóteses manuais e as observações sustentadas por dados devem ficar identificadas no cenário. A prioridade da funcionalidade e a integração com dados reais ficam propostas para decisão. [Calendário competitivo proposto](../adr/0004-competitive-calendar.md) · [Sequência do AI Club OS](../superpowers/plans/2026-11-25-ai-club-os.md#ordem-de-execução-e-critérios-de-passagem)
