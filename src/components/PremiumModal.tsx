"use client";

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

export function PremiumModal({ open, onClose, onSubscribe }: PremiumModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Go Premium</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="mb-4 text-gray-600">
          Unlock all premium greeting templates and share without limits.
        </p>
        <ul className="mb-6 space-y-2 text-sm text-gray-700">
          <li>✓ Exclusive premium designs</li>
          <li>✓ Festival &amp; anniversary collections</li>
          <li>✓ High-quality share exports</li>
        </ul>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onSubscribe}
            className="flex-1 rounded-xl bg-rose-600 px-4 py-3 font-medium text-white hover:bg-rose-700"
          >
            Subscribe — ₹99/mo (Demo)
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
