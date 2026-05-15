"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { compressImageDataUrl } from "@/lib/compressImage";
import { GUEST_AVATAR_URL } from "@/lib/profilePhoto";
import type { UserProfile } from "@/lib/types";

function ProfileForm({
  profile,
  isGuest,
  onSave,
  onSkip,
}: {
  profile: UserProfile;
  isGuest: boolean;
  onSave: (name: string, photoUrl: string) => void | Promise<void>;
  onSkip: (photoUrl: string) => void | Promise<void>;
}) {
  const [name, setName] = useState(profile.displayName);
  const [photoUrl, setPhotoUrl] = useState(
    isGuest ? GUEST_AVATAR_URL : profile.photoUrl,
  );
  const [saving, setSaving] = useState(false);

  async function preparePhotoUrl(url: string): Promise<string> {
    if (!url.startsWith("data:")) return url;
    return compressImageDataUrl(url);
  }

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    if (isGuest) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      void preparePhotoUrl(reader.result).then(setPhotoUrl);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const photo = isGuest ? GUEST_AVATAR_URL : await preparePhotoUrl(photoUrl);
      await onSave(trimmed, photo);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-100"
    >
      <h1 className="mb-1 text-2xl font-bold text-gray-900">
        Set up your profile
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Your name and photo appear on every greeting card
      </p>

      <div className="mb-6 flex flex-col items-center gap-3">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-[3px] border-[#22c55e] bg-gray-100">
          <Image
            src={photoUrl}
            alt="Profile"
            fill
            className="object-cover"
            unoptimized={photoUrl.startsWith("data:")}
          />
        </div>
        {!isGuest && (
          <label className="cursor-pointer rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            Upload photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </label>
        )}
        {isGuest && (
          <p className="text-xs text-gray-500">
            Sign in to use your own photo on cards
          </p>
        )}
      </div>

      <label className="mb-6 block">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          Your name
        </span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Abhinav"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-rose-500"
        />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="mb-2 w-full rounded-xl bg-rose-600 py-3 font-medium text-white hover:bg-rose-700 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save & continue"}
      </button>
      <button
        type="button"
        disabled={saving}
        onClick={() => {
          setSaving(true);
          void (async () => {
            try {
              if (isGuest) await onSkip(GUEST_AVATAR_URL);
              else await onSkip(await preparePhotoUrl(photoUrl));
            } finally {
              setSaving(false);
            }
          })();
        }}
        className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-60"
      >
        Skip for now
      </button>
    </form>
  );
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const { user, profile, updateProfile, loading, hasCompletedProfile } =
    useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  async function handleSave(name: string, photoUrl: string) {
    updateProfile({ displayName: name, photoUrl });
    router.push("/");
  }

  async function handleSkip(photoUrl: string) {
    if (hasCompletedProfile) {
      router.push("/");
    } else {
      updateProfile({
        displayName:
          profile.displayName === "Guest" ? "Friend" : profile.displayName,
        photoUrl,
      });
      router.push("/");
    }
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-white to-amber-50 px-4 py-10">
      <ProfileForm
        key={user.uid}
        profile={profile}
        isGuest={user.method === "guest"}
        onSave={handleSave}
        onSkip={handleSkip}
      />
    </main>
  );
}
