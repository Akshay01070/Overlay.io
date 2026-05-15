import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Noto_Sans_Devanagari,
  Great_Vibes,
} from "next/font/google";
import { Providers } from "@/components/Providers";
import { APP_NAME } from "@/lib/constants";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
});

const greatVibes = Great_Vibes({
  variable: "--font-signature",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Create personalized greeting cards with your name and photo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
