"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, ArrowUp, Compass, Search, Sparkles, X } from "lucide-react";
import { navigatorCopy, guidedGoals, guidedTopics, type NavigatorLanguage } from "@/lib/assistant/navigator-copy";
import type { DiscoveryFilters } from "@/lib/assistant/public-discovery";
import { resolveNavigatorContext } from "@/lib/assistant/conversation";
import { NAVIGATOR_JOURNEY_EVENT } from "./navigator-journey-link";
import { publicDiscoveryResponseSchema, type PublicDiscoveryResponse } from "@/lib/assistant/public-discovery-contract";
import styles from "./homepage-navigator.module.css";

type Turn = { id: number; query: string; filters?: DiscoveryFilters; data?: PublicDiscoveryResponse; failed?: "busy" | "unavailable" };
type Guide = { step: 0 | 1 | 2; goal: string; topic: string; location: string };
const initialGuide: Guide = { step: 0, goal: "", topic: "", location: "" };
const locales = [{ value: "en", label: "English" }, { value: "fa-AF", label: "دری" }, { value: "fa", label: "فارسی" }, { value: "ps", label: "پښتو" }] as const;

export function HomepageNavigator() {
  const params = useSearchParams();
  const [language, setLanguage] = useState<NavigatorLanguage>("en");
  const t = navigatorCopy[language === "fa-AF" ? "fa" : language];
  const [query, setQuery] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const [guide, setGuide] = useState<Guide | null>(null);
  const [custom, setCustom] = useState("");
  const [notice, setNotice] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const busy = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const journeySeen = useRef<string | null>(null);
  const turnSequence = useRef(0);
  const latest = turns.at(-1);

  useEffect(() => () => { controller.current?.abort(); }, []);
  useEffect(() => {
    const start = (event: Event) => {
      const journey: unknown = (event as CustomEvent).detail;
      if (busy.current || typeof journey !== "string" || (!guidedGoals.includes(journey) && journey !== "Artists & Creatives")) return;
      setGuide({ ...initialGuide, goal: guidedGoals.includes(journey) ? journey : "I'm still exploring", topic: journey === "Artists & Creatives" ? "arts" : "", step: journey === "Artists & Creatives" ? 2 : 1 });
      setCustom("");
    };
    window.addEventListener(NAVIGATOR_JOURNEY_EVENT, start);
    return () => window.removeEventListener(NAVIGATOR_JOURNEY_EVENT, start);
  }, []);
  useEffect(() => {
    const journey = params.get("journey");
    if (!journey || journey === journeySeen.current) return;
    journeySeen.current = journey;
    const goal = guidedGoals.includes(journey) ? journey : "I'm still exploring";
    const topic = journey === "Artists & Creatives" ? "arts" : "";
    setGuide({ ...initialGuide, goal, topic, step: topic ? 2 : 1 });
    setCustom("");
  }, [params]);
  const guideStep = guide?.step;
  useEffect(() => { if (guideStep !== undefined) heading.current?.focus({ preventScroll: true }); }, [guideStep]);

  async function search(value: string, filters?: DiscoveryFilters) {
    const text = value.trim().slice(0, 120);
    if (busy.current || text.length < 2) return;
    let activeFilters = filters;
    if (!filters && latest?.data && /^(?:only|just|anywhere|all locations|فقط|تنها|یوازې|هر جا|هر ځای)\b|\b(?:too|also|as well)\b/iu.test(text)) {
      const previous = latest.data.plan;
      const entityType = previous.kinds.length === 1 ? ({ businesses: "business", organizations: "organization", opportunities: "opportunity", events: "event" } as const)[previous.kinds[0]] : undefined;
      const resolved = resolveNavigatorContext(text, { topic: previous.topic, city: previous.location || undefined, entityType });
      const goal = resolved.entityType ? ({ profile: "Meet people", business: "businesses", organization: "organizations", opportunity: "opportunities", event: "events" } as const)[resolved.entityType] : previous.kinds.join(" and ");
      activeFilters = { goal, topic: resolved.topic, location: resolved.city ?? "" };
    }
    busy.current = true; setPending(true); setNotice(t.searching); setGuide(null); setQuery("");
    const id = ++turnSequence.current;
    setTurns(previous => [...previous.slice(-7), { id, query: text, filters: activeFilters }]);
    const abort = new AbortController(); controller.current = abort;
    const timeout = window.setTimeout(() => abort.abort(), 12_000);
    try {
      const response = await fetch("/api/assistant/public-search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: text, filters: activeFilters }), signal: abort.signal });
      if (!response.ok) throw new Error(response.status === 429 ? "busy" : "unavailable");
      const data = publicDiscoveryResponseSchema.parse(await response.json());
      setTurns(previous => previous.map(turn => turn.id === id ? { ...turn, data } : turn));
      setNotice(data.unavailable.length ? t.partial : data.results.length ? `${t.results}: ${data.results.length}` : t.empty);
    } catch (error) {
      if (controller.current !== abort) return;
      const failed = error instanceof Error && error.message === "busy" ? "busy" : "unavailable";
      setTurns(previous => previous.map(turn => turn.id === id ? { ...turn, failed } : turn));
      setNotice(failed === "busy" ? t.rate : t.error);
    } finally {
      window.clearTimeout(timeout);
      if (controller.current === abort) { controller.current = null; busy.current = false; setPending(false); }
    }
  }
  function restart() {
    controller.current?.abort(); controller.current = null; busy.current = false;
    setPending(false); setTurns([]); setQuery(""); setNotice(""); setGuide(null); setCustom("");
    input.current?.focus();
  }
  function startGuide() { setGuide(initialGuide); setCustom(""); }
  function choose(value: string) {
    if (!guide) return;
    if (guide.step === 0) setGuide({ ...guide, goal: value, step: 1 });
    else if (guide.step === 1) setGuide({ ...guide, topic: value, step: 2 });
    setCustom("");
  }
  function finish() {
    if (!guide) return;
    const filters = { goal: guide.goal, topic: guide.topic, location: guide.location };
    void search([guide.goal || "Explore the community", guide.topic, guide.location].filter(Boolean).join(" · "), filters);
  }
  function guideSubmit(event: FormEvent) {
    event.preventDefault();
    if (!guide) return;
    if (guide.step === 2) finish();
    else choose(custom.trim());
  }
  const directSubmit = (event: FormEvent) => { event.preventDefault(); void search(query); };
  const examples = t.prompts;
  const kinds = latest?.data?.plan.kinds ?? ["businesses", "organizations", "opportunities", "events"] as const;

  return <section id="ai-navigator" className={styles.navigator} aria-labelledby="navigator-heading" lang={language} dir={language === "en" ? "ltr" : "rtl"}>
    <div className={styles.top}>
      <div className={styles.identity}><Sparkles size={32} strokeWidth={1.5} aria-hidden="true" /><div><div className={styles.titleLine}><h2 id="navigator-heading">{t.title}</h2><span className={styles.beta}>{t.beta}</span></div><p>{t.description}</p></div></div>
      <form className={styles.search} onSubmit={directSubmit}><Search size={19} aria-hidden="true" /><input ref={input} value={query} onChange={event => setQuery(event.target.value)} aria-label={t.placeholder} placeholder={t.placeholder} dir="auto" minLength={2} maxLength={120} required /><button type="submit" aria-label={pending ? t.searching : t.search} disabled={pending || query.trim().length < 2}><ArrowUp size={19} aria-hidden="true" /></button></form>
    </div>
    <div className={styles.entries}><button type="button" className={styles.guideEntry} disabled={pending} onClick={startGuide}><Compass size={24} strokeWidth={1.5} aria-hidden="true" /><span><strong>{t.guide}</strong><small>{t.guideDescription}</small></span></button><div className={styles.examples}>{examples.map(example => <button key={example} type="button" disabled={pending} onClick={() => { setQuery(example); input.current?.focus(); }}>{example}</button>)}</div></div>
    <div className={styles.utility}><label>{t.language}<select aria-label="Navigator language" value={language} onChange={event => { setLanguage(event.target.value as NavigatorLanguage); setNotice(""); }}>{locales.map(locale => <option key={locale.value} value={locale.value}>{locale.label}</option>)}</select></label><details><summary>{t.privacy}</summary><p>{t.disclosure}</p></details>{(turns.length > 0 || guide) && <button type="button" onClick={restart}>{t.restart}</button>}</div>

    {guide && <div className={styles.guide}>
      <div className={styles.guideHeading}><span>{t.step} {guide.step + 1} / 3</span><button type="button" aria-label={t.close} onClick={() => { setGuide(null); input.current?.focus(); }}><X size={18} aria-hidden="true" /></button></div>
      <h3 ref={heading} tabIndex={-1}>{guide.step === 0 ? t.goalsTitle : guide.step === 1 ? t.topicsTitle : guide.goal === "Explore events" ? t.eventLocationTitle : t.locationTitle}</h3>
      {guide.step < 2 && <div className={styles.choices}>{(guide.step === 0 ? t.goals : t.topics).map((label, index) => <button type="button" key={label} onClick={() => choose(guide.step === 0 ? guidedGoals[index] : guidedTopics[index])}>{label}<ArrowRight size={15} aria-hidden="true" /></button>)}</div>}
      <form onSubmit={guideSubmit} className={styles.guideForm}><label htmlFor="navigator-guide-input">{guide.step === 2 ? t.location : t.custom}</label><div><input id="navigator-guide-input" dir="auto" value={guide.step === 2 ? guide.location : custom} maxLength={guide.step === 2 ? 60 : 80} onChange={event => guide.step === 2 ? setGuide({ ...guide, location: event.target.value }) : setCustom(event.target.value)} /><button type="submit" disabled={guide.step < 2 && custom.trim().length < 2}>{guide.step === 2 ? t.find : t.next}</button></div></form>
      <div className={styles.guideActions}>{guide.step > 0 && <button type="button" onClick={() => { setGuide({ ...guide, step: (guide.step - 1) as 0 | 1 }); setCustom(""); }}>{t.back}</button>}<button type="button" onClick={() => guide.step === 2 ? finish() : choose("")}>{t.skip}</button></div>
    </div>}

    <p className={styles.status} role="status" aria-live="polite">{notice}</p>
    {turns.length > 0 && <div className={styles.conversation} aria-label={t.history}>
      {turns.map(turn => <article key={turn.id} className={styles.turn} aria-busy={!turn.data && !turn.failed}>
        <p className={styles.query} dir="auto">{turn.query}</p>
        {turn.failed ? <div><p>{turn.failed === "busy" ? t.rate : t.error}</p><button type="button" disabled={pending} onClick={() => void search(turn.query, turn.filters)}>{t.retry}</button></div> : !turn.data ? <p>{t.searching}</p> : <>
          <h3>{t.results}</h3><p className={styles.understanding}>{t.looking}: <bdi>{turn.data.plan.topic || t.all}</bdi> · <bdi>{turn.data.plan.location || t.anywhere}</bdi></p>
          {turn.data.plan.people && <div className={styles.people}><p>{t.peopleNote}</p><Link href="/network">{t.people}<ArrowRight size={15} aria-hidden="true" /></Link></div>}
          {turn.data.unavailable.length > 0 && <p>{t.partial}</p>}
          {!turn.data.results.length && <p>{t.empty} {t.recovery}</p>}
          <ul className={styles.results}>{turn.data.results.map(result => <li key={result.href}><Link href={result.href}><span><small>{t.types[result.kind]}</small><strong dir="auto">{result.title}</strong>{result.summary && <p dir="auto">{result.summary}</p>}<span className={styles.reason}>{result.location} · {turn.data?.plan.topic ? t.reason : turn.data?.plan.location ? t.locationReason : t.generalReason}</span></span><ArrowRight size={17} aria-hidden="true" /></Link></li>)}</ul>
        </>}
      </article>)}
      <div className={styles.nextSteps}>{kinds.map(kind => <Link key={kind} href={`/explore?type=${kind}`}>{t.browse} · {t.types[kind]}<ArrowRight size={14} aria-hidden="true" /></Link>)}{latest?.data?.plan.location && <button type="button" disabled={pending} onClick={() => void search(latest.query, { ...latest.filters, goal: latest.filters?.goal ?? latest.query, topic: latest.data?.plan.topic, location: "" })}>{t.clearLocation}</button>}</div>
    </div>}
  </section>;
}
