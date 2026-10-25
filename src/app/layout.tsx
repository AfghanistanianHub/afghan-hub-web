import type { Metadata } from "next";
import { Estedad, Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { GlobalNetworkBackground } from "@/components/visual/global-network-background";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const estedad = Estedad({ variable: "--font-estedad", subsets: ["arabic"], display: "swap" });
const vazirmatn = Vazirmatn({ variable: "--font-vazirmatn", subsets: ["arabic"], display: "swap" });

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

// Runs before first paint so /fa and /ps (and a stored Farsi/Pashto choice) never flash English.
// Mirrors normalizeSiteLanguage/readSiteLanguagePreference in src/lib/i18n/site-language.ts.
// Honor callback language cookies even when localStorage is empty or blocked.
const languageBootstrap = `(function(){try{var m=location.pathname.match(/^\\/(en|fa|ps)\\/?$/);var l=m&&m[1];if(!l){var c=document.cookie.match(/(?:^|;\\s*)afghan-hub-auth-language=(en|fa|ps)(?:;|$)/);var q=new URLSearchParams(location.search).get('lang');var s=q==='en'||q==='fa'||q==='ps'?q:(c?c[1]:(function(){try{return localStorage.getItem('afghan-hub-site-language')||localStorage.getItem('afghan-hub-navigator-language')||'';}catch(e){return '';}})());s=s.trim().replace(/_/g,'-').toLowerCase();l=(s==='fa'||s.indexOf('fa-')===0||s==='prs'||s.indexOf('prs-')===0)?'fa':(s==='ps'||s.indexOf('ps-')===0)?'ps':'en';}document.documentElement.lang=l;document.documentElement.dir=l==='en'?'ltr':'rtl';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${estedad.variable} ${vazirmatn.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: languageBootstrap }} />
      </head>
      <body className="min-h-full flex flex-col">
        <GlobalNetworkBackground />
        <div className="app-content flex min-h-full flex-1 flex-col">
          {children}
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}
