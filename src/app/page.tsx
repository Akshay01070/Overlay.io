"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CategoryTabs } from "@/components/CategoryTabs";
import { PremiumModal } from "@/components/PremiumModal";
import { ProfileMenu } from "@/components/ProfileMenu";
import { TemplateGrid } from "@/components/TemplateGrid";
import { useAuth } from "@/context/AuthContext";
import { APP_NAME } from "@/lib/constants";
import { TEMPLATES } from "@/data/templates";
import type { GreetingTemplate, TemplateCategory } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const { user, profile, loading, setPremium } = useAuth();
  const [category, setCategory] = useState<TemplateCategory>("all");
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [blockedTemplate, setBlockedTemplate] =
    useState<GreetingTemplate | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  const filtered = useMemo(() => {
    if (category === "all") return TEMPLATES;
    return TEMPLATES.filter((t) => t.category === category);
  }, [category]);

  function handlePremiumClick(template: GreetingTemplate) {
    setBlockedTemplate(template);
    setPremiumOpen(true);
  }

  function handleSubscribe() {
    setPremium(true);
    setPremiumOpen(false);
    if (blockedTemplate) {
      router.push(`/preview/${blockedTemplate.id}`);
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
    <main className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              {APP_NAME}
            </h1>
            {profile.isPremium && (
              <p className="mt-0.5 text-sm text-gray-500">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  Premium
                </span>
              </p>
            )}
          </div>
          <ProfileMenu />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <CategoryTabs active={category} onChange={setCategory} />
        <p className="mb-4 mt-4 text-sm text-gray-500">
          Tap a template to preview and share. Cards show your live name and
          photo.
        </p>
        <TemplateGrid
          templates={filtered}
          profile={profile}
          isPremiumUser={profile.isPremium}
          onPremiumClick={handlePremiumClick}
        />
      </div>

      <PremiumModal
        open={premiumOpen}
        onClose={() => setPremiumOpen(false)}
        onSubscribe={handleSubscribe}
      />
    </main>
  );
}
