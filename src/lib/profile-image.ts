type ProfileCustomFields = Record<string, unknown> | null | undefined;

const PROFILE_IMAGE_KEYS = [
  "profileImage",
  "profileImageUrl",
  "avatar",
  "avatarUrl",
  "image",
  "imageUrl",
  "photo",
  "photoUrl",
] as const;

function pickString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function resolveProfileImage(
  customFields?: ProfileCustomFields,
  fallbackImage?: string | null,
) {
  for (const key of PROFILE_IMAGE_KEYS) {
    const candidate = pickString(customFields?.[key]);
    if (candidate) {
      return candidate;
    }
  }

  return pickString(fallbackImage) || undefined;
}
