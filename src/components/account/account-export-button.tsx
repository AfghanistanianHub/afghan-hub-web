"use client";

import { useState } from "react";

export function AccountExportButton() {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  async function download() {
    if (pending) return;
    setPending(true);
    setMessage("");
    setFailed(false);
    try {
      const response = await fetch("/api/account/export", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("Download unavailable");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "afghan-hub-account-profile.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("Your account and profile download is ready.");
    } catch {
      setFailed(true);
      setMessage("We could not download your data. Sign in again or try later.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={download} disabled={pending} aria-busy={pending}
        className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60 sm:w-auto">
        {pending ? "Preparing download…" : "Download account and profile"}
      </button>
      {message ? (
        <p
          role={failed ? "alert" : "status"}
          aria-live={failed ? "assertive" : "polite"}
          className={
            failed
              ? "mt-3 break-words rounded-xl border border-destructive/20 bg-destructive/[0.05] px-3 py-2 text-sm leading-6 text-destructive"
              : "mt-3 break-words rounded-xl border border-primary/15 bg-primary/[0.05] px-3 py-2 text-sm leading-6 text-primary"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
