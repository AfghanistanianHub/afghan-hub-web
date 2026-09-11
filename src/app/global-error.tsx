"use client";

import { PageRecovery, type RecoveryProps } from "@/components/feedback/page-recovery";
import "./globals.css";

export default function GlobalError(props: RecoveryProps) {
  return (
    <html lang="en">
      <head><title>Page unavailable | Afghan Hub</title><meta name="robots" content="noindex" /></head>
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }} className="min-h-screen bg-background text-foreground">
        <PageRecovery unstable_retry={props.unstable_retry} />
      </body>
    </html>
  );
}
