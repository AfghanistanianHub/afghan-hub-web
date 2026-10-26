"use client";

import { useSyncExternalStore } from "react";
import { useFormStatus } from "react-dom";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";
import { AuthBrand } from "@/components/auth/auth-brand";
import { SupportLinks } from "@/components/public/support-links";
import { SubmitButton } from "@/components/auth/submit-button";
import Link from "next/link";
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_HINT,
} from "@/lib/password-policy";
import { login, signInWithGoogle, signup } from "./actions";

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
    "newAccount": "Create an account",
    "google": "Continue with Google",
    "googleConnecting": "Connecting to Google…",
    "or": "or"
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
    "newAccount": "ایجاد حساب کاربری",
    "google": "ادامه با گوگل",
    "googleConnecting": "در حال اتصال به گوگل…",
    "or": "یا"
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
    "newAccount": "نوی حساب جوړ کړئ",
    "google": "د Google سره دوام ورکړئ",
    "googleConnecting": "د Google سره نښلول کیږي…",
    "or": "یا"
  }
} as const satisfies Record<SiteLanguage, Record<string,string>>;

const authFeedback = {
  "Password must include at least 3 of: lowercase letters, uppercase letters, numbers, symbols.": {
    fa: "رمز عبور باید شامل دست‌کم سه مورد از چهار گروه باشد: حروف کوچک انگلیسی، حروف بزرگ انگلیسی، اعداد و نمادها.",
    ps: "پټنوم باید له څلورو ډلو لږ تر لږه درې ولري: کوچني انګلیسي توري، لوی توري، شمېرې او نښې.",
  },
  "We could not sign you in. Check your email and password and try again.": {
    fa: "ورود به حساب انجام نشد. نشانی ایمیل و رمز عبور را بررسی و دوباره تلاش کنید.",
    ps: "حساب ته ننوتل بریالي نه شول. خپل برېښنالیک او پټنوم وګورئ او بیا هڅه وکړئ.",
  },
  "We could not create your account right now. Please try again shortly.": {
    fa: "در حال حاضر ایجاد حساب امکان‌پذیر نیست. لطفاً کمی بعد دوباره تلاش کنید.",
    ps: "اوس مهال حساب نه شي جوړېدای. مهرباني وکړئ لږ وروسته بیا هڅه وکړئ.",
  },
  "Your password reset session has expired. Request a new link.": { fa: "نشست بازیابی رمز عبور منقضی شده است. لینک جدیدی درخواست کنید.", ps: "ستاسو د پټنوم بېرته ترلاسه کولو ناسته پای ته رسېدلې ده. نوی لینک وغواړئ." },
  "Open a valid password reset link before choosing a new password.": { fa: "پیش از انتخاب رمز عبور جدید، لینک معتبر بازیابی را باز کنید.", ps: "د نوي پټنوم تر ټاکلو مخکې د بېرته ترلاسه کولو معتبر لینک پرانیزئ." },
  "Password updated successfully. Sign in with your new password.": { fa: "رمز عبور با موفقیت تغییر کرد. با رمز عبور جدید وارد شوید.", ps: "پټنوم په بریالیتوب بدل شو. په خپل نوي پټنوم ننوځئ." },
  "The confirmation link is invalid or has expired. Please sign in if your account is already confirmed, or create the account again.": {
    fa: "لینک تأیید نامعتبر یا منقضی شده است. اگر حساب شما قبلاً تأیید شده، وارد شوید؛ در غیر این صورت حساب را دوباره ایجاد کنید.",
    ps: "د تایید لینک ناسم یا پای ته رسېدلی دی. که ستاسو حساب مخکې تایید شوی وي، ننوځئ؛ که نه، حساب بیا جوړ کړئ.",
  },
  "Google sign-in could not be completed. Please try again or use your email and password.": {
    fa: "ورود با گوگل انجام نشد. دوباره تلاش کنید یا با ایمیل و رمز عبور وارد شوید.",
    ps: "د Google سره ننوتل بشپړ نه شو. بیا هڅه وکړئ یا د برېښنالیک او پټنوم سره ننوځئ.",
  },
  "Account created. Check your email if confirmation is required.": {
    fa: "حساب ایجاد شد. اگر تأیید ایمیل لازم باشد، صندوق ورودی خود را بررسی کنید.",
    ps: "حساب جوړ شو. که د برېښنالیک تایید اړین وي، خپل برېښنالیک وګورئ.",
  },
} as const;

function GoogleSignInButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="flex w-full items-center justify-center gap-3 rounded-[var(--radius-control)] border border-input bg-background px-4 py-3 font-semibold text-foreground transition hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
        <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
      </svg>
      <span role="status" aria-live="polite">{pending ? pendingLabel : label}</span>
    </button>
  );
}

function feedbackText(value: string, language: SiteLanguage): string {
  if (language === "en") return value;
  const localized = authFeedback[value as keyof typeof authFeedback];
  if (localized) return localized[language];
  if (value === `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`) {
    return language === "fa" ? `رمز عبور باید دست‌کم ${PASSWORD_MIN_LENGTH} نویسه داشته باشد.` : `پټنوم باید لږ تر لږه ${PASSWORD_MIN_LENGTH} توري ولري.`;
  }
  return value;
}

const legalNavigation = {
  en: { privacy: "Privacy", terms: "Terms", support: "Support", navigation: "Privacy, terms and support" },
  fa: { privacy: "حریم خصوصی", terms: "شرایط استفاده", support: "پشتیبانی", navigation: "حریم خصوصی، شرایط استفاده و پشتیبانی" },
  ps: { privacy: "محرمیت", terms: "د کارولو شرطونه", support: "ملاتړ", navigation: "محرمیت، شرطونه او ملاتړ" },
} as const satisfies Record<SiteLanguage, {privacy: string; terms: string; support: string; navigation: string}>;

export function LocalizedLoginContent({ error, message, mode }: { error?: string; message?: string; mode?: string; next?: string }) {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const t = labels[language];
  const joining = mode === "join";

  const fieldClassName =
    "w-full rounded-[var(--radius-control)] border border-input bg-background px-4 py-3 text-foreground transition placeholder:text-muted-foreground focus:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

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
              {feedbackText(error, language)}
            </div>
          ) : null}

          {message ? (
            <div role="status" aria-live="polite" className="mt-6 rounded-[var(--radius)] border border-primary/15 bg-primary/[0.06] p-3 text-sm text-primary">
              {feedbackText(message, language)}
            </div>
          ) : null}

          <form action={signInWithGoogle} className="mt-7">
            <input type="hidden" name="flow" value={joining ? "join" : "login"} />
            <GoogleSignInButton label={t.google} pendingLabel={t.googleConnecting} />
          </form>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span>{t.or}</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form id="join" action={joining ? signup : login} className="space-y-5">
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
                dir="ltr"
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
                dir="ltr"
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
                  {language === "en" ? PASSWORD_POLICY_HINT : language === "fa" ? `رمز عبور باید دست‌کم ${PASSWORD_MIN_LENGTH} نویسه داشته باشد و شامل دست‌کم سه مورد از این چهار گروه باشد: حروف کوچک انگلیسی، حروف بزرگ انگلیسی، اعداد و نمادها.` : `پټنوم باید لږ تر لږه ${PASSWORD_MIN_LENGTH} توري ولري او له دې څلورو ډلو لږ تر لږه درې ولري: د انګلیسي کوچني توري، لوی توري، شمېرې او نښې.`}
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
            <SupportLinks labels={legalNavigation[language]} />
          </div>
        </div>
      </section>
    </main>
  );
}
