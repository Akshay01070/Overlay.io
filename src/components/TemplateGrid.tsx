"use client";

import Link from "next/link";
import { GreetingCard } from "@/components/GreetingCard";
import type { GreetingTemplate, UserProfile } from "@/lib/types";

interface TemplateGridProps {
  templates: GreetingTemplate[];
  profile: UserProfile;
  isPremiumUser: boolean;
  onPremiumClick: (template: GreetingTemplate) => void;
}

function TemplateTile({
  template,
  profile,
  locked,
  onPremiumClick,
}: {
  template: GreetingTemplate;
  profile: UserProfile;
  locked: boolean;
  onPremiumClick: (template: GreetingTemplate) => void;
}) {
  const card = (
    <article className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative flex h-[300px] items-start justify-center overflow-hidden bg-gray-100 pt-3">
        <div className="w-[min(100%,220px)]">
          <GreetingCard
            template={template}
            profile={profile}
            variant="thumbnail"
          />
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="truncate text-sm font-medium text-gray-800">
          {template.title}
        </span>
        {template.isPremium && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
            Premium
          </span>
        )}
      </div>
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900">
            🔒 Premium
          </span>
        </div>
      )}
    </article>
  );

  if (locked) {
    return (
      <button
        type="button"
        onClick={() => onPremiumClick(template)}
        className="w-full text-left"
      >
        {card}
      </button>
    );
  }

  return (
    <Link href={`/preview/${template.id}`} className="block">
      {card}
    </Link>
  );
}

export function TemplateGrid({
  templates,
  profile,
  isPremiumUser,
  onPremiumClick,
}: TemplateGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {templates.map((template) => (
        <TemplateTile
          key={template.id}
          template={template}
          profile={profile}
          locked={template.isPremium && !isPremiumUser}
          onPremiumClick={onPremiumClick}
        />
      ))}
    </div>
  );
}
