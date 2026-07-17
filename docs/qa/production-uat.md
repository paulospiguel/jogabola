# Checklist UAT de produção

Validação manual mínima antes de promover uma versão do JogaBola para produção. Executar os cenários em mobile e desktop, registar evidências e bloquear a release quando existir uma falha crítica ou alta sem mitigação aceite.

## Pré-condições

- [ ] Ambiente candidato usa a mesma configuração e migrações previstas para produção.
- [ ] Existe uma conta nova, uma conta de capitão com equipa e uma conta de atleta convidado.
- [ ] A equipa de teste tem jogadores, um evento futuro, uma convocatória e pagamentos configurados.
- [ ] Existe um encontro concluído com dados suficientes para rankings e histórico.
- [ ] Consentimento de cookies é testável num perfil limpo do browser.
- [ ] Notificações e integrações externas necessárias estão configuradas, ou a limitação está documentada.
- [ ] A versão/commit, browser, sistema operativo, viewport e responsável pelo teste estão registados.

## Matriz de execução

Executar todos os cenários em:

- [ ] Mobile: viewport de referência 390 × 844, interação por toque e rede móvel simulada.
- [ ] Desktop: viewport de referência 1440 × 900, teclado e rato.

Para cada resultado, registar `Passou`, `Falhou` ou `Bloqueado`, anexar captura ou vídeo e indicar o identificador do defeito quando aplicável.

## Cenários funcionais

### Autenticação

- [ ] Abrir a aplicação sem sessão e confirmar o encaminhamento para autenticação.
- [ ] Iniciar sessão por cada método suportado no ambiente e confirmar o destino correto.
- [ ] Rejeitar credenciais ou autenticação inválida com mensagem clara, sem expor detalhes técnicos.
- [ ] Recarregar a página e confirmar que a sessão se mantém.
- [ ] Confirmar que consentimento recusado não ativa analítica ou replay de sessão.

### Onboarding

- [ ] Entrar com uma conta nova e concluir o fluxo sem becos sem saída.
- [ ] Validar estados obrigatórios, mensagens de erro e possibilidade de retomar o fluxo.
- [ ] Confirmar que a conclusão encaminha para a equipa ou ação principal esperada.

### Equipa

- [ ] Criar uma equipa com dados válidos e confirmar a apresentação na navegação.
- [ ] Editar os dados permitidos e confirmar a persistência após recarregar.
- [ ] Adicionar e consultar jogadores sem duplicações ou perda de dados.
- [ ] Confirmar empty states e permissões para utilizadores sem acesso de gestão.

### Evento e convocatória

- [ ] Criar um evento com data, hora e local e confirmar os dados no detalhe.
- [ ] Editar o evento e confirmar a atualização nas vistas relevantes.
- [ ] Criar ou abrir a convocatória e verificar estados de presença e capacidade.
- [ ] Confirmar datas, horas e fusos horários em mobile e desktop.

### Convite e RSVP do atleta

- [ ] Abrir um convite válido como atleta e identificar claramente equipa, evento e prazo.
- [ ] Responder `Vou`, `Talvez` e `Não vou`, confirmando feedback e persistência de cada estado.
- [ ] Reabrir o convite e confirmar o estado mais recente.
- [ ] Testar convite inválido ou expirado com recuperação clara e sem dados privados expostos.

### Pagamentos

- [ ] Consultar estado e valor do pagamento aplicável ao atleta.
- [ ] Submeter o comprovativo ou fluxo de pagamento suportado e confirmar feedback.
- [ ] Como capitão, rever e atualizar o estado sem duplicar transações.
- [ ] Testar falha de submissão e repetição segura, sem criar registos duplicados.

### Notificações

- [ ] Confirmar a receção de uma notificação de evento ou convocatória.
- [ ] Abrir a notificação e validar o destino e contexto corretos.
- [ ] Marcar como lida e confirmar que o contador e o estado são atualizados.
- [ ] Confirmar o comportamento quando as notificações estão indisponíveis ou sem permissão.

### Demo, rankings e histórico

- [ ] Abrir a demo e percorrer os dados sem necessidade de criar conteúdo real.
- [ ] Confirmar ordenação, empates, nomes e valores nos rankings.
- [ ] Abrir o histórico da época e validar navegação para um encontro concluído.
- [ ] Confirmar estados vazios quando não existem estatísticas ou histórico.

### Cronómetro e torneio

- [ ] Iniciar, pausar, retomar e terminar um encontro, confirmando o tempo apresentado.
- [ ] Registar golos, cartões e substituições e validar o resultado e a cronologia.
- [ ] Registar vários golos do mesmo jogador e confirmar o agrupamento dos tempos na mesma linha.
- [ ] Remover o golo mais recente de um jogador e confirmar resultado e cronologia.
- [ ] Recarregar durante o encontro e confirmar recuperação consistente do estado.
- [ ] Criar ou abrir um torneio, navegar pelos jogos e confirmar resultados e progressão suportada.

### Logout

- [ ] Terminar sessão e confirmar o encaminhamento para a área pública ou autenticação.
- [ ] Usar voltar/recarregar e confirmar que áreas privadas não ficam acessíveis.
- [ ] Iniciar sessão com outra conta e confirmar que não existe fuga de dados da sessão anterior.

## Registo de evidência e resultado

Preencher uma linha por cenário falhado ou bloqueado.

| Data | Versão/commit | Plataforma | Cenário | Resultado | Evidência | Defeito | Responsável |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |

Resumo da execução:

- Mobile: `Passou / Falhou / Bloqueado`
- Desktop: `Passou / Falhou / Bloqueado`
- Recomendação: `Aprovar / Aprovar com risco aceite / Bloquear`
- Responsável e data:

## Severidade e regra de bloqueio

| Severidade | Critério | Decisão de release |
| --- | --- | --- |
| Blocker | Perda ou exposição de dados, falha generalizada, impossibilidade de autenticar, concluir o onboarding ou usar a função principal. | Bloquear sempre. |
| Alta | Fluxo essencial sem alternativa segura, permissões incorretas, pagamento ou resultado inconsistente. | Bloquear até correção ou decisão formal de risco. |
| Média | Função secundária degradada com alternativa clara, erro visual que afeta compreensão ou acessibilidade. | Pode avançar apenas com defeito registado e responsável definido. |
| Baixa | Inconsistência cosmética sem impacto funcional relevante. | Não bloqueia; incluir no backlog. |

A release só pode avançar quando não existirem blockers, as falhas altas estiverem resolvidas ou formalmente aceites e todas as evidências obrigatórias estiverem associadas à versão testada.
