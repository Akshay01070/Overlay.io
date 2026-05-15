import { APP_NAME } from "@/lib/constants";
import { downloadCardImage } from "@/lib/exportCard";

export function buildShareMessage(title: string, pageUrl: string): string {
  return `Check out my personalized "${title}" greeting from ${APP_NAME}! ${pageUrl}`;
}

export function buildEmailSubject(title: string): string {
  return `My ${title} greeting from ${APP_NAME}`;
}

export function getEmailShareUrl(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function copyLinkToClipboard(url: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard is not supported in this browser");
  }
  await navigator.clipboard.writeText(url);
}

/** Share greeting PNG via system share sheet (pick WhatsApp) — no link. */
export async function shareToWhatsApp(
  blob: Blob | null,
  title: string,
): Promise<string> {
  if (!blob) {
    throw new Error("Image could not be prepared");
  }

  const safeName = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const file = new File(
    [blob],
    `${safeName || "overlay-greeting"}.png`,
    { type: "image/png" },
  );

  if (navigator.share) {
    const payloads: ShareData[] = [{ files: [file] }, { files: [file], title }];

    for (const payload of payloads) {
      if (navigator.canShare && !navigator.canShare(payload)) {
        continue;
      }
      try {
        await navigator.share(payload);
        return "";
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          throw e;
        }
      }
    }
  }

  downloadCardImage(blob, title);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    window.open("https://api.whatsapp.com/", "_blank", "noopener,noreferrer");
    return "Image saved to your device. In WhatsApp, tap attach (📎) and pick the greeting image.";
  }

  window.open("https://web.whatsapp.com/", "_blank", "noopener,noreferrer");
  return "Image downloaded. In WhatsApp Web, use the attach button to send the greeting PNG.";
}

export function openEmailShare(title: string, pageUrl: string): void {
  const subject = buildEmailSubject(title);
  const body = `${buildShareMessage(title, pageUrl)}\n\nView the card: ${pageUrl}`;
  window.location.href = getEmailShareUrl(subject, body);
}

/** Instagram has no reliable web URL for image posts — download + native share or open app. */
export async function shareToInstagram(
  blob: Blob | null,
  title: string,
): Promise<string> {
  if (!blob) {
    throw new Error("Download the greeting first — image could not be prepared");
  }

  const file = new File([blob], "overlay-greeting.png", { type: "image/png" });

  if (navigator.share) {
    const payload: ShareData = {
      title,
      text: `My greeting from ${APP_NAME}`,
      files: [file],
    };
    if (!navigator.canShare || navigator.canShare(payload)) {
      try {
        await navigator.share(payload);
        return "Pick Instagram from the share menu to post your greeting.";
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") {
          throw e;
        }
      }
    }
  }

  downloadCardImage(blob, title);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.open("instagram://app", "_blank");
    return "Greeting downloaded. Open Instagram and share from your gallery.";
  }
  window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  return "Greeting downloaded. Upload it in the Instagram app or website.";
}
