"use server";

import { timer } from "@/drizzle/schema/timer";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";

/**
 * Salva dados persistidos do usuário no banco de dados
 * @param userId - ID do usuário
 * @param key - Chave única para identificar o dado
 * @param data - Dados a serem salvos (será convertido para JSON)
 */
export async function saveDataToCloud<T>(
  userId: string,
  key: string,
  data: T,
): Promise<{ success: boolean; error?: string }> {
  try {
    const jsonData = JSON.stringify(data);

    // Upsert: Insert or update if exists
    await db
      .insert(timer)
      .values({
        userId,
        key,
        data: jsonData,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [timer.userId, timer.key],
        set: {
          data: jsonData,
          updatedAt: new Date(),
        },
      });

    return { success: true };
  } catch (error) {
    console.error("Error saving data to cloud:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Carrega dados persistidos do usuário do banco de dados
 * @param userId - ID do usuário
 * @param key - Chave única para identificar o dado
 * @returns Os dados salvos ou null se não existirem
 */
export async function loadDataFromCloud<T>(
  userId: string,
  key: string,
): Promise<T | null> {
  try {
    const result = await db
      .select()
      .from(timer)
      .where(and(eq(timer.userId, userId), eq(timer.key, key)))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    return JSON.parse(result[0].data) as T;
  } catch (error) {
    console.error("Error loading data from cloud:", error);
    return null;
  }
}

/**
 * Deleta dados persistidos do usuário do banco de dados
 * @param userId - ID do usuário
 * @param key - Chave única para identificar o dado
 */
export async function deleteDataFromCloud(
  userId: string,
  key: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .delete(timer)
      .where(and(eq(timer.userId, userId), eq(timer.key, key)));

    return { success: true };
  } catch (error) {
    console.error("Error deleting data from cloud:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
