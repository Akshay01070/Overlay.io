"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { resolveProfilePhotoUrl } from "@/lib/profilePhoto";
import type { UserProfile } from "@/lib/types";

function profilePhotoSrc(photoUrl: string, isGuest: boolean): string {
  if (isGuest) return resolveProfilePhotoUrl("");
  return resolveProfilePhotoUrl(photoUrl);
}

function ProfileAvatar({
  profile,
  isGuest,
  size = 40,
}: {
  profile: UserProfile;
  isGuest: boolean;
  size?: number;
}) {
  const src = profilePhotoSrc(profile.photoUrl, isGuest);
  const isData = src.startsWith("data:");

  return (
    <div
      className="relative overflow-hidden rounded-full border-2 border-[#22c55e] bg-gray-100 shadow-sm"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={profile.displayName}
        fill
        className="object-cover"
        sizes={`${size}px`}
        unoptimized={isData}
      />
    </div>
  );
}

export function ProfileMenu() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const isGuest = user?.method === "guest";

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  async function handleSignOut() {
    setOpen(false);
    await signOut();
    router.push("/login");
  }

  async function handleSignIn() {
    setOpen(false);
    await signOut();
    router.push("/login");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full ring-2 ring-transparent transition hover:ring-rose-200 focus:outline-none focus-visible:ring-rose-400"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <ProfileAvatar profile={profile} isGuest={isGuest} />
        {profile.isPremium && (
          <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-amber-400 px-1 text-[9px] font-bold text-amber-950">
            ★
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          <p className="border-b border-gray-100 px-4 py-2 text-sm font-medium text-gray-900">
            {profile.displayName}
          </p>
          <Link
            href="/profile-setup"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Edit profile
          </Link>
          {isGuest && (
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleSignIn()}
              className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
            >
              Sign in
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleSignOut()}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
