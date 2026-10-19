"use client";

import { useSyncExternalStore } from "react";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import { AuthBrand } from "@/components/auth/auth-brand";
import { SupportLinks } from "@/components/public/support-links";
import { SubmitButton } from "@/components/auth/submit-button";
import Link from "next/link";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_HINT,
} from "@/lib/password-policy";
import { login, signup } from "./actions";

const labels = {
  "en": {
    "join": "Join the community",
    "access": "Member access",
    "joinTitle": "Create your Afghan Hub account",
    "welcome": "Welcome back",
    "joinDescription": "Create your profile and discover people, events, opportunities and Afghan-led organizations.",
    "loginDescription": "Sign in to continue where you left off.",
    "email": "Email address",
    "password": "Password",
    "forgot": "Forgot password?",
    "passwordPlaceholder": "Your password",
    "min": "Minimum",
    "chars": "characters",
    "creating": "Creating account…",
    "signing": "Signing in…",
    "create": "Create account",
    "signin": "Sign in",
    "already": "Already a member? ",
    "new": "New to Afghan Hub? ",
    "newAccount": "Create an account"
  },
  "fa": {
    "join": "پیوستن به جامعه",
    "access": "ورود اعضا",
    "joinTitle": "حساب کاربری افغان هاب خود را بسازید",
    "welcome": "خوش آمدید",
    "joinDescription": "پروفایل خود را ایجاد کنید و با افراد، رویدادها، فرصت‌ها و سازمان‌های جامعه افغانستان آشنا شوید.",
    "loginDescription": "برای ادامه فعالیت خود وارد حساب شوید.",
    "email": "نشانی ایمیل",
    "password": "رمز عبور",
    "forgot": "رمز عبور را فراموش کرده‌اید؟",
    "passwordPlaceholder": "رمز عبور شما",
    "min": "حداقل",
    "chars": "نویسه",
    "creating": "در حال ایجاد حساب…",
    "signing": "در حال ورود…",
    "create": "ایجاد حساب",
    "signin": "ورود",
    "already": "قبلاً عضو شده‌اید؟ ",
    "new": "تازه به افغان هاب آمده‌اید؟ ",
    "newAccount": "ایجاد حساب کاربری"
  },
  "ps": {
    "join": "له ټولنې سره یوځای شئ",
    "access": "د غړو ننوتل",
    "joinTitle": "خپل افغان هاب حساب جوړ کړئ",
    "welcome": "بېرته ښه راغلاست",
    "joinDescription": "خپل پروفایل جوړ کړئ او له خلکو، غونډو، فرصتونو او افغان سازمانونو سره آشنا شئ.",
    "loginDescription": "د خپل کار د دوام لپاره حساب ته ننوځئ.",
    "email": "برېښنالیک پته",
    "password": "پټنوم",
    "forgot": "پټنوم مو هېر شوی؟",
    "passwordPlaceholder": "ستاسو پټنوم",
    "min": "لږ تر لږه",
    "chars": "توري",
    "creating": "حساب جوړېږي…",
    "signing": "ننوتل روان دي…",
    "create": "حساب جوړ کړئ",
    "signin": "ننوځئ",
    "already": "له مخکې غړي یاست؟ ",
    "new": "افغان هاب ته نوي یاست؟ ",
    "newAccount": "نوی حساب جوړ کړئ"
  }
} as const satisfies Record<SiteLanguage, Record<string,string>>;

export function LocalizedLoginContent({ error, message, mode }: { error?: string; message?: string; mode?: string }) {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const t = labels[language];
  const joining = mode === "join";

  const fieldClassName =
    "w-full rounded-[var(--radius-control)] border border-input bg-background px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10";

  return (
    <main id="main-content" lang={language} dir={language === "en" ? "ltr" : "rtl"} className="auth-page min-h-screen text-foreground">
      <AuthBrand />
      <section className="auth-form-region">
        <div className="relative w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {joining ? t.join : t.access}
          </p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">
            {joining ? t.joinTitle : t.welcome}
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {joining
              ? t.joinDescription
              : t.loginDescription}
          </p>

          {error ? (
            <div role="alert" aria-live="assertive" className="mt-6 rounded-[var(--radius)] border border-destructive/20 bg-destructive/[0.08] p-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {message ? (
            <div role="status" aria-live="polite" className="mt-6 rounded-[var(--radius)] border border-primary/15 bg-primary/[0.06] p-3 text-sm text-primary">
              {message}
            </div>
          ) : null}

          <form id="join" action={joining ? signup : login} className="mt-7 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                {t.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={fieldClassName}
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label htmlFor="password" className="block text-sm font-medium">
                  {t.password}
                </label>
                <Link
                  href="/forgot-password"
                  className="rounded-sm text-sm font-medium text-primary transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  {t.forgot}
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={joining ? PASSWORD_MIN_LENGTH : undefined}
                autoComplete={joining ? "new-password" : "current-password"}
                placeholder={joining ? `${t.min} ${PASSWORD_MIN_LENGTH} ${t.chars}` : t.passwordPlaceholder}
                aria-describedby={joining ? "password-policy" : undefined}
                className={fieldClassName}
              />
              {joining ? (
                <p id="password-policy" className="mt-2 text-xs leading-5 text-muted-foreground">
                  {language === "en" ? PASSWORD_POLICY_HINT : language === "fa" ? "رمز عبور باید دست‌کم ۸ نویسه داشته باشد." : "پټنوم باید لږ تر لږه ۸ توري ولري."}
                </p>
              ) : null}
            </div>

            <SubmitButton pendingLabel={joining ? t.creating : t.signing}>
              {joining ? t.create : t.signin}
            </SubmitButton>

            <p className="text-center text-sm text-muted-foreground">
              {joining ? t.already : t.new}
              <Link href={joining ? "/login" : "/login?mode=join"} className="rounded-sm font-semibold text-primary underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                {joining ? t.signin : t.newAccount}
              </Link>
            </p>
          </form>

          <div className="mt-7 border-t border-border pt-5">
            <SupportLinks />
          </div>
        </div>
      </section>
    </main>
  );
}
