import html2canvas from "html2canvas";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

async function waitForImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }),
    ),
  );
}

export async function exportCardAsImage(elementId: string): Promise<Blob> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("Card element not found");
  }

  await waitForImages(element);

  const canvas = await html2canvas(element, {
    useCORS: true,
    allowTaint: true,
    scale: 2,
    backgroundColor: "#000000",
    logging: false,
    imageTimeout: 20_000,
    onclone: (clonedDoc) => {
      const cloned = clonedDoc.getElementById(elementId);
      if (!cloned) return;
      cloned.querySelectorAll("img").forEach((node) => {
        const img = node as HTMLImageElement;
        if (img.src) {
          img.crossOrigin = "anonymous";
        }
      });
    },
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create image"));
      },
      "image/png",
      1,
    );
  });
}

export function downloadCardImage(blob: Blob, title: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(title) || "overlay-card"}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Uses the native share sheet when the browser supports sharing image files. */
export async function shareCardImage(blob: Blob, title: string): Promise<void> {
  const file = new File(
    [blob],
    `${slugify(title) || "overlay-card"}.png`,
    { type: "image/png" },
  );

  if (!navigator.share) {
    throw new Error("Native sharing is not available on this device");
  }

  const payload: ShareData = {
    title,
    text: "Check out my personalized greeting from Overlay.io!",
    files: [file],
  };

  if (navigator.canShare && !navigator.canShare(payload)) {
    throw new Error("Native sharing is not available for images on this device");
  }

  await navigator.share(payload);
}

/** Tries native share; returns false so the UI can show download / copy options. */
export async function tryNativeShare(blob: Blob, title: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.share) {
    return false;
  }

  const file = new File(
    [blob],
    `${slugify(title) || "overlay-card"}.png`,
    { type: "image/png" },
  );
  const payload: ShareData = {
    title,
    text: "Check out my personalized greeting from Overlay.io!",
    files: [file],
  };

  if (navigator.canShare && !navigator.canShare(payload)) {
    return false;
  }

  try {
    await navigator.share(payload);
    return true;
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw e;
    }
    return false;
  }
}
