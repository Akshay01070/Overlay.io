"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { compressImageDataUrl } from "@/lib/compressImage";
import { applyGuestProfile, GUEST_AVATAR_URL } from "@/lib/profilePhoto";
import {
  clearSession,
  DEFAULT_PROFILE,
  hydrateProfilePhoto,
  loadProfile,
  loadStoredAuth,
  saveProfile,
  saveStoredAuth,
  type StoredAuth,
} from "@/lib/storage";
import type { AuthMethod, AuthUser, UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfile;
  loading: boolean;
  firebaseReady: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setPremium: (value: boolean) => void;
  continueAsGuest: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasCompletedProfile: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function profileFromFirebaseUser(user: User, existing: UserProfile | null): UserProfile {
  return {
    displayName:
      existing?.displayName ||
      user.displayName ||
      user.email?.split("@")[0] ||
      "User",
    photoUrl:
      existing?.photoUrl ||
      user.photoURL ||
      DEFAULT_PROFILE.photoUrl,
    isPremium: existing?.isPremium ?? false,
  };
}

function readStoredUser(): AuthUser | null {
  const stored = loadStoredAuth();
  if (!stored) return null;
  return {
    uid: stored.uid,
    email: stored.email,
    method: stored.method,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);
  const firebaseReady = isFirebaseConfigured();
  const [authResolving, setAuthResolving] = useState(firebaseReady);
  const loading = !hydrated || authResolving;

  const persistProfile = useCallback(
    (next: UserProfile, authMethod: AuthMethod | null = user?.method ?? null) => {
      const normalized =
        authMethod === "guest" ? applyGuestProfile(next) : next;
      setProfile(normalized);
      if (normalized.photoUrl.startsWith("data:")) {
      void compressImageDataUrl(normalized.photoUrl).then((compressed) => {
        const stored = { ...normalized, photoUrl: compressed };
        setProfile(stored);
        saveProfile(stored);
      });
      return;
    }
    saveProfile(normalized);
  },
  [user?.method],
);

  useEffect(() => {
    const storedUser = readStoredUser();
    const storedProfile = loadProfile();
    if (storedUser) {
      setUser(storedUser);
    }
    const baseProfile = storedProfile ?? DEFAULT_PROFILE;
    const profileForGuest =
      storedUser?.method === "guest"
        ? applyGuestProfile(baseProfile)
        : baseProfile;
    void hydrateProfilePhoto(profileForGuest).then(setProfile);
    setHydrated(true);
    if (!firebaseReady) {
      setAuthResolving(false);
    }
  }, [firebaseReady]);

  const persistAuth = useCallback((auth: StoredAuth | null) => {
    if (auth) {
      setUser({ uid: auth.uid, email: auth.email, method: auth.method });
      saveStoredAuth(auth);
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const storedAuth = loadStoredAuth();
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthResolving(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const stored = loadStoredAuth();
        const method: AuthMethod =
          stored?.method === "google"
            ? "google"
            : firebaseUser.isAnonymous
              ? "guest"
              : "email";

        persistAuth({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          method: method ?? "email",
        });

        const merged = profileFromFirebaseUser(
          firebaseUser,
          loadProfile(),
        );
        persistProfile(merged, method);
      } else if (!storedAuth) {
        setUser(null);
      }
      setAuthResolving(false);
    });

    return () => unsubscribe();
  }, [persistAuth, persistProfile]);

  const continueAsGuest = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      const cred = await signInAnonymously(auth);
      persistAuth({
        uid: cred.user.uid,
        email: null,
        method: "guest",
      });
      const existing = loadProfile();
      persistProfile(existing ?? DEFAULT_PROFILE, "guest");
      return;
    }

    const guestId = `guest_${Date.now()}`;
    persistAuth({ uid: guestId, email: null, method: "guest" });
    persistProfile(loadProfile() ?? DEFAULT_PROFILE, "guest");
  }, [persistAuth, persistProfile]);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error(
        "Firebase is not configured. Add keys to .env.local (see .env.example).",
      );
    }
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    persistAuth({
      uid: cred.user.uid,
      email: cred.user.email,
      method: "google",
    });
    persistProfile(profileFromFirebaseUser(cred.user, loadProfile()));
  }, [persistAuth, persistProfile]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error(
          "Firebase is not configured. Add keys to .env.local (see .env.example).",
        );
      }
      const cred = await signInWithEmailAndPassword(auth, email, password);
      persistAuth({
        uid: cred.user.uid,
        email: cred.user.email,
        method: "email",
      });
      persistProfile(profileFromFirebaseUser(cred.user, loadProfile()));
    },
    [persistAuth, persistProfile],
  );

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      await firebaseSignOut(auth);
    }
    clearSession();
    setUser(null);
    setProfile(DEFAULT_PROFILE);
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      const next = { ...profile, ...updates };
      persistProfile(next, user?.method ?? null);
    },
    [profile, persistProfile, user?.method],
  );

  useEffect(() => {
    if (user?.method === "guest" && profile.photoUrl !== GUEST_AVATAR_URL) {
      persistProfile(profile, "guest");
    }
  }, [user?.method, profile.photoUrl, profile, persistProfile]);

  const setPremium = useCallback(
    (value: boolean) => {
      updateProfile({ isPremium: value });
    },
    [updateProfile],
  );

  const hasCompletedProfile = useMemo(() => {
    return Boolean(
      profile.displayName?.trim() &&
        profile.photoUrl?.trim() &&
        profile.displayName !== "Guest",
    );
  }, [profile]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      firebaseReady,
      updateProfile,
      setPremium,
      continueAsGuest,
      signInWithGoogle,
      signInWithEmail,
      signOut,
      hasCompletedProfile,
    }),
    [
      user,
      profile,
      loading,
      firebaseReady,
      updateProfile,
      setPremium,
      continueAsGuest,
      signInWithGoogle,
      signInWithEmail,
      signOut,
      hasCompletedProfile,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
