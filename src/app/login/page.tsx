"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const {
    continueAsGuest,
    signInWithGoogle,
    signInWithEmail,
    firebaseReady,
    user,
    loading,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (!loading && user) {
    return null;
  }

  async function handleGuest() {
    setError("");
    setBusy(true);
    try {
      await continueAsGuest();
      router.push("/profile-setup");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not continue as guest");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setBusy(true);
    try {
      await signInWithGoogle();
      router.push("/profile-setup");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmail(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signInWithEmail(email, password);
      router.push("/profile-setup");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Email sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100">
        <h1 className="mb-1 text-center text-2xl font-bold tracking-tight text-gray-900">
          {APP_NAME}
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          Create personalized cards with your name and photo
        </p>

        {!firebaseReady && (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Firebase not configured — Guest mode works locally. Add{" "}
            <code className="rounded bg-amber-100 px-1">.env.local</code> for
            Google &amp; Email sign-in.
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={handleGuest}
          className="mb-3 w-full rounded-xl border-2 border-gray-900 bg-gray-900 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          Continue as Guest
        </button>

        <button
          type="button"
          disabled={busy || !firebaseReady}
          onClick={handleGoogle}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 py-3 font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          <span className="text-lg">G</span> Sign in with Google
        </button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">or email</span>
          </div>
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!firebaseReady || busy}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-rose-500 disabled:bg-gray-50"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={!firebaseReady || busy}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-rose-500 disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={!firebaseReady || busy}
            className="w-full rounded-xl bg-rose-600 py-3 font-medium text-white hover:bg-rose-700 disabled:opacity-60"
          >
            Sign in with Email
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Demo app — create users in Firebase Console for email login
        </p>
      </div>
    </main>
  );
}
