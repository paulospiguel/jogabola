import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { user } from "./users";

export const publicEvent = pgTable("public_event", {
  id: serial("id").primaryKey(),
  
  // Criador/Organizador
  organizerId: text("organizer_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  // Informações básicas
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "partida", "treino", "grupo"
  
  // Localização
  location: text("location").notNull(),
  city: text("city"),
  country: text("country"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  searchRadius: doublePrecision("search_radius"), // em km
  
  // Data e hora
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  
  // Estilo de jogo e requisitos
  gameStyle: text("game_style"), // "competitivo", "recreativo", "misto"
  experienceLevel: text("experience_level"), // "beginner", "intermediate", "advanced", "professional"
  minAge: text("min_age"),
  maxAge: text("max_age"),
  gender: text("gender"), // "masculino", "feminino", "misto"
  positionNeeded: text("position_needed"), // posições específicas necessárias
  
  // Critérios de participação
  participationCriteria: jsonb("participation_criteria").$type<Record<string, any>>().default({}),
  
  // Configurações
  maxParticipants: text("max_participants"),
  currentParticipants: text("current_participants").default("0"),
  isPublic: boolean("is_public").default(true),
  language: text("language"), // idioma preferido
  
  // Imagens
  images: jsonb("images").$type<string[]>().default([]), // array de URLs de imagens
  
  // Status
  status: text("status").default("ativo"), // "ativo", "cancelado", "concluído"
  
  // Metadata
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventApplication = pgTable("event_application", {
  id: serial("id").primaryKey(),
  
  eventId: integer("event_id")
    .notNull()
    .references(() => publicEvent.id, { onDelete: "cascade" }),
  
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  
  status: text("status").default("pendente"), // "pendente", "aceito", "rejeitado"
  message: text("message"), // mensagem do candidato
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

