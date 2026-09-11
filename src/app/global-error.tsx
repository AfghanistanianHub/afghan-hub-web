"use client";

import { PageRecovery, type RecoveryProps } from "@/components/feedback/page-recovery";
import "./globals.css";

export default function GlobalError({ reset }: RecoveryProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <PageRecovery reset={reset} />
      </body>
    </html>
  );
}
