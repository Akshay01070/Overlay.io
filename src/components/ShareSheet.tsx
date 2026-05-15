"use client";

import { useEffect, useState } from "react";
import { downloadCardImage, shareCardImage } from "@/lib/exportCard";

interface ShareSheetProps {
  open: boolean;
  blob: Blob | null;
  title: string;
  onClose: () => void;
  onDone: (message: string) => void;
}

export function ShareSheet({
  open,
  blob,
  title,
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

  if (!open || !blob) return null;

  async function run(action: () => Promise<string>) {
    setBusy(true);
    try {
      onDone(await action());
      onClose();
    } catch (e) {
      onDone(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const canNativeShare =
    typeof navigator !== "undefined" &&
    Boolean(navigator.share) &&
    (!navigator.canShare ||
      navigator.canShare({
        files: [new File([blob], "card.png", { type: "image/png" })],
      }));

  const canCopy =
    typeof navigator !== "undefined" &&
    Boolean(navigator.clipboard?.write);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-labelledby="share-sheet-title"
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="share-sheet-title" className="mb-1 text-lg font-semibold text-gray-900">
          Share your card
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Choose how you want to share &ldquo;{title}&rdquo;
        </p>

        <div className="flex flex-col gap-2">
          {canNativeShare && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await shareCardImage(blob, title);
                  return "Shared successfully!";
                })
              }
              className="rounded-xl bg-rose-600 py-3 font-medium text-white hover:bg-rose-700 disabled:opacity-60"
            >
              Share via apps
            </button>
          )}
          {canCopy && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  await navigator.clipboard.write([
                    new ClipboardItem({ "image/png": blob }),
                  ]);
                  return "Image copied to clipboard!";
                })
              }
              className="rounded-xl border border-gray-200 py-3 font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
            >
              Copy image
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void run(async () => {
                downloadCardImage(blob, title);
                return "Image downloaded!";
              })
            }
            className="rounded-xl border border-gray-200 py-3 font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
          >
            Download image
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
