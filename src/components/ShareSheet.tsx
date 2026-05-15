"use client";

import { useEffect, useState } from "react";
import { downloadCardImage } from "@/lib/exportCard";
import {
  copyLinkToClipboard,
  openEmailShare,
  shareToInstagram,
  shareToWhatsApp,
} from "@/lib/shareLinks";

interface ShareSheetProps {
  open: boolean;
  blob: Blob | null;
  shareUrl: string;
  title: string;
  exportError?: string | null;
  onClose: () => void;
  onDone: (message: string) => void;
}

type ShareAction = {
  id: string;
  label: string;
  description: string;
  icon: string;
  accent?: boolean;
  disabled?: boolean;
  run: () => Promise<string>;
};

export function ShareSheet({
  open,
  blob,
  shareUrl,
  title,
  exportError,
  onClose,
  onDone,
}: ShareSheetProps) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const imageUnavailable = Boolean(exportError) || !blob;

  const actions: ShareAction[] = [
    {
      id: "copy-link",
      label: "Copy link",
      description: "Copy preview page URL",
      icon: "🔗",
      run: async () => {
        await copyLinkToClipboard(shareUrl);
        return "Link copied to clipboard!";
      },
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      description: imageUnavailable
        ? "Image export required"
        : "Send greeting image (no link)",
      icon: "💬",
      disabled: imageUnavailable,
      run: async () => shareToWhatsApp(blob, title),
    },
    {
      id: "instagram",
      label: "Instagram",
      description: imageUnavailable
        ? "Image export required"
        : "Share or upload greeting image",
      icon: "📷",
      disabled: imageUnavailable,
      run: async () => shareToInstagram(blob, title),
    },
    {
      id: "email",
      label: "Email",
      description: "Send link via email app",
      icon: "✉️",
      run: async () => {
        openEmailShare(title, shareUrl);
        return "Opening your email app…";
      },
    },
    {
      id: "download",
      label: "Download greeting",
      description: imageUnavailable
        ? "Image export required"
        : "Save PNG to your device",
      icon: "⬇️",
      accent: true,
      disabled: imageUnavailable,
      run: async () => {
        if (!blob) throw new Error(exportError ?? "Image not ready");
        downloadCardImage(blob, title);
        return "Greeting downloaded!";
      },
    },
  ];

  async function handleAction(action: ShareAction) {
    if (busy || action.disabled) return;
    setBusy(true);
    try {
      const msg = await action.run();
      onDone(msg);
      if (action.id !== "email") {
        onClose();
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        onClose();
        return;
      }
      onDone(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-labelledby="share-sheet-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="share-sheet-title"
              className="text-lg font-semibold text-gray-900"
            >
              Share your greeting
            </h2>
            <p className="mt-0.5 text-sm text-gray-500">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {exportError && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Image export failed ({exportError}). You can still copy the link or
            share via WhatsApp and email.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {actions.map((action) => (
            <li key={action.id}>
              <button
                type="button"
                disabled={busy || action.disabled}
                onClick={() => void handleAction(action)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  action.accent
                    ? "border-rose-200 bg-rose-50 hover:bg-rose-100"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {action.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-gray-900">
                    {action.label}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {action.description}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="mt-4 w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
