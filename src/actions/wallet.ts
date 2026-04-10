"use server";

import { and, eq } from "drizzle-orm";
import { wallet } from "@/drizzle/schema";
import { db } from "@/lib/db";

// ─── Ligar wallet ao utilizador ───────────────────────────────────────────────
// Chamada explicitamente pelo utilizador — nunca automática

export async function linkWallet(
  userId: string,
  address: string,
  provider?: string,
) {
  try {
    if (!userId || !address) {
      return { success: false, error: "userId e address são obrigatórios" };
    }

    // Verificar se o endereço já está ligado a outro utilizador
    const existing = await db
      .select()
      .from(wallet)
      .where(eq(wallet.address, address))
      .limit(1);

    if (existing.length > 0 && existing[0].userId !== userId) {
      return {
        success: false,
        error: "Esta wallet já está associada a outra conta.",
      };
    }

    // Se já pertence a este user, retornar sucesso sem duplicar
    if (existing.length > 0 && existing[0].userId === userId) {
      return { success: true, data: existing[0] };
    }

    const [created] = await db
      .insert(wallet)
      .values({
        userId,
        address,
        chain: "solana",
        provider: provider ?? null,
      })
      .returning();

    return { success: true, data: created };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao ligar wallet" };
  }
}

// ─── Desligar wallet do utilizador ────────────────────────────────────────────

export async function unlinkWallet(userId: string, walletId: number) {
  try {
    const [deleted] = await db
      .delete(wallet)
      .where(and(eq(wallet.id, walletId), eq(wallet.userId, userId)))
      .returning();

    if (!deleted) {
      return { success: false, error: "Wallet não encontrada ou não pertence a esta conta." };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Erro ao desligar wallet" };
  }
}

// ─── Listar wallets do utilizador ─────────────────────────────────────────────

export async function getUserWallets(userId: string) {
  try {
    const wallets = await db
      .select()
      .from(wallet)
      .where(eq(wallet.userId, userId));

    return { success: true, data: wallets };
  } catch (error) {
    return { success: false, error: "Erro ao buscar wallets", data: [] };
  }
}

// ─── Verificar se endereço já está associado ──────────────────────────────────

export async function getWalletByAddress(address: string) {
  try {
    const [found] = await db
      .select()
      .from(wallet)
      .where(eq(wallet.address, address))
      .limit(1);

    return { success: true, data: found ?? null };
  } catch (error) {
    return { success: false, data: null, error: "Erro ao verificar wallet" };
  }
}
