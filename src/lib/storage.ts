import type { UserProfile } from "./types";

const PROFILE_KEY = "greeting_profile";
const AUTH_KEY = "greeting_auth";
const PHOTO_DB = "greeting_app";
const PHOTO_STORE = "photos";
const PHOTO_IDB_KEY = "profile_photo";

/** Stored in localStorage when the photo blob lives in IndexedDB. */
export const PROFILE_PHOTO_IDB_MARKER = "__greeting_idb_photo__";

const LARGE_DATA_URL_BYTES = 80_000;

function openPhotoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PHOTO_DB, 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(PHOTO_STORE);
    };
  });
}

async function saveProfilePhotoToIdb(photoUrl: string): Promise<void> {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(PHOTO_STORE).put(photoUrl, PHOTO_IDB_KEY);
  });
}

async function loadProfilePhotoFromIdb(): Promise<string | null> {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readonly");
    tx.onerror = () => reject(tx.error);
    const req = tx.objectStore(PHOTO_STORE).get(PHOTO_IDB_KEY);
    req.onsuccess = () => resolve((req.result as string | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function clearProfilePhotoFromIdb(): Promise<void> {
  const db = await openPhotoDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTO_STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(PHOTO_STORE).delete(PHOTO_IDB_KEY);
  });
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.code === 22)
  );
}

function shouldStorePhotoInIdb(photoUrl: string): boolean {
  return (
    photoUrl.startsWith("data:") && photoUrl.length > LARGE_DATA_URL_BYTES
  );
}

function writeProfileJson(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function persistPhotoOffMainRecord(profile: UserProfile, photoUrl: string): void {
  try {
    writeProfileJson({ ...profile, photoUrl: PROFILE_PHOTO_IDB_MARKER });
  } catch (error) {
    if (!isQuotaError(error)) throw error;
  }
  void saveProfilePhotoToIdb(photoUrl);
}

export interface StoredAuth {
  uid: string;
  email?: string | null;
  method: "guest" | "google" | "email";
}

export function loadProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;

  const { photoUrl } = profile;

  if (!photoUrl.startsWith("data:")) {
    void clearProfilePhotoFromIdb();
    try {
      writeProfileJson(profile);
    } catch (error) {
      if (isQuotaError(error)) {
        console.warn("Could not save profile to localStorage", error);
      }
    }
    return;
  }

  if (shouldStorePhotoInIdb(photoUrl)) {
    persistPhotoOffMainRecord(profile, photoUrl);
    return;
  }

  try {
    writeProfileJson(profile);
    void clearProfilePhotoFromIdb();
  } catch (error) {
    if (!isQuotaError(error)) throw error;
    persistPhotoOffMainRecord(profile, photoUrl);
  }
}

export async function hydrateProfilePhoto(
  profile: UserProfile,
): Promise<UserProfile> {
  if (profile.photoUrl !== PROFILE_PHOTO_IDB_MARKER) {
    return profile;
  }
  try {
    const photoUrl = await loadProfilePhotoFromIdb();
    return photoUrl ? { ...profile, photoUrl } : profile;
  } catch {
    return profile;
  }
}

export function loadStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function saveStoredAuth(auth: StoredAuth): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearSession(): void {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(AUTH_KEY);
  void clearProfilePhotoFromIdb();
}

export const DEFAULT_PROFILE: UserProfile = {
  displayName: "Guest",
  photoUrl: "/guest-avatar.png",
  isPremium: false,
};
