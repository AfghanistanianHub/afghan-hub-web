"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { AuthBrand } from "@/components/auth/auth-brand";
import { SubmitButton } from "@/components/auth/submit-button";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import { requestPasswordReset } from "./actions";

const messages = {
  en: { eyebrow: "Password recovery", title: "Reset your password", description: "Enter your account email and we will send you a secure reset link.", email: "Email address", pending: "Sending reset link…", send: "Send reset link", back: "Back to sign in" },
  fa: { eyebrow: "بازیابی رمز عبور", title: "بازنشانی رمز عبور", description: "نشانی ایمیل حساب خود را وارد کنید تا لینک امن بازنشانی رمز عبور برای شما ارسال شود.", email: "نشانی ایمیل", pending: "در حال ارسال لینک بازیابی…", send: "ارسال لینک بازیابی", back: "بازگشت به صفحه ورود" },
  ps: { eyebrow: "د پټنوم بېرته ترلاسه کول", title: "خپل پټنوم بدل کړئ", description: "د خپل حساب برېښنالیک پته ولیکئ څو د پټنوم بدلولو خوندي لینک درولېږو.", email: "برېښنالیک پته", pending: "د بېرته ترلاسه کولو لینک لېږل کېږي…", send: "د بېرته ترلاسه کولو لینک ولېږئ", back: "د ننوتلو پاڼې ته ستنېدل" },
} as const satisfies Record<SiteLanguage, Record<string, string>>;

const recoveryFeedback = {
  "Enter your email address.": {
    fa: "نشانی ایمیل خود را وارد کنید.",
    ps: "خپله برېښنالیک پته ولیکئ.",
  },
  "We could not send the password reset email right now. Please try again shortly.": {
    fa: "در حال حاضر ارسال ایمیل بازیابی ممکن نیست. لطفاً کمی بعد دوباره تلاش کنید.",
    ps: "اوس مهال د پټنوم بېرته ترلاسه کولو برېښنالیک نه شي لېږل کېدای. مهرباني وکړئ لږ وروسته بیا هڅه وکړئ.",
  },
  "If an account exists for that email, a password reset link has been sent.": {
    fa: "اگر حسابی با این نشانی ایمیل وجود داشته باشد، لینک بازنشانی رمز عبور ارسال شده است.",
    ps: "که د دې برېښنالیک پتې لپاره حساب موجود وي، د پټنوم بدلولو لینک لېږل شوی دی.",
  },
} as const;

function localizeFeedback(value: string, language: SiteLanguage): string {
  if (language === "en") return value;
  return recoveryFeedback[value as keyof typeof recoveryFeedback]?.[language] ?? value;
}

export function LocalizedForgotPasswordContent({ error, message }: { error?: string; message?: string }) {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const copy = messages[language];
  return (
    <main id="main-content" lang={language} dir={language === "en" ? "ltr" : "rtl"} className="auth-page min-h-screen text-foreground">
      <AuthBrand />
      <section className="auth-form-region">
        <div className="relative w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{copy.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">{copy.title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.description}</p>
          {error && <div role="alert" aria-live="assertive" className="mt-6 rounded-[var(--radius)] border border-destructive/20 bg-destructive/[0.08] p-3 text-sm text-destructive">{localizeFeedback(error, language)}</div>}
          {message && <div role="status" aria-live="polite" className="mt-6 rounded-[var(--radius)] border border-primary/15 bg-primary/[0.06] p-3 text-sm text-primary">{localizeFeedback(message, language)}</div>}
          <form action={requestPasswordReset} className="mt-7 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">{copy.email}</label>
              <input id="email" name="email" type="email" required autoComplete="email" dir="ltr" placeholder="you@example.com" className="w-full rounded-[var(--radius-control)] border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <SubmitButton pendingLabel={copy.pending}>{copy.send}</SubmitButton>
          </form>
          <div className="mt-6 border-t border-border pt-5 text-center">
            <Link href="/login" className="rounded-sm text-sm font-medium text-primary transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{copy.back}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
