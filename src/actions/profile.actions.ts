"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/client";
import { user } from "@/db/schema";
import { updateProfileSchema } from "@/schemas/profile.schema";
import { withAuthAction } from "@/lib/action-helpers";

export const updateUserProfile = withAuthAction(
  updateProfileSchema,
  async (authUser, data) => {
    try {
      const [profile] = await db
        .update(user)
        .set({ name: data.name, image: data.image || null, updatedAt: new Date() })
        .where(eq(user.id, authUser.id))
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
  },
);
