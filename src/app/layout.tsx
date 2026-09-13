import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Connect with Afghan professionals, organizations, businesses, opportunities, and events.";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Afghan Hub",
    template: "%s | Afghan Hub",
  },
  description,
  openGraph: {
    type: "website",
    siteName: "Afghan Hub",
    title: "Afghan Hub",
    description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Afghan Hub — community, opportunities, organizations, businesses, and events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Afghan Hub",
    description,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
