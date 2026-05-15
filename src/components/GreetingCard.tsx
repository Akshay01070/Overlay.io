"use client";

import Image from "next/image";
import type { GreetingTemplate, UserProfile } from "@/lib/types";

interface GreetingCardProps {
  template: GreetingTemplate;
  profile: UserProfile;
  className?: string;
  exportId?: string;
  /** `preview` fills its container; `thumbnail` is for grid tiles. */
  variant?: "default" | "preview" | "thumbnail";
}

function renderQuoteLine(
  line: GreetingTemplate["quote"][number],
  index: number,
) {
  const { text, highlight, highlightColor = "#e11d48" } = line;

  if (!highlight || !text.includes(highlight)) {
    return (
      <p key={index} className="text-center leading-relaxed">
        {text}
      </p>
    );
  }

  const parts = text.split(highlight);
  return (
    <p key={index} className="text-center leading-relaxed">
      {parts[0]}
      <span style={{ color: highlightColor }}>{highlight}</span>
      {parts[1]}
    </p>
  );
}

const variantClasses = {
  default: "relative mx-auto aspect-[4/5] w-full max-w-[360px]",
  preview: "relative mx-auto aspect-[4/5] w-full max-w-full",
  thumbnail: "relative mx-auto aspect-[4/5] w-full",
};

export function GreetingCard({
  template,
  profile,
  className = "",
  exportId,
  variant = "default",
}: GreetingCardProps) {
  return (
    <div
      id={exportId}
      className={`isolate ${variantClasses[variant]} overflow-hidden rounded-lg bg-black shadow-xl ${className}`}
    >
      <div className="relative z-[2] flex h-14 items-center justify-center bg-[#1a1a1a] px-16">
        <h2 className="truncate text-center text-lg font-medium tracking-wide text-white">
          {profile.displayName}
        </h2>
      </div>

      <div className="absolute left-3 top-7 z-[3]">
        <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full border-[3px] border-[#22c55e] bg-gray-200 shadow-md">
          <Image
            src={profile.photoUrl}
            alt={profile.displayName}
            fill
            className="object-cover"
            sizes="72px"
            unoptimized={profile.photoUrl.startsWith("data:")}
          />
        </div>
      </div>

      <div className="relative h-[calc(100%-3.5rem)] w-full">
        <Image
          src={template.backgroundUrl}
          alt={template.title}
          fill
          className="object-cover"
          sizes="360px"
          priority={Boolean(exportId)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />

        <div className="quote-font absolute inset-x-4 top-[18%] z-[1] px-2 text-[15px] font-medium text-[#3d2314]">
          <div className="mx-auto max-w-[280px] space-y-1 rounded-md bg-white/40 px-3 py-4 backdrop-blur-[2px]">
            <span className="block text-center text-2xl leading-none text-[#3d2314]/70">
              &ldquo;
            </span>
            {template.quote.map((line, i) => renderQuoteLine(line, i))}
            <span className="block text-center text-2xl leading-none text-[#3d2314]/70">
              &rdquo;
            </span>
            {template.signature && (
              <p className="signature-font mt-3 text-center text-lg text-[#5c3d2e]">
                {template.signature}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
