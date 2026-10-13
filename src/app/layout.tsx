import localFont from "next/font/local";
import { cookies, headers } from "next/headers";
import { parseLocale } from "@/lib/i18n/locale";
import { getLocale } from "@/lib/i18n/server";
import { languageDirection } from "@/lib/i18n/locale";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { GlobalNetworkBackground } from "@/components/visual/global-network-background";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const arabic = localFont({ src: "../../public/fonts/noto-sans-arabic-regular.ttf", variable: "--font-arabic", display: "swap", preload: true });

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const entryTransition = (await headers()).get("x-afghan-hub-entry-transition") === "true";
  const navigatorLocale = parseLocale((await cookies()).get("afghan-hub-navigator-language")?.value) ?? locale;
  return (
    <html
      lang={locale}
      dir={languageDirection(locale)}
      className={`${geistSans.variable} ${geistMono.variable} ${arabic.variable} h-full antialiased`}
    >
      <head>{entryTransition ? <style>{"@view-transition { navigation: auto; }"}</style> : null}</head>
      <body className="min-h-full flex flex-col">
        <GlobalNetworkBackground />
        <div className="app-content flex min-h-full flex-1 flex-col">
          <LocaleProvider locale={locale} navigatorLocale={navigatorLocale}>{children}</LocaleProvider>
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
