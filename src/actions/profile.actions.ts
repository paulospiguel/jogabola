"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db/client";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { updateProfileSchema } from "@/schemas/profile.schema";
import type { ActionResult } from "@/types/common";
import type { UserProfile } from "@/types/profile";

export async function updateUserProfileAction(
  input: unknown,
): Promise<ActionResult<UserProfile>> {
  return updateUserProfile(input);
}

export async function updateUserProfile(
  input: unknown,
): Promise<ActionResult<UserProfile>> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { success: false, error: { code: "UNAUTHORIZED" } };
  }

  const parsed = updateProfileSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        fieldErrors: Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).filter(
            ([, value]) => value?.length,
          ),
        ) as Record<string, string[]>,
      },
    };
  }

  try {
    const [profile] = await db
      .update(user)
      .set({
        name: parsed.data.name,
        image: parsed.data.image || null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
      });

    if (!profile) {
      return { success: false, error: { code: "PROFILE_NOT_FOUND" } };
    }

    revalidatePath("/arena/profile");
    revalidatePath("/arena");

    return { success: true, data: profile };
  } catch {
    return { success: false, error: { code: "PROFILE_UPDATE_FAILED" } };
  }
}
