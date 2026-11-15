"use client";

import {
  PageRecovery,
  RecoveryDocumentTitle,
  type RecoveryProps,
} from "@/components/feedback/page-recovery";
import "./globals.css";

// This boundary replaces the root layout, so the layout's language bootstrap
// does not run here. It also cannot carry a CSP nonce: a Client Component has no
// access to headers(), and the nonce-based policy in src/proxy.ts refuses an
// inline script element without one. The language is therefore applied by
// <DocumentLanguage /> (a client effect) rendered inside PageRecovery, which is
// the same mechanism the 404 shell uses. Anything before hydration stays
// English/LTR; the recovery copy itself is localized per element on render.

export default function GlobalError({ reset }: RecoveryProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <RecoveryDocumentTitle />
        <meta name="robots" content="noindex" />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <PageRecovery reset={reset} />
      </body>
    </html>
  );
}
