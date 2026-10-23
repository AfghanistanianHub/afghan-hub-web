"use client";

import { useSyncExternalStore } from "react";
import { SupportLinks } from "@/components/public/support-links";
import { siteContact } from "@/lib/site-contact";
import { readSiteLanguagePreference, subscribeSiteLanguagePreference, type SiteLanguage } from "@/lib/i18n/site-language";

export type InformationSection = { readonly title: string; readonly text: string };

export type LocalizedInfoSectionGroup = {
  readonly title: string;
  readonly description: string;
  readonly sections: readonly InformationSection[];
};

const defaultUiLabels = {
  en: {
    badge: "Afghan Hub",
    contactHeading: "Contact",
    operatorLabel: "Responsible operator",
    supportLabel: "Support and privacy questions",
    disclaimer: "Do not send passwords, sign-in links, session tokens or sensitive identity documents by email.",
    navigation: { privacy: "Privacy", terms: "Terms", support: "Support", navigation: "Privacy, terms and support" },
  },
  fa: {
    badge: "افغان هاب",
    contactHeading: "تماس",
    operatorLabel: "مسئول اجرایی",
    supportLabel: "پرسش‌های پشتیبانی و حریم خصوصی",
    disclaimer: "از ارسال گذرواژه، لینک‌های ورود، توکن‌های نشست یا مدارک هویتی حساس از طریق ایمیل خودداری کنید.",
    navigation: { privacy: "حریم خصوصی", terms: "شرایط استفاده", support: "پشتیبانی", navigation: "حریم خصوصی، شرایط استفاده و پشتیبانی" },
  },
  ps: {
    badge: "افغان هب",
    contactHeading: "اړیکه",
    operatorLabel: "مسؤل چلونکی",
    supportLabel: "د ملاتړ او محرمیت پوښتنې",
    disclaimer: "د برېښنالیک له لارې پټ نومونه، د ننوتلو لېنکونه، یا حساس اسناد مه استوئ.",
    navigation: { privacy: "محرمیت", terms: "د کارونې شرطونه", support: "ملاتړ", navigation: "محرمیت، شرطونه او ملاتړ" },
  },
} as const;

export function InformationPage({
  title,
  description,
  sections,
  labels,
  copyByLocale,
}: {
  title?: string;
  description?: string;
  sections?: readonly InformationSection[];
  labels?: {
    contact: string;
    operator: string;
    support: string;
    warning: string;
    navigation: { privacy: string; terms: string; support: string; navigation: string };
  };
  copyByLocale?: Record<SiteLanguage, LocalizedInfoSectionGroup>;
}) {
  const language = useSyncExternalStore(subscribeSiteLanguagePreference, readSiteLanguagePreference, (): SiteLanguage => "en");
  const fallbackLabels = defaultUiLabels[language];

  const currentTitle = copyByLocale ? copyByLocale[language].title : (title || "");
  const currentDescription = copyByLocale ? copyByLocale[language].description : (description || "");
  const currentSections = copyByLocale ? copyByLocale[language].sections : (sections || []);

  const contactHeading = labels?.contact ?? fallbackLabels.contactHeading;
  const operatorLabel = labels?.operator ?? fallbackLabels.operatorLabel;
  const supportLabel = labels?.support ?? fallbackLabels.supportLabel;
  const disclaimerText = labels?.warning ?? fallbackLabels.disclaimer;

  return (
    <main id="main-content" lang={language} dir={language === "en" ? "ltr" : "rtl"} className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
      <section className="relative overflow-hidden rounded-sm border border-border/80 bg-card px-6 py-8 sm:px-8 sm:py-10">
        <div className="relative max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{fallbackLabels.badge}</p>
          <h1 className="mt-4 break-words text-3xl font-medium tracking-tight sm:text-4xl">{currentTitle}</h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">{currentDescription}</p>
        </div>
      </section>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          {currentSections.map((section) => (
            <section key={section.title} className="rounded-sm border border-border/80 bg-card p-6 sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{section.text}</p>
            </section>
          ))}
        </div>
        <aside className="rounded-sm border border-border/80 bg-muted/35 p-6 lg:sticky lg:top-24">
          <h2 className="text-xl font-semibold">{contactHeading}</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div><dt className="text-muted-foreground">{operatorLabel}</dt><dd className="mt-1 font-medium">{siteContact.operator}</dd></div>
            <div><dt className="text-muted-foreground">{supportLabel}</dt><dd className="mt-1"><a href={siteContact.mailto} className="break-all rounded-sm font-medium text-primary underline underline-offset-4 transition hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{siteContact.email}</a></dd></div>
          </dl>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">{disclaimerText}</p>
          <div className="mt-6 border-t border-border pt-5">
            <SupportLinks labels={labels?.navigation ?? fallbackLabels.navigation} />
          </div>
        </aside>
      </div>
    </main>
  );
}
