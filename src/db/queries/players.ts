import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { players } from "@/db/schema";

export async function findPlayerByEmail(email: string) {
  const [player] = await db
    .select({ id: players.id })
    .from(players)
    .where(eq(players.email, email))
    .limit(1);
  return player ?? null;
}
