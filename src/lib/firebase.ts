import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

/** Turns Firebase Auth errors into actionable messages (e.g. unauthorized-domain on Vercel). */
export function formatFirebaseAuthError(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: string }).code)
      : "";

  if (code === "auth/unauthorized-domain") {
    const host =
      typeof window !== "undefined"
        ? window.location.hostname
        : "your deployed domain";
    return (
      `Firebase blocked sign-in: "${host}" is not an authorized domain. ` +
      `In Firebase Console → Authentication → Settings → Authorized domains, add "${host}" ` +
      `(no https://). For Vercel preview URLs, add each hostname separately.`
    );
  }

  if (error instanceof Error) return error.message;
  return "Sign-in failed";
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null;

  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  if (!auth) {
    auth = getAuth(app);
  }
  return auth;
}
