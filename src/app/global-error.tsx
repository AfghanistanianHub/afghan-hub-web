"use client";

import {
  PageRecovery,
  RecoveryDocumentTitle,
  type RecoveryProps,
} from "@/components/feedback/page-recovery";
import "./globals.css";

// This boundary replaces the root layout, so the layout's language bootstrap
// does not run here. Restore the stored preference before first paint so the
// recovery screen is readable in Farsi and Pashto instead of English-only.
const recoveryLanguageBootstrap = `(function(){try{var c=document.cookie.match(/(?:^|;\\s*)afghan-hub-auth-language=(en|fa|ps)(?:;|$)/);var s=c?c[1]:'';if(!s){try{s=localStorage.getItem('afghan-hub-site-language')||localStorage.getItem('afghan-hub-navigator-language')||'';}catch(e){}}var l=s==='fa'?'fa':(s==='ps'?'ps':'en');document.documentElement.lang=l;document.documentElement.dir=l==='en'?'ltr':'rtl';}catch(e){}})();`;

export default function GlobalError({ reset }: RecoveryProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <RecoveryDocumentTitle />
        <meta name="robots" content="noindex" />
        <script dangerouslySetInnerHTML={{ __html: recoveryLanguageBootstrap }} />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <PageRecovery reset={reset} />
      </body>
    </html>
  );
}
