# JogaBola — Contexto de Domínio

Este documento define a linguagem ubíqua e as regras de negócio da plataforma JogaBola.

## Glossário

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
- **Mural de Avisos**: Feed de mensagens curtas dentro de uma Convocatória para atualizações rápidas.
- **Notificação de Sistema**: Alertas automáticos disparados pela plataforma (Abertura, Lembrete, Confirmação).
- **Alerta do Capitão**: Notificação manual disparada pelo Organizador para apelar à ação (ex: "Chatear Pendentes").

### Identidade & Sessão
- **Utilizador Fantasma** (`Ghost User`): Registo de utilizador criado automaticamente a partir de um email de convidado para preservar histórico (pagamentos, golos) sem exigir password.
- **Identificação por Email**: Estratégia de reconhecimento global onde o email serve de chave única para unificar o Atleta em diferentes Equipas e Convocatórias.

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
