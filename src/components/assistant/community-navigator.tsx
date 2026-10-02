"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { trackAssistantEvent } from "@/lib/assistant/analytics";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Search,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

type AssistantResult = {
  entityType: "profile" | "business" | "organization" | "opportunity" | "event";
  entityId: string;
  title: string;
  subtitle: string | null;
  city: string | null;
  country: string | null;
  href: string;
  rank: number;
};

type AssistantResponse = {
  query: string;
  intent: string;
  entityType: AssistantResult["entityType"] | null;
  results: AssistantResult[];
  mode: "read-only";
  error?: string;
};

type Language = "en" | "fa" | "ps";

const copy = {
  en: {
    ask: "Ask Afghan Hub",
    title: "What are you looking for?",
    description:
      "Find people, organizations, businesses, opportunities and upcoming events across Afghan Hub.",
    placeholder: "Try “volunteer opportunities in Vancouver”…",
    search: "Search",
    searching: "Searching…",
    empty: "No matching Afghan Hub results yet. Try a broader phrase.",
    error: "Search is temporarily unavailable. Please try again.",
    readOnly: "Discovery only · no actions will be taken",
  },
  fa: {
    ask: "از افغان هاب بپرس",
    title: "دنبال چه چیزی هستید؟",
    description:
      "افراد، سازمان‌ها، کسب‌وکارها، فرصت‌ها و رویدادهای آینده را در افغان هاب پیدا کنید.",
    placeholder: "مثلاً «فرصت‌های داوطلبی در ونکوور»…",
    search: "جست‌وجو",
    searching: "در حال جست‌وجو…",
    empty: "نتیجه مرتبطی پیدا نشد. عبارت عمومی‌تری را امتحان کنید.",
    error: "جست‌وجو فعلاً در دسترس نیست. دوباره تلاش کنید.",
    readOnly: "فقط برای پیدا کردن اطلاعات · هیچ اقدامی انجام نمی‌شود",
  },
  ps: {
    ask: "له افغان هب څخه وپوښتئ",
    title: "تاسو څه لټوئ؟",
    description:
      "په افغان هب کې خلک، سازمانونه، کاروبارونه، فرصتونه او راتلونکې غونډې ومومئ.",
    placeholder: "لکه «په ونکوور کې د رضاکارۍ فرصتونه»…",
    search: "لټون",
    searching: "لټون روان دی…",
    empty: "اړوند پایله ونه موندل شوه. یوه پراخه جمله وازمویئ.",
    error: "لټون اوس مهال شتون نه لري. بیا هڅه وکړئ.",
    readOnly: "یوازې موندنه · هېڅ اقدام نه ترسره کېږي",
  },
} as const;

const prompts = {
  en: [
    "Find volunteer opportunities",
    "Show me upcoming community events",
    "Find organizations that support employment",
    "Find professionals working in technology",
  ],
  fa: [
    "فرصت‌های داوطلبی را پیدا کن",
    "رویدادهای آینده جامعه را نشان بده",
    "سازمان‌های مرتبط با کاریابی را پیدا کن",
    "متخصصان حوزه تکنولوژی را پیدا کن",
  ],
  ps: [
    "د رضاکارۍ فرصتونه پیدا کړه",
    "راتلونکې ټولنیزې غونډې را وښیه",
    "د کار موندنې اړوند سازمانونه پیدا کړه",
    "د ټکنالوژۍ مسلکي کسان پیدا کړه",
  ],
} as const;

function ResultIcon({ type }: { type: AssistantResult["entityType"] }) {
  const Icon =
    type === "profile"
      ? UserRound
      : type === "organization"
        ? UsersRound
        : type === "business"
          ? Building2
          : type === "opportunity"
            ? BriefcaseBusiness
            : CalendarDays;

  return <Icon aria-hidden="true" className="size-4" />;
}

function typeLabel(type: AssistantResult["entityType"]) {
  switch (type) {
    case "profile":
      return "Member";
    case "organization":
      return "Organization";
    case "business":
      return "Business";
    case "opportunity":
      return "Opportunity";
    case "event":
      return "Event";
  }
}

