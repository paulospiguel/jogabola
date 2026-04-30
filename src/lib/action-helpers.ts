import { headers } from "next/headers";
import type { ZodTypeAny, z } from "zod";
import { auth } from "@/lib/auth";
import type { ActionResult } from "@/types/common";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export function validationError(
  fieldErrors: Record<string, string[] | undefined>,
): ActionResult<never> {
  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      fieldErrors: Object.fromEntries(
        Object.entries(fieldErrors).filter(([, v]) => v?.length),
      ) as Record<string, string[]>,
    },
  };
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  const u = session?.user;
  if (!u?.id) return null;
  return { id: u.id, name: u.name, email: u.email };
}

export function withAction<S extends ZodTypeAny, T>(
  schema: S,
  fn: (data: z.infer<S>) => Promise<ActionResult<T>>,
): (input: unknown) => Promise<ActionResult<T>> {
  return async (input: unknown) => {
    const parsed = schema.safeParse(input);
    if (!parsed.success)
      return validationError(parsed.error.flatten().fieldErrors);
    return fn(parsed.data);
  };
}

export function withAuthAction<S extends ZodTypeAny, T>(
  schema: S,
  fn: (user: AuthUser, data: z.infer<S>) => Promise<ActionResult<T>>,
): (input: unknown) => Promise<ActionResult<T>> {
  return async (input: unknown) => {
    const user = await getAuthUser();
    if (!user) return { success: false, error: { code: "UNAUTHORIZED" } };
    const parsed = schema.safeParse(input);
    if (!parsed.success)
      return validationError(parsed.error.flatten().fieldErrors);
    return fn(user, parsed.data);
  };
}
