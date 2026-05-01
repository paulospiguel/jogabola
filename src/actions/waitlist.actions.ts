"use server";

import { z } from "zod";
import { addToWaitlist } from "@/lib/notion";

const schema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
});

export async function joinWaitlist(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  const { name, email } = parsed.data;

  try {
    await addToWaitlist(name, email);
    return { success: true };
  } catch (err) {
    console.error("[waitlist] error:", err);
    return { success: false, error: "Erro ao registar. Tenta novamente." };
  }
}
