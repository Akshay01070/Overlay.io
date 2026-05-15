"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GreetingCard } from "@/components/GreetingCard";
import { PremiumModal } from "@/components/PremiumModal";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ShareSheet } from "@/components/ShareSheet";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/constants";
import { getTemplateById } from "@/data/templates";
import {
  exportCardAsImage,
  tryNativeShare,
} from "@/lib/exportCard";

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const template = getTemplateById(id);
  const { profile, loading, user, setPremium } = useAuth();
  const [sharing, setSharing] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (!loading && !user) {
    return null;
  }

  if (!template) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Template not found</p>
        <Link href="/" className="text-rose-600 hover:underline">
          Back to home
        </Link>
      </main>
    );
  }

  const locked = template.isPremium && !profile.isPremium;

  async function handleShare() {
    if (locked) {
      setPremiumOpen(true);
      return;
    }

    setSharing(true);
    setMessage("");
    try {
      const blob = await exportCardAsImage("export-card");
      const shared = await tryNativeShare(blob, template!.title);
      if (shared) {
        setMessage("Shared successfully!");
        return;
      }
      setShareBlob(blob);
      setShareOpen(true);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        return;
      }
      setMessage(
        e instanceof Error ? e.message : "Could not prepare card image",
      );
    } finally {
      setSharing(false);
    }
  }

  function handleSubscribe() {
    setPremium(true);
    setPremiumOpen(false);
    setMessage("Premium unlocked (demo mode)");
  }

  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-rose-50 to-white">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <Link
          href="/"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back
        </Link>
        <Link href="/" className="text-lg font-bold tracking-tight text-gray-900">
          {APP_NAME}
        </Link>
        <ProfileMenu />
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6">
        <p className="mb-4 text-center text-sm font-medium text-gray-600">
          {template.title}
        </p>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="w-full sm:max-w-md">
            <GreetingCard
              template={template}
              profile={profile}
              exportId="export-card"
              variant="preview"
              className="shadow-2xl"
            />
          </div>
        </div>

        {message && (
          <p className="mt-4 text-center text-sm text-green-700">{message}</p>
        )}

        <button
          type="button"
          onClick={() => void handleShare()}
          disabled={sharing}
          className="mt-6 w-full shrink-0 rounded-xl bg-rose-600 py-4 text-lg font-semibold text-white shadow-lg hover:bg-rose-700 disabled:opacity-60"
        >
          {sharing ? "Preparing…" : locked ? "🔒 Unlock to Share" : "Share"}
        </button>

        {locked && (
          <p className="mt-2 text-center text-xs text-amber-700">
            This is a premium template
          </p>
        )}
      </div>

      <ShareSheet
        open={shareOpen}
        blob={shareBlob}
        title={template.title}
        onClose={() => setShareOpen(false)}
        onDone={setMessage}
      />

      <PremiumModal
        open={premiumOpen}
        onClose={() => setPremiumOpen(false)}
        onSubscribe={handleSubscribe}
      />
    </main>
  );
}
