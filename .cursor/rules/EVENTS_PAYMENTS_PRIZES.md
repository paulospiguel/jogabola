# Sistema de Eventos com Pagamentos e Premiações

## Visão Geral

O sistema de eventos foi expandido para suportar eventos pagos, gratuitos e com premiações. Esta documentação descreve as novas funcionalidades e como utilizá-las.

## Tipos de Eventos

### 1. Eventos Gratuitos
- **Descrição**: Eventos sem custo de participação
- **Uso**: Treinos organizados por times, peladas entre amigos
- **Campo DB**: `is_free = true`, `price = 0`

### 2. Eventos Pagos
- **Descrição**: Eventos que requerem pagamento para participação
- **Tipos de Pagamento**:
  - `per_person`: Valor fixo por participante (ex: €5 por pessoa)
  - `total`: Valor total do evento (ex: €100 para alugar o campo)
  - `split`: Valor dividido entre participantes (ex: €100 ÷ 20 pessoas = €5 cada)
- **Uso**: Aluguel de campo dividido, treinos profissionais, torneios

### 3. Eventos com Premiação
- **Descrição**: Eventos que oferecem prêmios aos participantes
- **Tipos de Premiação**:
  - `winner`: Prêmio para o vencedor
  - `draw`: Prêmio em caso de empate
  - `participation`: Prêmio de participação
  - `custom`: Premiação personalizada
- **Uso**: Torneios, competições, eventos especiais

## Estrutura do Banco de Dados

### Tabela: `events`

#### Campos de Pagamento
```sql
is_free BOOLEAN DEFAULT true
price DECIMAL(10, 2) DEFAULT 0
currency VARCHAR(3) DEFAULT 'EUR'
payment_type VARCHAR(50) -- 'per_person', 'total', 'split'
payment_description TEXT
```

#### Campos de Premiação
```sql
has_prize BOOLEAN DEFAULT false
prize_amount DECIMAL(10, 2)
prize_currency VARCHAR(3) DEFAULT 'EUR'
prize_description TEXT
prize_type VARCHAR(50) -- 'winner', 'draw', 'participation', 'custom'
```

### Tabelas Relacionadas

#### `event_payments`
Registra todos os pagamentos realizados para participação em eventos.

```sql
- id: UUID
- event_id: UUID (FK)
- user_id: UUID (FK)
- amount: DECIMAL
- status: 'pending' | 'completed' | 'failed' | 'refunded'
- payment_method: VARCHAR
- payment_date: TIMESTAMP
```

#### `prize_distributions`
Gerencia a distribuição de prêmios aos vencedores/participantes.

```sql
- id: UUID
- event_id: UUID (FK)
- team_id: UUID (FK, opcional)
- user_id: UUID (FK, opcional)
- amount: DECIMAL
- position: INTEGER
- status: 'pending' | 'distributed' | 'claimed'
```

#### `event_favorites`
Permite que usuários favoritem eventos.

```sql
- id: UUID
- user_id: UUID (FK)
- event_id: UUID (FK)
- created_at: TIMESTAMP
```

#### `organizer_followers`
Permite que usuários sigam organizadores para receber notificações.

```sql
- id: UUID
- follower_id: UUID (FK)
- organizer_id: UUID (FK)
- notify_new_events: BOOLEAN
- notify_updates: BOOLEAN
```

## Interface do Usuário

### Card de Evento

O card de evento exibe:

1. **Botões de Ação** (canto superior direito):
   - ⭐ Favoritar evento
   - 🔔 Seguir organizador

2. **Badge de Tipo**: Indica o tipo do evento (Partida, Treino, Grupo, etc.)

3. **Badge de Premiação**: Exibido quando `has_prize = true`
   - Ícone de troféu
   - Valor do prêmio

4. **Informações do Evento**:
   - Título
   - Localização
   - Data e hora
   - Número de participantes

5. **Seção de Pagamento**:
   - **Gratuito**: Badge verde "GRÁTIS"
   - **Pago**: Ícone € + valor
   - Label: "Participação"

6. **Descrição da Premiação** (se houver):
   - Card destacado com borda dourada
   - Ícone de troféu
   - Descrição completa do prêmio

### Exemplos de Uso

#### Evento Gratuito
```typescript
{
  title: "Treino Técnico - Campo Municipal",
  type: "treino",
  isFree: true,
  price: 0
}
```

#### Evento Pago (Divisão de Campo)
```typescript
{
  title: "Pelada Dominical - Parque Central",
  type: "partida",
  isFree: false,
  price: 5,
  paymentType: "per_person",
  paymentDescription: "Valor para dividir o aluguel do campo"
}
```

#### Evento com Premiação
```typescript
{
  title: "Torneio de Futebol Society",
  type: "torneio",
  isFree: false,
  price: 10,
  hasPrize: true,
  prizeAmount: 200,
  prizeDescription: "Troféu + €200 para o time vencedor",
  prizeType: "winner"
}
```

## Fluxo de Pagamento

1. **Usuário se inscreve no evento**
2. **Sistema verifica se é evento pago**
3. **Se pago**:
   - Cria registro em `event_payments` com status `pending`
   - Redireciona para gateway de pagamento
   - Atualiza status para `completed` após confirmação
4. **Se gratuito**:
   - Confirma participação imediatamente

## Fluxo de Premiação

1. **Evento é finalizado**
2. **Organizador define vencedores**
3. **Sistema cria registros em `prize_distributions`**
4. **Status inicial**: `pending`
5. **Após distribuição**: `distributed`
6. **Após reivindicação**: `claimed`

## Notificações

### Favoritos
- Usuário recebe notificação quando evento favoritado é atualizado
- Lembrete 24h antes do evento

### Seguidores
- Notificação quando organizador cria novo evento
- Notificação de atualizações importantes
- Configurável por usuário (`notify_new_events`, `notify_updates`)

## Regras de Negócio

### Pagamentos
1. Eventos gratuitos: `is_free = true` e `price = 0`
2. Eventos pagos: `is_free = false` e `price > 0`
3. Tipo de pagamento deve ser especificado para eventos pagos
4. Moeda padrão: EUR (pode ser alterada)

### Premiações
1. Eventos com prêmio: `has_prize = true`
2. Valor do prêmio deve ser especificado
3. Descrição do prêmio é obrigatória para melhor clareza
4. Tipo de premiação deve ser definido

### Validações
- Preço não pode ser negativo
- Valor do prêmio não pode ser negativo
- Evento pago deve ter `payment_type` definido
- Evento com prêmio deve ter `prize_type` definido

## Migrações

Para aplicar as mudanças no banco de dados:

```bash
# Execute o arquivo SQL de migração
psql -U seu_usuario -d seu_banco < database/migrations/events_with_payments_and_prizes.sql
```

## Tipos TypeScript

Todos os tipos estão definidos em `types/event.ts`:

- `Event`: Interface principal do evento
- `EventPayment`: Registro de pagamento
- `PrizeDistribution`: Distribuição de prêmios
- `EventFavorite`: Favoritos do usuário
- `OrganizerFollower`: Seguidores de organizadores

## Próximos Passos

1. Implementar integração com gateway de pagamento (Stripe/PayPal)
2. Criar sistema de notificações em tempo real
3. Adicionar histórico de pagamentos no perfil do usuário
4. Implementar sistema de avaliações de eventos
5. Criar dashboard para organizadores com métricas financeiras
