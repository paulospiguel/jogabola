 ---
  PRD — Jogabola MVP: Arena V2 — Gestão de Grupos Recreativos

  ---
  Problem Statement

  Capitães e organizadores de grupos de futebol recreativo (bairro, amigos, colegas de trabalho) gerem toda a logística semanal via WhatsApp:
  confirmações de presença que ficam enterradas em conversas, rachões calculados à mão com erros e conflitos, multas por atrasos que nunca chegam a
  ser cobradas, e histórico zero de quem jogou o quê. O custo é 30-40 mensagens por jogo e desentendimentos recorrentes sobre dinheiro que degradam a
  coesão do grupo.

  ---
  Solution

  Uma aplicação web focada no organizador/capitão que substitui o caos do WhatsApp por: convocação estruturada com confirmação em 1 clique, racha
  automático baseado em presenças reais, sistema de multas configurável e histórico permanente — com um plano gratuito funcional para adoção orgânica
  e plano Pro para os grupos que precisam de controlo financeiro sério.

  ---
  User Stories

  Grupo e Onboarding

  1. Como capitão, quero criar um grupo com nome, modalidade (fut5/fut7/fut11) e descrição, para que tenha um espaço centralizado para gerir o meu
  time.
  2. Como capitão, quero gerar um link de convite único para o meu grupo, para que possa partilhar no WhatsApp sem precisar de adicionar cada jogador
  manualmente.
  3. Como jogador, quero entrar num grupo através de um link, para que não precise de pedir ao capitão para me adicionar.
  4. Como capitão, quero ver a lista de todos os membros do grupo com o seu estado (activo, inactivo), para que saiba quem faz parte do plantel.
  5. Como capitão, quero remover um membro do grupo, para que o plantel reflicta quem realmente joga.
  6. Como capitão, quero ter no máximo 1 grupo no plano gratuito, para que entenda o que ganho ao fazer upgrade para Pro.
  7. Como capitão Pro, quero criar grupos ilimitados, para que possa gerir múltiplos times (ex: sexta à noite e domingo de manhã).

  Convocação e Confirmação de Presença

  8. Como capitão, quero criar uma convocatória com data, hora, local e número máximo de jogadores, para que o grupo saiba os detalhes do próximo
  jogo.
  9. Como capitão, quero definir uma data limite de confirmação para a convocatória, para que possa planear a escalação com antecedência.
  10. Como jogador, quero receber notificação quando uma convocatória é criada, para que não perca o prazo de confirmação.
  11. Como jogador, quero confirmar ou rejeitar presença com 1 clique a partir do link partilhado, para que não precise de abrir conversas no
  WhatsApp.
  12. Como capitão, quero ver em tempo real quantos jogadores confirmaram, estão em espera ou não responderam, para que saiba se o jogo tem quórum.
  13. Como capitão, quero definir uma lista de espera automática quando o máximo é atingido, para que não perca jogadores disponíveis.
  14. Como capitão, quero partilhar a convocatória formatada para o WhatsApp com 1 botão, para que não precise de copiar informação manualmente.
  15. Como capitão, quero que jogadores que confirmam e depois faltam fiquem marcados como "faltou após confirmar", para que o sistema de multas possa
   actuar correctamente.

  Gestão de 3 Equipas em Rotação (Pro)

  16. Como capitão Pro, quero dividir o plantel em 3 equipas para um treino com rotação, para que o jogo de fut5/fut7 corra de forma organizada com
  quem fica de fora.
  17. Como capitão Pro, quero que a aplicação sugira divisão equilibrada por número de jogadores, para que não perca tempo a organizar manualmente.
  18. Como capitão Pro, quero definir qual equipa começa a jogar e qual fica de fora, para que todos saibam o plano antes de chegar ao campo.

  Histórico

  19. Como capitão, quero ver o histórico de todas as convocatórias dos últimos 30 dias (plano gratuito), para que saiba quem jogou recentemente.
  20. Como capitão Pro, quero histórico ilimitado de presenças e jogos, para que possa acompanhar padrões ao longo da temporada.
  21. Como jogador, quero ver o meu histórico pessoal de presenças e faltas, para que saiba o meu registo no grupo.
  22. Como capitão, quero ver o ranking de presenças do grupo, para que reconheça quem aparece sempre e quem falta muito.

  Estatísticas Básicas

  23. Como capitão, quero ver o número total de jogos do grupo, para que tenha uma visão geral da actividade.
  24. Como jogador, quero ver as minhas estatísticas simples (jogos, presenças, golos marcados), para que acompanhe o meu desempenho.
  25. Como capitão, quero registar golos por jogador numa convocatória, para que o histórico de golos fique guardado.

  Gestão Financeira — Racha Manual (Free)

  26. Como capitão, quero lançar o valor total do jogo (aluguer de campo + outros), para que o sistema calcule quanto cada jogador deve.
  27. Como capitão, quero que o racha seja dividido apenas pelos jogadores que confirmaram presença real (não quem confirmou e faltou sem regra), para
   que a divisão seja justa.
  28. Como capitão, quero marcar manualmente quem já pagou, para que controle os pagamentos mesmo sem gateway integrado.
  29. Como jogador, quero receber notificação "ainda deves €X ao grupo", para que não esqueça de pagar.
  30. Como capitão, quero ver o saldo em dívida de cada membro do grupo, para que saiba quem deve sem ter de fazer contas.

  Gestão Financeira — Racha Automático (Pro)

  31. Como capitão Pro, quero que o racha seja calculado automaticamente no momento em que fecho a convocatória, para que não perca tempo a calcular.
  32. Como capitão Pro, quero activar a regra "confirmou = paga, independentemente de aparecer", para que elimine o comportamento de confirmar e não
  aparecer.
  33. Como capitão Pro, quero definir excepções à regra (ex: falta justificada aprovada pelo capitão), para que tenha flexibilidade sem perder o
  controlo.

  Caixa do Grupo e Saldo (Pro)

  34. Como capitão Pro, quero gerir um saldo de caixa do grupo (ex: fundo para comprar equipamento), para que o dinheiro colectivo fique registado.
  35. Como capitão Pro, quero lançar entradas e saídas do caixa com descrição, para que todos saibam para onde foi o dinheiro.
  36. Como capitão Pro, quero ver o saldo actual do caixa em tempo real, para que saiba se há fundos para o próximo aluguer.
  37. Como capitão Pro, quero que compras colectivas (ex: bola nova) sejam divididas automaticamente pelo plantel activo, para que não tenha de
  calcular manualmente.

  Multas e Penalizações (Pro)

  38. Como capitão Pro, quero criar regras de multa configuráveis (ex: atraso = €1, falta após confirmação = €5, cartão amarelo = €2), para que o
  sistema aplique penalizações de forma consistente.
  39. Como capitão Pro, quero que as multas sejam adicionadas automaticamente ao saldo em dívida do jogador, para que não precise de controlar
  manualmente.
  40. Como jogador, quero receber notificação quando uma multa me for aplicada com o motivo, para que não seja surpreendido.
  41. Como capitão Pro, quero ver o histórico completo de multas por jogador, para que tenha transparência total.
  42. Como capitão Pro, quero remover ou ajustar uma multa aplicada, para que possa corrigir enganos.

  Relatório Mensal (Pro)

  43. Como capitão Pro, quero gerar um relatório mensal do grupo com: jogos realizados, presenças, saldo financeiro, multas aplicadas e quem deve o
  quê, para que o grupo tenha transparência total.
  44. Como capitão Pro, quero partilhar o relatório mensal via link ou imagem para o WhatsApp, para que todos vejam sem precisar de entrar na
  aplicação.

  Freemium e Upgrades

  45. Como capitão no plano gratuito, quero perceber claramente o que ganho ao fazer upgrade para Pro, para que a decisão de pagar faça sentido.
  46. Como capitão, quero subscrever Pro por €4,99/mês por grupo directamente na aplicação, para que o processo de pagamento seja simples.
  47. Como capitão Pro, quero cancelar a subscrição e manter acesso até ao fim do período pago, para que não haja surpresas na facturação.

  ---
  Implementation Decisions

  Módulos a construir (por ordem de prioridade)

  M1 — Group Module
  - Entidade group: id, name, sport_type (fut5/fut7/fut11), description, captain_id, plan (free/pro), created_at
  - Entidade group_member: group_id, user_id, role (captain/player), status (active/inactive), joined_at
  - Server actions: createGroup, inviteByLink, joinGroup, removeMember, listGroups
  - Limite de 1 grupo no free aplicado na server action, não apenas no UI

  M2 — Convocation Module
  - Entidade convocation: id, group_id, title, date, location, max_players, confirmation_deadline, status (draft/open/closed), racha_value, racha_rule
   (confirmed_pays/present_pays)
  - Entidade attendance: id, convocation_id, user_id, status (confirmed/rejected/no_response/confirmed_absent), paid (boolean), confirmed_at
  - Server actions: createConvocation, confirmAttendance, rejectAttendance, closeConvocation, generateWhatsAppLink

  M3 — History Module
  - Query sobre convocation + attendance com filtro de data
  - Free: últimos 30 dias. Pro: ilimitado (enforced em query, não schema)
  - Server actions: getGroupHistory, getPlayerHistory, getAttendanceRanking

  M4 — Finance Module (Free: manual / Pro: automático)
  - Entidade financial_rule: group_id, type (fine/split), trigger, amount, description, active
  - Entidade transaction: id, group_id, convocation_id (nullable), user_id, type (debt/payment/fine/cashbox_in/cashbox_out), amount, description,
  created_by, created_at
  - Entidade group_cashbox: group_id, balance (calculado de transactions)
  - Server actions: calculateSplit, markAsPaid, applyFine, addCashboxEntry, getGroupBalance, getMemberBalance

  M5 — Subscription Module
  - Entidade subscription: group_id, plan (free/pro), status (active/cancelled/trial), period_end
  - Middleware de gate: requirePro(groupId) usado nas server actions Pro
  - Paywall fake na semana 3: formulário de email com "será cobrado €4,99/mês" — sem gateway real, apenas registo em tabela pro_waitlist

  M6 — Rotation Module (Pro only)
  - Lógica stateless: dado N jogadores confirmados, dividir em 3 grupos equilibrados
  - Sem schema novo — resultado guardado como JSON em convocation.rotation_config

  Decisões de arquitectura

  - Padrão Server/Client: server component busca sessão + dados → passa para client component (padrão Arena V2 já estabelecido)
  - Role MANAGER já existe no schema profile — é o capitão do grupo recreativo. Não criar role novo.
  - Schema public_event existente é para eventos públicos de descoberta (diferente de convocações privadas de grupo). Não reutilizar — criar
  convocation separado.
  - i18n: manter apenas pt no MVP. Outros idiomas já têm estrutura mas não priorizar.
  - Notificações: push via Web Push API (sem custo) ou email via sendEmail action já existente. Sem SMS no MVP.
  - Pagamentos: não integrar Mbway/Stripe no MVP. Capitão marca "pago fora da app". Gateway entra após validar que grupos pagam Pro.

  Mudanças de schema necessárias

  Novas tabelas: group, group_member, convocation, attendance, financial_rule, transaction, group_cashbox, subscription, pro_waitlist

  Schema profile existente: sem alterações (role MANAGER já existe)

  ---
  Testing Decisions

  Princípio: testar comportamento externo, não implementação. Um bom teste verifica o que o utilizador observa — não como o código o faz internamente.

  Módulos com testes obrigatórios:

  - Finance Module — lógica de racha (split igual, split por presença, regra confirmed=pays), aplicação de multas, cálculo de saldo. São operações
  matemáticas com dinheiro — qualquer erro é visível e de alto impacto.
  - Subscription Gate — requirePro() deve bloquear correctamente features Pro em grupos free, e libertar após upgrade.
  - Group Limits — capitão free não pode criar 2º grupo; capitão Pro pode criar ilimitados.

  Módulos que não precisam de testes unitários no MVP:
  - UI components (Arena V2 design system já estável)
  - Server actions de leitura simples (getGroupHistory, listMembers)

  ---
  Out of Scope

  - Integração com gateway de pagamento (Mbway, Stripe, PayPal)
  - App mobile nativa (o repo jogabola_mobile fica em pausa)
  - Web3 / Solana wallet
  - Marketplace de campos ou equipamentos
  - Rankings entre grupos diferentes
  - Transmissão ao vivo
  - i18n além de português (pt) no MVP
  - Roles FAN e ORGANIZER — foco em MANAGER (capitão) e PLAYER
  - Gestão de ligas ou torneios multi-equipa
  - Integração com federações

  ---
  Further Notes

  - Paywall fake na semana 3 é crítico: antes de construir qualquer feature Pro, validar que capitães de grupos reais aceitam ser cobrados €4,99/mês.
  Se menos de 3 em 20 grupos confirmarem — mudar pricing ou features antes de continuar.
  - O capitão paga pelo grupo — nunca dividir a subscrição pelos jogadores. Complexidade de coordenação mata conversão.
  - Churn sazonal é real — grupos param no verão. Considerar pausar subscrição (não cancelar) como feature de retenção após lançamento.
  - Engagement loop central: a notificação "fulano ainda deve €X" partilhável cria pressão social que mantém o grupo na app entre jogos. Construir
  cedo (semana 4-5), não tarde.
  - Arena V2 é o único dashboard a desenvolver — playzone, fanzone e organizer ficam em pausa. Toda a nova UI vai dentro de (protected)/arena/.
