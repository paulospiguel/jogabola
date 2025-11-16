-- Schema para Eventos Esportivos com Pagamentos e Premiações

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('partida', 'treino', 'grupo', 'torneio', 'competicao', 'evento')),
  location VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  game_style VARCHAR(50) CHECK (game_style IN ('competitivo', 'recreativo', 'misto')),
  experience_level VARCHAR(50) CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'professional', 'all')),
  current_participants INTEGER DEFAULT 0,
  max_participants INTEGER,
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organizer_name VARCHAR(255) NOT NULL,
  
  -- Campos de Pagamento
  is_free BOOLEAN DEFAULT true,
  price DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  payment_type VARCHAR(50) CHECK (payment_type IN ('per_person', 'total', 'split')),
  payment_description TEXT,
  
  -- Campos de Premiação
  has_prize BOOLEAN DEFAULT false,
  prize_amount DECIMAL(10, 2),
  prize_currency VARCHAR(3) DEFAULT 'EUR',
  prize_description TEXT,
  prize_type VARCHAR(50) CHECK (prize_type IN ('winner', 'draw', 'participation', 'custom')),
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Índices
  INDEX idx_events_start_date (start_date),
  INDEX idx_events_type (type),
  INDEX idx_events_organizer (organizer_id),
  INDEX idx_events_location (location, city)
);

-- Tabela de Imagens de Eventos
CREATE TABLE IF NOT EXISTS event_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_event_images_event (event_id)
);

-- Tabela de Favoritos de Eventos
CREATE TABLE IF NOT EXISTS event_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE (user_id, event_id),
  INDEX idx_event_favorites_user (user_id),
  INDEX idx_event_favorites_event (event_id)
);

-- Tabela de Seguidores de Organizadores
CREATE TABLE IF NOT EXISTS organizer_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notify_new_events BOOLEAN DEFAULT true,
  notify_updates BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE (follower_id, organizer_id),
  INDEX idx_organizer_followers_follower (follower_id),
  INDEX idx_organizer_followers_organizer (organizer_id)
);

-- Tabela de Pagamentos de Eventos
CREATE TABLE IF NOT EXISTS event_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(50),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_event_payments_event (event_id),
  INDEX idx_event_payments_user (user_id),
  INDEX idx_event_payments_status (status)
);

-- Tabela de Distribuição de Prêmios
CREATE TABLE IF NOT EXISTS prize_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  position INTEGER,
  status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'distributed', 'claimed')),
  distributed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  INDEX idx_prize_distributions_event (event_id),
  INDEX idx_prize_distributions_team (team_id),
  INDEX idx_prize_distributions_user (user_id)
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em events
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em event_payments
CREATE TRIGGER update_event_payments_updated_at
  BEFORE UPDATE ON event_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE events IS 'Tabela principal de eventos esportivos com suporte a pagamentos e premiações';
COMMENT ON COLUMN events.payment_type IS 'Tipo de pagamento: per_person (por pessoa), total (valor total), split (dividido entre participantes)';
COMMENT ON COLUMN events.prize_type IS 'Tipo de premiação: winner (vencedor), draw (empate), participation (participação), custom (personalizado)';
COMMENT ON TABLE event_favorites IS 'Eventos favoritados pelos usuários';
COMMENT ON TABLE organizer_followers IS 'Usuários seguindo organizadores para receber notificações';
COMMENT ON TABLE event_payments IS 'Registro de pagamentos realizados para participação em eventos';
COMMENT ON TABLE prize_distributions IS 'Distribuição de prêmios aos vencedores/participantes';
