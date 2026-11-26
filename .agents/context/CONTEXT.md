# JogaBola — Contexto de Domínio

Este documento define a linguagem ubíqua e as regras de negócio da plataforma JogaBola.

## Glossário

### Clubes e calendário competitivo

Definidos pelos [ADR 0004](docs/adr/0004-competitive-calendar.md) e [ADR 0005](docs/adr/0005-club-calendar-authorization.md) (aceites em 2026-11-26).

- **Clube** (`Club`): âmbito organizacional que agrega equipas, épocas, adversários e jogos. O isolamento entre clubes é obrigatório em todas as leituras e mutações no servidor. A ligação de uma equipa ao clube (`teams.club_id`) é opcional e começa vazia nas equipas existentes.
- **Membro de clube** (`ClubMember`): vínculo único entre um utilizador e um clube, com papel `admin` (administrador: gere épocas e adversários e associa equipas) ou `member` (membro). Quem cria o clube fica como primeiro administrador. Ser membro do clube não dá, por si, acesso às equipas do clube.
- **Época** (`Season`): período desportivo de um clube, com nome único no clube. Não pode ser removida enquanto houver jogos associados.
- **Adversário** (`Opponent`): registo local do clube com nome próprio; pode representar uma equipa sem conta na aplicação. Não pode ser removido enquanto houver jogos associados.
- **Jogo competitivo** (`Fixture`): jogo de uma equipa do clube, com época, adversário, nome da competição e início (`timestamptz`). Só o proprietário da equipa (`teams.owner_id`) que seja membro do clube o cria; um papel `owner` no plantel não substitui essa propriedade e o co-capitão mantém apenas as permissões recreativas. Lê-o quem é membro do clube e tem vínculo à equipa (proprietário ou plantel). Uma equipa com jogos fica vinculada ao seu clube.
- **Ligação jogo–convocatória** (`FixtureMatchSession`): associação opcional e deliberada entre um jogo e uma convocatória da mesma equipa; no máximo uma por jogo e uma por convocatória. Apagar a convocatória remove a ligação e conserva o jogo. Convocatórias e páginas de convidados não expõem dados competitivos.

### AI Club OS — conceitos em introdução

Os conceitos seguintes orientam o produto. Os detalhes técnicos de cada etapa ficam fechados pelos ADRs previstos no plano AI Club OS; não presumir que estas entidades ou papéis já estão implementados.

- **Staff virtual** (`Virtual Staff`): capacidade de IA atribuída a um clube/equipa, com identidade, âmbito, permissões, orçamento e estado revogável próprios.
- **Secretário** (`Secretary`): primeiro staff virtual em validação. Prepara pedidos de disponibilidade, interpreta respostas e destaca pendências; não decide por conta própria quando há ambiguidade.
- **Proposta de acção** (`Action Proposal`): resultado tipado que o agente apresenta à aplicação. A aplicação valida identidade, autorização e âmbito antes de executar qualquer mutação.
- **Execução de agente** (`Agent Run`): registo atribuível de uma tarefa, incluindo estado, acções, custo e resultado, para permitir auditoria e controlo de repetição.

### Organização & Logística
- **Capitão / Organizador**: Utilizador responsável pela gestão de uma Equipa e criação de Convocatórias.
- **Equipa** (`Team`): Grupo estável de jogadores (ex: "Amigos do Bairro").
- **Plantel** (`Roster`): Conjunto de Atletas associados a uma Equipa.
- **Atleta**: Um utilizador ou convidado que faz parte do Plantel de uma Equipa.
- **Convocatória** (`MatchSession`): Um evento desportivo (Jogo, Treino) com data, local e limite de vagas.
- **Confirmação** (`Attendance` / `Reservation`): Ato de um Atleta garantir a sua vaga numa Convocatória.
- **Convidado** (`Guest`): Alguém que participa numa Convocatória sem pertencer formalmente ao Plantel.

### Financeiro
- **Racha** (`Payment`): O processo de divisão dos custos da Convocatória (aluguer do campo, etc.) pelos participantes.
- **Multa**: Valor penalizador aplicado a um Atleta por cancelamento tardio ou falta não justificada.
- **Comprovativo**: Documento (imagem/PDF) enviado pelo Atleta para validar o pagamento do seu Racha.

### Gamificação & Performance
- **Relatório de Jogo**: Formulário preenchido pelo Capitão após a Convocatória para registar o resultado e estatísticas.
- **Rating**: Pontuação dinâmica do Atleta baseada na assiduidade, performance e fair-play.
- **Badge**: Medalha virtual atribuída por conquistas específicas (ex: "Artilheiro do Mês").

