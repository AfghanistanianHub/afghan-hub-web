"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Compass, X } from "lucide-react";
import { trackAssistantEvent } from "@/lib/assistant/analytics";
import { ASSISTANT_OPEN_EVENT } from "@/components/assistant/contextual-assistant-prompt";
import { resolveNavigatorContext, type NavigatorContext } from "@/lib/assistant/conversation";
import styles from "./community-navigator.module.css";

type Language = "en" | "fa" | "ps";
type Result = {
  entityType: "profile" | "business" | "organization" | "opportunity" | "event";
  entityId: string; title: string; subtitle: string | null; city: string | null;
  country: string | null; href: string; rank: number; matchedTopics?: string[];
};
type Group = { memberSignal: NavigatorContext["memberSignal"] | null; results: Result[] };
type Turn = { id: number; query: string; status: "pending" | "ready" | "failed"; context?: NavigatorContext; groups: Group[]; relatedUnavailable?: boolean; scopeLimited?: boolean; browseOnly?: boolean };
type Payload = { browseOnly?: boolean; context: NavigatorContext; groups: Group[]; results: Result[]; intent: string; entityType: Result["entityType"] | null; relatedUnavailable?: boolean };

const copy = {
  en: {
    ask: "Community Navigator",
    title: "What are you looking for?",
    description:
      "Find people, organizations, businesses, opportunities and upcoming events across Afghan Hub.",
    placeholder: "Try “volunteer opportunities in Vancouver”…",
    search: "Search",
    searching: "Searching…",
    empty: "No matching Afghan Hub results yet.",
    recovery: "Try a broader search or browse a section directly.",
    browsePeople: "Browse people",
    browseOrganizations: "Browse organizations",
    browseOpportunities: "Browse opportunities",
    browseEvents: "Browse events",
    browseBusinesses: "Browse businesses",
    error: "Search is temporarily unavailable. Please try again.",
    scopeError: "This mentor catalogue exceeds the search limit. Browse people in Network.",
    readOnly: "Discovery only · no actions will be taken",
  },
  fa: {
    ask: "راهنمای جامعه",
    title: "دنبال چه چیزی هستید؟",
    description:
      "افراد، سازمان‌ها، کسب‌وکارها، فرصت‌ها و رویدادهای آینده را در افغان هاب پیدا کنید.",
    placeholder: "مثلاً «فرصت‌های داوطلبی در ونکوور»…",
    search: "جست‌وجو",
    searching: "در حال جست‌وجو…",
    empty: "نتیجه مرتبطی پیدا نشد.",
    recovery: "عبارت عمومی‌تری را امتحان کنید یا مستقیماً یک بخش را مرور کنید.",
    browsePeople: "مرور افراد",
    browseOrganizations: "مرور سازمان‌ها",
    browseOpportunities: "مرور فرصت‌ها",
    browseEvents: "مرور رویدادها",
    browseBusinesses: "مرور کسب‌وکارها",
    error: "جست‌وجو فعلاً در دسترس نیست. دوباره تلاش کنید.",
    scopeError: "تعداد اعضای این جست‌وجو از محدودیت بیشتر است. افراد را در بخش شبکه مرور کنید.",
    readOnly: "فقط برای پیدا کردن اطلاعات · هیچ اقدامی انجام نمی‌شود",
  },
  ps: {
    ask: "ټولنیز لارښود",
    title: "تاسو څه لټوئ؟",
    description:
      "په افغان هب کې خلک، سازمانونه، کاروبارونه، فرصتونه او راتلونکې غونډې ومومئ.",
    placeholder: "لکه «په ونکوور کې د رضاکارۍ فرصتونه»…",
    search: "لټون",
    searching: "لټون روان دی…",
    empty: "اړوند پایله ونه موندل شوه.",
    recovery: "پراخه لټون وازمویئ یا یوه برخه مستقیمه وګورئ.",
    browsePeople: "خلک وګورئ",
    browseOrganizations: "سازمانونه وګورئ",
    browseOpportunities: "فرصتونه وګورئ",
    browseEvents: "غونډې وګورئ",
    browseBusinesses: "کاروبارونه وګورئ",
    error: "لټون اوس مهال شتون نه لري. بیا هڅه وکړئ.",
    scopeError: "د دې لټون د غړو شمېر له حد څخه زیات دی. خلک په شبکه کې وګورئ.",
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

const dialogue = {
  en: { retry: "Try again", privacy: "Your search is sent to Afghan Hub to find matches. Avoid sensitive personal details. Conversation stays on this page; no messages are sent to members.", title: "Community Navigator", you: "You", matches: "Matches from Afghan Hub", start: "Start a new search", grounded: "Grounded in Afghan Hub listings and public member profiles.", mentors: "Members open to mentoring", mentees: "Members looking for a mentor", preference: "Mentorship is a member preference, not an endorsement.", follow: "Keep exploring", events: "Show me events too", people: "Show me people too", anywhere: "All locations", partial: "Related member results could not be loaded.", types: { profile: "Members", event: "Events", opportunity: "Opportunities", organization: "Organizations", business: "Businesses" } },
  fa: { retry: "دوباره تلاش کنید", privacy: "جست‌وجوی شما برای یافتن نتایج به افغان هاب فرستاده می‌شود. اطلاعات حساس ننویسید. تاریخچه فقط در این جلسه می‌ماند؛ پیام یا درخواستی فرستاده نمی‌شود.", title: "راهنمای جامعه", you: "شما", matches: "نتایج از افغان هاب", start: "جست‌وجوی تازه", grounded: "بر اساس آگهی‌ها و پروفایل‌های عمومی افغان هاب.", mentors: "اعضای آماده برای راهنمایی", mentees: "اعضای در جست‌وجوی راهنما", preference: "راهنمایی ترجیح عضو است، نه تأیید صلاحیت.", follow: "به کشف ادامه دهید", events: "رویدادها را هم نشان بده", people: "افراد را هم نشان بده", anywhere: "همه جا", partial: "نتایج اعضای مرتبط بارگیری نشد.", types: { profile: "اعضا", event: "رویدادها", opportunity: "فرصت‌ها", organization: "سازمان‌ها", business: "کسب‌وکارها" } },
  ps: { retry: "بیا هڅه وکړئ", privacy: "ستاسو لټون د پایلو موندلو لپاره افغان هب ته لېږل کېږي. حساس معلومات مه لیکئ. تاریخچه یوازې په دې ناسته کې پاتې کېږي؛ پیغام یا غوښتنه نه لېږل کېږي.", title: "ټولنیز لارښود", you: "تاسو", matches: "د افغان هب پایلې", start: "نوی لټون", grounded: "د افغان هب د اعلانونو او عامه پروفایلونو پر بنسټ.", mentors: "لارښوونې ته چمتو غړي", mentees: "د لارښود په لټه کې غړي", preference: "لارښوونه د غړي خوښه ده، د وړتیا تایید نه دی.", follow: "موندنې ته دوام ورکړئ", events: "غونډې هم را وښیه", people: "خلک هم را وښیه", anywhere: "هر ځای", partial: "د اړوندو غړو پایلې ترلاسه نه شوې.", types: { profile: "غړي", event: "غونډې", opportunity: "فرصتونه", organization: "سازمانونه", business: "کاروبارونه" } },
} as const;

export function CommunityNavigator() {
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [query, setQuery] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [pending, setPending] = useState(false);
  const panelRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<NavigatorContext | undefined>(undefined);
  const controllerRef = useRef<AbortController | null>(null);
  const pendingRef = useRef(false);
  const sequence = useRef(0);
  const wasOpen = useRef(false);
  const strings = copy[language];
  const labels = dialogue[language];
  const recoveryItems = [
    {href:"/network", label:strings.browsePeople, destination:"network" as const},
    {href:"/organizations", label:strings.browseOrganizations, destination:"organizations" as const},
    {href:"/opportunities", label:strings.browseOpportunities, destination:"opportunities" as const},
    {href:"/events", label:strings.browseEvents, destination:"events" as const},
  ];
  function recoveryLinks(context?: NavigatorContext) {
    const preferred = context?.entityType === "profile" ? "/network" : context?.entityType ? `/${context.entityType === "opportunity" ? "opportunities" : context.entityType === "business" ? "businesses" : context.entityType === "organization" ? "organizations" : "events"}` : undefined;
    const items = [...recoveryItems, {href:"/businesses",label:strings.browseBusinesses,destination:undefined}].sort((a,b)=>Number(b.href===preferred)-Number(a.href===preferred));
    return <div className={styles.followups}>{items.map(item => <Link key={item.href} href={item.href} className={styles.recovery} onClick={() => {if(item.destination) trackAssistantEvent({event:"assistant_recovery_click",language,destination:item.destination});setOpen(false);}}>{item.label}</Link>)}</div>;
  }


  function startOver() {
    controllerRef.current?.abort();
    sequence.current++;
    contextRef.current = undefined;
    pendingRef.current = false;
    setPending(false); setTurns([]); setQuery("");
    inputRef.current?.focus();
  }

  useEffect(() => {
    const onOpen = (event: Event) => {
      const value = (event as CustomEvent<{query?: string}>).detail?.query;
      if (value) { controllerRef.current?.abort(); sequence.current++; contextRef.current = undefined; pendingRef.current = false; setPending(false); setTurns([]); setQuery(value.trim().slice(0, 120)); }
      setOpen(true);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setOpen(current => !current); }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener(ASSISTANT_OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKeyDown);
    return () => { controllerRef.current?.abort(); window.removeEventListener(ASSISTANT_OPEN_EVENT, onOpen); window.removeEventListener("keydown", onKeyDown); };
  }, []);

  useEffect(() => {
    if (open && !wasOpen.current) trackAssistantEvent({event:"assistant_open",language});
    wasOpen.current = open;
  }, [open, language]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    panel?.showModal();
    inputRef.current?.focus();
    return () => { panel?.close(); if (previous?.isConnected) previous.focus(); };
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [turns]);

  async function runSearch(value: string, previousContext: NavigatorContext | undefined = contextRef.current) {
    const normalized = value.trim().slice(0, 120);
    if (normalized.length < 2 || pendingRef.current) return;
    pendingRef.current = true; setPending(true); setQuery("");
    const id = ++sequence.current;
    const controller = new AbortController(); controllerRef.current = controller;
    const timeout = window.setTimeout(() => controller.abort("timeout"), 20000);
    setTurns(current => [...current.slice(-9), {id, query: normalized, status: "pending", context: resolveNavigatorContext(normalized, previousContext), groups: []}]);
    let scopeLimited = false;
    try {
      const response = await fetch("/api/assistant/search", { method: "POST", headers: {"content-type":"application/json"}, signal: controller.signal, body: JSON.stringify({query: normalized, limit: 8, context: previousContext}) });
      if (!response.ok) { scopeLimited = response.status === 422; throw new Error("Search unavailable"); }
      const data = await response.json() as Payload;
      if (controller.signal.aborted || id !== sequence.current) return;
      contextRef.current = data.context;
      setTurns(current => current.map(turn => turn.id === id ? {...turn, status: "ready", context: data.context, groups: data.groups, relatedUnavailable: data.relatedUnavailable, browseOnly: data.browseOnly} : turn));
      trackAssistantEvent({event:"assistant_search",language,intent:data.intent,entityType:data.entityType,resultCount:data.results.length,hadResults:data.results.length>0});
    } catch {
      if ((!controller.signal.aborted || controller.signal.reason === "timeout") && id === sequence.current) setTurns(current => current.map(turn => turn.id === id ? {...turn,status:"failed",scopeLimited} : turn));
    } finally {
      window.clearTimeout(timeout);
      if (id === sequence.current) { pendingRef.current = false; setPending(false); }
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void runSearch(query); }

  return <>
    <button type="button" className={styles.launcher} aria-label={strings.ask} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      <Compass size={17} aria-hidden="true" /><span className={styles.launcherLabel}>{strings.ask}</span><kbd className="hidden text-[10px] text-muted-foreground lg:inline">⌘K</kbd>
    </button>
    {open ? <dialog ref={panelRef} aria-modal="true" aria-labelledby="community-navigator-title" className={styles.drawer} dir={language === "en" ? "ltr" : "rtl"} lang={language === "fa" ? "fa" : language} onCancel={() => setOpen(false)}
      onMouseDown={event => { if (event.target === event.currentTarget) {const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)setOpen(false);} }}>
      <header className={styles.header}>
        <div className={styles.brand}><span className={styles.identity}><Compass size={18} aria-hidden="true" />Afghan Hub</span><button type="button" className={styles.close} aria-label={language === "en" ? "Close Community Navigator" : language === "fa" ? "بستن راهنما" : "لارښود بند کړئ"} onClick={() => setOpen(false)}><X size={19} aria-hidden="true" /></button></div>
        <h2 id="community-navigator-title">{labels.title}</h2><p className={styles.description}>{strings.description}</p>
        <div className={styles.toolbar}>{(["en","fa","ps"] as const).map(option => <button type="button" key={option} aria-pressed={language===option} onClick={() => {setLanguage(option);trackAssistantEvent({event:"assistant_language_change",language:option});}}>{option==="en"?"English":option==="fa"?"دری":"پښتو"}</button>)}<button type="button" className={styles.reset} onClick={startOver}>{labels.start}</button></div>
      </header>
      <p role="status" aria-live="polite" className="sr-only">{pending ? strings.searching : turns.at(-1)?.status === "ready" ? `${labels.matches}: ${turns.at(-1)?.groups.reduce((count,group)=>count+group.results.length,0)}` : ""}</p>
      <div className={styles.conversation} aria-label={labels.title}>
        {!turns.length ? <div className={styles.welcome}><h3>{strings.title}</h3><p className={styles.description}>{labels.grounded}</p><div className={styles.prompts}>{prompts[language].map(prompt => <button type="button" key={prompt} onClick={() => void runSearch(prompt)}>{prompt}</button>)}</div></div> : null}
        {turns.map((turn,index) => <article key={turn.id} className={styles.turn}>
          <div className={styles.user}><p className={styles.label}>{labels.you}</p><p>{turn.query}</p></div>
          <p className={styles.label}>{labels.title}</p>
          {turn.status === "pending" ? <div className={styles.pending}><span className={styles.progress} aria-hidden="true" />{strings.searching}</div> : turn.status === "failed" ? <div role="status"><p className={styles.summary}>{turn.scopeLimited ? strings.scopeError : strings.error}</p><div className={styles.followups}>{!turn.scopeLimited ? <button type="button" disabled={pending} onClick={() => void runSearch(turn.query, turn.context)}>{labels.retry}</button> : null}</div>{recoveryLinks(turn.context)}</div> : <>
            <p className={styles.summary}>{turn.browseOnly ? strings.recovery : turn.groups.some(group=>group.results.length) ? labels.matches : strings.empty}</p>
            <div className={styles.context}>{turn.context?.topic ? <span>{turn.context.topic}</span> : null}{turn.context?.city ? <span>{turn.context.city}</span> : null}</div>
            {turn.groups.map((group,groupIndex) => <div key={groupIndex} className={styles.group}>
              {group.memberSignal ? <><h4>{group.memberSignal==="open_to_mentoring"?labels.mentors:labels.mentees}</h4><p className={styles.scope}>{labels.preference}</p>{!group.results.length ? <p className={styles.description}>{strings.empty}</p> : null}</> : null}
              {(["profile","opportunity","event","organization","business"] as const).map(type => { const results=group.results.filter(result=>result.entityType===type);return results.length ? <div key={type}>{!group.memberSignal ? <h4>{labels.types[type]}</h4> : null}<div className={styles.results}>{results.map(result => <Link href={result.href} key={`${result.entityType}:${result.entityId}`} className={styles.result} onClick={() => {trackAssistantEvent({event:"assistant_result_click",language,entityType:result.entityType});setOpen(false);}}><span><strong>{result.title}</strong>{result.subtitle ? <small>{result.subtitle}</small> : null}{[result.city,result.country].filter(Boolean).length ? <small>{[result.city,result.country].filter(Boolean).join(", ")}</small> : null}{result.matchedTopics?.length ? <small className={styles.reason}>{result.matchedTopics.join(" · ")}</small> : null}</span><ArrowUpRight size={16} aria-hidden="true" /></Link>)}</div></div> : null;})}
            </div>)}
            {turn.relatedUnavailable ? <p className={styles.scope}>{labels.partial}</p> : null}
            {!turn.groups.some(group=>group.results.length) ? <>{!turn.browseOnly ? <p className={styles.description}>{strings.recovery}</p> : null}{recoveryLinks(turn.context)}</> : null}
            {index===turns.length-1 ? <div className={styles.followups} aria-label={labels.follow}><button type="button" disabled={pending} onClick={() => void runSearch(turn.context?.entityType==="event"?labels.people:labels.events)}>{turn.context?.entityType==="event"?labels.people:labels.events}</button>{turn.context?.city ? <button type="button" disabled={pending} onClick={() => void runSearch(labels.anywhere)}>{labels.anywhere}</button> : null}</div> : null}
          </>}
        </article>)}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className={styles.composer}><div className={styles.inputRow}><input ref={inputRef} aria-label={strings.ask} value={query} onChange={event => setQuery(event.target.value)} maxLength={120} placeholder={strings.placeholder} /><button type="submit" disabled={pending||query.trim().length<2}>{pending?strings.searching:strings.search}</button></div><p className={styles.scope}>{strings.readOnly}</p><details className={styles.privacy}><summary>{language === "en" ? "How your search works" : language === "fa" ? "جست‌وجو چگونه کار می‌کند" : "لټون څنګه کار کوي"}</summary><p>{labels.grounded} {labels.privacy}</p></details></form>
    </dialog> : null}
  </>;
}