export function CommunityNavigator() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AssistantResult[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const strings = copy[language];
  const rtl = language === "fa" || language === "ps";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      trackAssistantEvent({ event: "assistant_open", language });
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const locationSummary = useMemo(
    () => (result: AssistantResult) =>
      [result.city, result.country].filter(Boolean).join(", "),
    [],
  );

  async function runSearch(searchQuery: string) {
    const normalized = searchQuery.trim();
    if (normalized.length < 2 || pending) return;

    setPending(true);
    setFailed(false);
    setSubmitted(true);

    try {
      const response = await fetch("/api/assistant/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: normalized, limit: 8 }),
      });

      const data = (await response.json()) as AssistantResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Assistant search failed");
      }

      const nextResults = data.results ?? [];
      setResults(nextResults);
      trackAssistantEvent({
        event: "assistant_search",
        language,
        intent: data.intent,
        entityType: data.entityType,
        resultCount: nextResults.length,
        hadResults: nextResults.length > 0,
      });
    } catch {
      setResults([]);
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch(query);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed bottom-5 right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-primary/20 bg-card px-4 py-3 text-sm font-semibold text-foreground shadow-[0_12px_34px_rgb(15_23_42/0.14)] transition hover:-translate-y-0.5 hover:border-primary/35 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:bottom-6 md:right-6"
      >
        <Sparkles aria-hidden="true" className="size-4 text-primary" />
        <span>{strings.ask}</span>
        <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="community-navigator-title"
            dir={rtl ? "rtl" : "ltr"}
            className="relative flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[1.75rem] border border-border bg-card shadow-[0_24px_80px_rgb(15_23_42/0.2)] sm:rounded-[1.75rem]"
          >
            <div className="border-b border-border px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                    <Sparkles aria-hidden="true" className="size-3.5" />
                    Afghan Hub Assistant
                  </div>
                  <h2
                    id="community-navigator-title"
                    className="mt-2 text-2xl font-medium tracking-[-0.025em] text-foreground"
                  >
                    {strings.title}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    {strings.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close Afghan Hub Assistant"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-primary/30 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <X aria-hidden="true" className="size-5" />
                </button>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {(["en", "fa", "ps"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setLanguage(option);
                      trackAssistantEvent({
                        event: "assistant_language_change",
                        language: option,
                      });
                    }}
                    aria-pressed={language === option}
                    className={`min-h-9 rounded-full border px-3 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      language === option
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
                    }`}
                  >
                    {option === "en" ? "English" : option === "fa" ? "دری" : "پښتو"}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto px-5 py-5 sm:px-6">
              {!submitted ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {prompts[language].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        setQuery(prompt);
                        void runSearch(prompt);
                      }}
                      className="rounded-2xl border border-border bg-background/55 p-4 text-start text-sm font-medium leading-6 text-foreground transition hover:border-primary/25 hover:bg-primary/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              ) : null}

              {submitted ? (
                <div aria-live="polite" className="space-y-3">
                  {pending ? (
                    <div className="rounded-2xl border border-border bg-muted/35 p-4 text-sm text-muted-foreground">
                      {strings.searching}
                    </div>
                  ) : failed ? (
                    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                      {strings.error}
                    </div>
                  ) : results.length ? (
                    results.map((result) => {
                      const location = locationSummary(result);
                      return (
                        <Link
                          key={`${result.entityType}:${result.entityId}`}
                          href={result.href}
                          onClick={() => {
                            trackAssistantEvent({
                              event: "assistant_result_click",
                              language,
                              entityType: result.entityType,
                            });
                            setOpen(false);
                          }}
                          className="group flex items-start gap-3 rounded-2xl border border-border bg-background/55 p-4 transition hover:border-primary/30 hover:bg-primary/[0.035] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <ResultIcon type={result.entityType} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                              {typeLabel(result.entityType)}
                            </span>
                            <span className="mt-1 block break-words text-sm font-semibold text-foreground">
                              {result.title}
                            </span>
                            {result.subtitle ? (
                              <span className="mt-1 line-clamp-2 block text-sm leading-5 text-muted-foreground">
                                {result.subtitle}
                              </span>
                            ) : null}
                            {location ? (
                              <span className="mt-1 block text-xs text-muted-foreground">
                                {location}
                              </span>
                            ) : null}
                          </span>
                          <ArrowUpRight
                            aria-hidden="true"
                            className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                          />
                        </Link>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground">
                      {strings.empty}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <form onSubmit={submit} className="border-t border-border bg-card px-5 py-4 sm:px-6">
              <div className="flex gap-2">
                <label className="relative min-w-0 flex-1">
                  <span className="sr-only">{strings.ask}</span>
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-4"
                  />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    type="search"
                    maxLength={120}
                    placeholder={strings.placeholder}
                    className="min-h-12 w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-4 focus:ring-primary/10 rtl:pl-4 rtl:pr-11"
                  />
                </label>
                <button
                  type="submit"
                  disabled={query.trim().length < 2 || pending}
                  className="min-h-12 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {pending ? strings.searching : strings.search}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{strings.readOnly}</p>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
