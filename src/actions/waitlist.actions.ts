"use server";

import { z } from "zod";
import { addToWaitlist } from "@/lib/notion";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  email: z.string().email("Invalid email address."),
});

// eslint-disable-next-line server-auth-actions
// eslint-disable-next-line react-doctor/server-auth-actions
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
    return { success: false, error: "An error occurred. Please try again." };
  }
}
