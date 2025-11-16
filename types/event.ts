export interface Event {
  id: string;
  title: string;
  description?: string;
  type: 'partida' | 'treino' | 'grupo' | 'torneio' | 'competicao' | 'evento';
  location: string;
  city?: string;
  startDate: string;
  endDate?: string;
  gameStyle?: 'competitivo' | 'recreativo' | 'misto';
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'professional' | 'all';
  currentParticipants: number;
  maxParticipants?: number;
  organizerId: string;
  organizerName: string;
  images?: string[];
  
  isFree: boolean;
  price?: number;
  currency?: string;
  paymentType?: 'per_person' | 'total' | 'split';
  paymentDescription?: string;
  
  hasPrize: boolean;
  prizeAmount?: number;
  prizeCurrency?: string;
  prizeDescription?: string;
  prizeType?: 'winner' | 'draw' | 'participation' | 'custom';
  
  isFavorited?: boolean;
  isFollowingOrganizer?: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface EventPayment {
  id: string;
  eventId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PrizeDistribution {
  id: string;
  eventId: string;
  teamId?: string;
  userId?: string;
  amount: number;
  currency: string;
  position?: number;
  status: 'pending' | 'distributed' | 'claimed';
  distributedAt?: string;
  createdAt: string;
}

export interface EventFavorite {
  id: string;
  userId: string;
  eventId: string;
  createdAt: string;
}

export interface OrganizerFollower {
  id: string;
  followerId: string;
  organizerId: string;
  notifyNewEvents: boolean;
  notifyUpdates: boolean;
  createdAt: string;
}