### Comunicação
- **Mural de Avisos** (`EventNotice`): Feed de avisos do Capitão dentro de uma Convocatória (info/urgente/mudança de campo). Unidirecional: autor é o Organizador.
- **Chat de Evento** (`EventMessage`): Conversa livre entre participantes de uma Convocatória — distinto do Mural. Apenas Atletas com presença confirmada (e o Capitão) podem escrever e ler. Entrega em tempo real via serviço gerido (Ably). Ver [ADR 0002](docs/adr/0002-ably-realtime-event-chat.md).
- **Notificação de Sistema**: Alertas automáticos disparados pela plataforma (Abertura, Lembrete, Confirmação).
- **Alerta do Capitão**: Notificação manual disparada pelo Organizador para apelar à ação (ex: "Chatear Pendentes").

### Identidade & Sessão
- **Utilizador Fantasma** (`Ghost User`): Registo de utilizador criado automaticamente a partir de um email de convidado para preservar histórico (pagamentos, golos) sem exigir password.
- **Identificação por Email**: Estratégia de reconhecimento global onde o email serve de chave única para unificar o Atleta em diferentes Equipas e Convocatórias.
- **Passkey**: Método de login via WebAuthn (biometria/PIN do dispositivo), sem password. Login usa UI condicional (autofill nativo do browser), não um botão dedicado. Ver [ADR 0003](docs/adr/0003-passkey-login-conditional-ui.md).

## Convenções de Código

### Linguagem
- **Variáveis, tipos, funções, constantes** → sempre em **inglês** (ex: `attendanceStatus`, `MatchSession`, `PAYMENT_STATUS`)
- **UI strings** → sempre PT-PT via `useTranslations` (never hardcoded)
- **Comentários de código** → inglês

### Tipos e Constantes
- **Union types** para status de domínio: `type AttendanceStatus = "PAID" | "PENDING" | "TO_VALIDATE"`
- **`const` objects** (`as const`) para evitar strings literais repetidas no código:
  ```ts
  export const ATTENDANCE_STATUS = { PAID: "PAID", PENDING: "PENDING" } as const;
  ```
- Sem `enum` TypeScript nativo (overhead de compilação, mesmo resultado com union + const)

### Estrutura de Feature (padrão)
```
feature/
  page.tsx              ← server component, fetch + pass props
  _components/          ← UI isolada, responsabilidade única
  _hooks/               ← estado, efeitos, ações (colocado na feature)
  _utils/               ← lógica específica da feature
  _fixtures/            ← mock data tipado (temporário, até dados reais)
```
- Hooks verdadeiramente partilhados → `src/hooks/` global
- Utils genéricos → `src/lib/utils.ts`
- Constants de domínio → `src/constants/` global

### Server Actions
- Permanecem em `src/actions/` flat, organizados por domínio (`payments.actions.ts`)
- Não colocar junto de features — são partilhadas entre páginas

## Regras de Negócio Fundamentais

1. **Ciclo de Vida da Convocatória**: Agendada -> Aberta (aceita confirmações) -> Confirmada (campo reservado) -> Realizada -> Fechada (estatísticas e pagamentos concluídos).
2. **Prioridade de Vagas**: Membros do Plantel têm prioridade sobre Convidados até X horas antes do evento (configurável).
3. **Validação de Pagamento**: O Capitão deve validar manualmente (ou via IA) os Comprovativos de pagamento para fechar o Racha de uma Convocatória.
4. **Identidade Persistente**: Um Atleta que participe como convidado em vários eventos é unificado pelo seu email. Ao introduzir o email num novo evento, o sistema recupera o seu perfil (fantasma ou real) via validação de PIN (OTP).

## Invariantes para funcionalidades de IA e multi-clube

1. **Âmbito no servidor**: cada consulta ou mutação valida sessão, papel e acesso ao clube/equipa no servidor; um `clubId` recebido do cliente não é prova de autorização.
2. **Agente separado do utilizador**: uma acção executada por staff virtual regista a identidade do agente e o utilizador que a pediu ou aprovou. Nunca falsificar autoria humana.
3. **Controlo humano**: respostas ambíguas não alteram presenças. Uma comunicação dirigida ao plantel requer revisão do treinador/organizador autorizado antes do envio.
4. **Repetição segura**: entrega duplicada do mesmo evento ou retry não pode duplicar mensagens, presenças ou outros efeitos externos.
5. **Custo e revogação**: respeitar orçamento/quota do agente; sem saldo, não executar inferência. Um agente revogado não pode iniciar novas acções.
6. **Compatibilidade histórica**: novas entidades de clube, época e competição não podem apagar nem reinterpretar silenciosamente o histórico recreativo existente.

Estas invariantes descrevem a direcção aprovada do produto. Os mecanismos técnicos específicos — incluindo outbox, retries, estados e desenho das permissões — têm de ser detalhados e aprovados nos ADRs antes da implementação da etapa correspondente.
