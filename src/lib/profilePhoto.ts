import type { UserProfile } from "@/lib/types";

export const GUEST_AVATAR_URL = "/guest-avatar.png";

const PROFILE_PHOTO_IDB_MARKER = "__greeting_idb_photo__";

export function applyGuestProfile(profile: UserProfile): UserProfile {
  return { ...profile, photoUrl: GUEST_AVATAR_URL };
}

export function resolveProfilePhotoUrl(photoUrl: string): string {
  if (!photoUrl || photoUrl === PROFILE_PHOTO_IDB_MARKER) {
    return GUEST_AVATAR_URL;
  }
  return photoUrl;
}
