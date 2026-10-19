"use client";

import { useSyncExternalStore } from "react";
import { AuthBrand } from "@/components/auth/auth-brand";
import { SubmitButton } from "@/components/auth/submit-button";
import { PASSWORD_MIN_LENGTH, PASSWORD_POLICY_HINT } from "@/lib/password-policy";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import { updatePassword } from "./actions";

const copy = {
  en: { eyebrow: "Secure your account", title: "Choose a new password", description: "Enter the same password twice.", password: "New password", confirmation: "Confirm new password", repeat: "Enter the new password again", min: "Minimum", characters: "characters", pending: "Updating password…", submit: "Update password" },
  fa: { eyebrow: "امنیت حساب کاربری", title: "انتخاب رمز عبور جدید", description: "رمز عبور جدید را در هر دو فیلد یکسان وارد کنید.", password: "رمز عبور جدید", confirmation: "تأیید رمز عبور جدید", repeat: "رمز عبور جدید را دوباره وارد کنید", min: "حداقل", characters: "نویسه", pending: "در حال تغییر رمز عبور…", submit: "تغییر رمز عبور" },
  ps: { eyebrow: "خپل حساب خوندي کړئ", title: "نوی پټنوم وټاکئ", description: "نوی پټنوم په دواړو ځایونو کې یو شان ولیکئ.", password: "نوی پټنوم", confirmation: "نوی پټنوم تایید کړئ", repeat: "نوی پټنوم بیا ولیکئ", min: "لږ تر لږه", characters: "توري", pending: "پټنوم بدلېږي…", submit: "پټنوم بدل کړئ" },
} as const satisfies Record<SiteLanguage, Record<string, string>>;

function policyHint(language: SiteLanguage): string {
  if (language === "en") return PASSWORD_POLICY_HINT;
  if (language === "fa") return `رمز عبور باید دست‌کم ${PASSWORD_MIN_LENGTH} نویسه داشته باشد و شامل دست‌کم سه مورد از این چهار گروه باشد: حروف کوچک انگلیسی، حروف بزرگ انگلیسی، اعداد و نمادها.`;
  return `پټنوم باید لږ تر لږه ${PASSWORD_MIN_LENGTH} توري ولري او له دغو څلورو ډلو لږ تر لږه درې ولري: د انګلیسي کوچني توري، لوی توري، شمېرې او نښې.`;
}

const errors: Record<string, Partial<Record<SiteLanguage, string>>> = {
  "Open a valid password reset link before choosing a new password.": {
    fa: "پیش از انتخاب رمز عبور جدید، یک لینک معتبر بازیابی رمز عبور را باز کنید.",
    ps: "د نوي پټنوم تر ټاکلو مخکې د پټنوم بېرته ترلاسه کولو معتبر لینک پرانیزئ.",
  },
};

export function LocalizedUpdatePasswordContent({ error }: { error?: string }) {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const t = copy[language];
  const fieldClassName = "w-full rounded-[var(--radius-control)] border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";
  return (
    <main id="main-content" lang={language} dir={language === "en" ? "ltr" : "rtl"} className="auth-page min-h-screen text-foreground">
      <AuthBrand />
      <section className="auth-form-region">
        <div className="relative w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">{t.title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{t.description}</p>
          {error ? <div role="alert" aria-live="assertive" className="mt-6 rounded-[var(--radius)] border border-destructive/20 bg-destructive/[0.08] p-3 text-sm text-destructive">{errors[error]?.[language] ?? error}</div> : null}
          <form action={updatePassword} className="mt-7 space-y-5">
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">{t.password}</label>
              <input id="password" name="password" type="password" dir="ltr" required minLength={PASSWORD_MIN_LENGTH} autoComplete="new-password" placeholder={`${t.min} ${PASSWORD_MIN_LENGTH} ${t.characters}`} aria-describedby="password-policy" className={fieldClassName} />
              <p id="password-policy" className="mt-2 text-xs leading-5 text-muted-foreground">{policyHint(language)}</p>
            </div>
            <div>
              <label htmlFor="passwordConfirmation" className="mb-2 block text-sm font-medium">{t.confirmation}</label>
              <input id="passwordConfirmation" name="passwordConfirmation" type="password" dir="ltr" required minLength={PASSWORD_MIN_LENGTH} autoComplete="new-password" placeholder={t.repeat} className={fieldClassName} />
            </div>
            <SubmitButton pendingLabel={t.pending}>{t.submit}</SubmitButton>
          </form>
        </div>
      </section>
    </main>
  );
}
