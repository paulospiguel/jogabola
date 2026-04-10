import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./users";

// Tabela de wallets ligadas ao utilizador (recurso opcional, não identidade)
// Suporta múltiplas wallets por utilizador e está preparada para embedded wallets futuras
export const wallet = pgTable("wallet", {
  id: serial("id").primaryKey(),

  // Referência ao utilizador (wallet é recurso ligado ao user, não identidade)
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Endereço público da wallet (único globalmente)
  address: text("address").notNull().unique(),

  // Chain — "solana" por omissão; preparado para outras chains no futuro
  chain: text("chain").notNull().default("solana"),

  // Provider: "phantom" | "solflare" | "backpack" | "embedded" (futuro) | null
  provider: text("provider"),

  // Label amigável definido pelo utilizador (ex: "Carteira principal")
  label: text("label"),

  // Timestamp de verificação por assinatura (proof of ownership)
  // NULL = ligada mas não verificada; preenchido = verificada
  verifiedAt: timestamp("verified_at"),

  createdAt: timestamp("created_at").defaultNow(),
});
