"use client";

import Link from "next/link";
import { type FormEvent, type KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ArrowUpRight, Compass, Search, Sparkles, X } from "lucide-react";
import { trackAssistantEvent } from "@/lib/assistant/analytics";
import { ASSISTANT_OPEN_EVENT } from "@/components/assistant/contextual-assistant-prompt";
import { resolveNavigatorContext, type NavigatorContext } from "@/lib/assistant/conversation";
import { memberNavigatorCopy as copy, memberNavigatorPrompts as prompts, memberNavigatorDialogue as dialogue, memberNavigatorLocales, memberNavigatorUtility } from "@/lib/assistant/member-navigator-copy";
import styles from "./community-navigator.module.css";

import { readNavigatorLanguagePreference, saveNavigatorLanguagePreference, subscribeNavigatorLanguagePreference, serverNavigatorLanguagePreference, type NavigatorLanguage } from "@/lib/assistant/navigator-language";
type Result = {
  entityType: "profile" | "business" | "organization" | "opportunity" | "event";
  entityId: string; title: string; subtitle: string | null; city: string | null;
  country: string | null; href: string; rank: number; matchedTopics?: string[];
};
type Group = { memberSignal: NavigatorContext["memberSignal"] | null; results: Result[] };
type Turn = { id: number; query: string; status: "pending" | "ready" | "failed"; context?: NavigatorContext; groups: Group[]; relatedUnavailable?: boolean; scopeLimited?: boolean; browseOnly?: boolean };
type Payload = { browseOnly?: boolean; context: NavigatorContext; groups: Group[]; results: Result[]; intent: string; entityType: Result["entityType"] | null; relatedUnavailable?: boolean };

export function CommunityNavigator() {
  const [open, setOpen] = useState(false);
  const savedLanguage = useSyncExternalStore(subscribeNavigatorLanguagePreference, readNavigatorLanguagePreference, serverNavigatorLanguagePreference);
  const [selectedLanguage, setLanguage] = useState<NavigatorLanguage | null>(null);
  const language = selectedLanguage ?? savedLanguage;
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
    // Keep focus when a starter or follow-up button disappears during search.
    inputRef.current?.focus();
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

  function containDialogFocus(event: ReactKeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const dialog = event.currentTarget;
    const focusable = [...dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
    )].filter(element => element.getClientRects().length > 0 && element.getAttribute("aria-hidden") !== "true");

    if (!focusable.length) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first.focus();
    }
  }

  return <>
    <button type="button" className={styles.launcher} aria-label={strings.ask} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      <Compass size={17} aria-hidden="true" /><span className={styles.launcherLabel}>{strings.ask}</span><kbd className="hidden text-[10px] text-muted-foreground lg:inline">⌘K</kbd>
    </button>
    {open ? <dialog ref={panelRef} aria-modal="true" aria-labelledby="community-navigator-title" className={styles.drawer} dir={language === "en" ? "ltr" : "rtl"} lang={language} onCancel={() => setOpen(false)} onKeyDown={containDialogFocus}
      onMouseDown={event => { if (event.target === event.currentTarget) {const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)setOpen(false);} }}>
      <header className={styles.header}>
        <div className={styles.brand}><span className={styles.identity}><span className={styles.identityMark}><Compass size={17} aria-hidden="true" /></span><span><small>AFGHAN HUB</small><strong>Community Navigator</strong></span></span><button type="button" className={styles.close} aria-label={memberNavigatorUtility[language].close} onClick={() => setOpen(false)}><X size={19} aria-hidden="true" /></button></div>
        <p className={styles.kicker}><Sparkles size={13} aria-hidden="true" />{labels.title}</p><h2 id="community-navigator-title">{strings.title}</h2><p className={styles.description}>{strings.description}</p>
        <div className={styles.toolbar}>{memberNavigatorLocales.map(({value:option,label}) => <button type="button" key={option} aria-pressed={language===option} onClick={() => {setLanguage(saveNavigatorLanguagePreference(option));trackAssistantEvent({event:"assistant_language_change",language:option});}}>{label}</button>)}<button type="button" className={styles.reset} onClick={startOver}>{labels.start}</button></div>
      </header>
      <p role="status" aria-live="polite" className="sr-only">{pending ? strings.searching : turns.at(-1)?.status === "ready" ? `${labels.matches}: ${turns.at(-1)?.groups.reduce((count,group)=>count+group.results.length,0)}` : ""}</p>
      <div className={styles.conversation} aria-label={labels.title}>
        {!turns.length ? <div className={styles.welcome}><p className={styles.description}>{labels.grounded}</p><div className={styles.prompts}>{prompts[language].map((prompt,index) => <button type="button" key={prompt} onClick={() => void runSearch(prompt)}><span>{String(index + 1).padStart(2,"0")}</span>{prompt}<ArrowUpRight size={14} aria-hidden="true" /></button>)}</div></div> : null}
        {turns.map((turn,index) => <article key={turn.id} className={styles.turn}>
          <div className={styles.user}><p className={styles.label}>{labels.you}</p><p>{turn.query}</p></div>
          <p className={styles.label}>{labels.title}</p>
          {turn.status === "pending" ? <div className={styles.pending}><span className={styles.progress} aria-hidden="true" />{strings.searching}</div> : turn.status === "failed" ? <div role="status"><p className={styles.summary}>{turn.scopeLimited ? strings.scopeError : strings.error}</p><div className={styles.followups}>{!turn.scopeLimited ? <button type="button" disabled={pending} onClick={() => void runSearch(turn.query, turn.context)}>{labels.retry}</button> : null}</div>{recoveryLinks(turn.context)}</div> : <>
            <p className={styles.summary}>{turn.browseOnly ? strings.recovery : turn.groups.some(group=>group.results.length) ? labels.matches : strings.empty}</p>
            <div className={styles.context}>{turn.context?.topic ? <span>{turn.context.topic}</span> : null}{turn.context?.city ? <span>{turn.context.city}</span> : null}</div>
            {turn.groups.map((group,groupIndex) => <div key={groupIndex} className={styles.group}>
              {group.memberSignal ? <><h4>{group.memberSignal==="open_to_mentoring"?labels.mentors:labels.mentees}</h4><p className={styles.scope}>{labels.preference}</p>{!group.results.length ? <p className={styles.description}>{strings.empty}</p> : null}</> : null}
              {(["profile","opportunity","event","organization","business"] as const).map(type => { const results=group.results.filter(result=>result.entityType===type);return results.length ? <div key={type}>{!group.memberSignal ? <h4>{labels.types[type]}</h4> : null}<div className={styles.results}>{results.map(result => <Link href={result.href} key={`${result.entityType}:${result.entityId}`} className={styles.result} onClick={() => {trackAssistantEvent({event:"assistant_result_click",language,entityType:result.entityType});setOpen(false);}}><span><span className={styles.resultType}>{labels.types[result.entityType]}</span><strong>{result.title}</strong>{result.subtitle ? <small>{result.subtitle}</small> : null}{[result.city,result.country].filter(Boolean).length ? <small>{[result.city,result.country].filter(Boolean).join(", ")}</small> : null}{result.matchedTopics?.length ? <small className={styles.reason}>{result.matchedTopics.join(" · ")}</small> : null}</span><ArrowUpRight size={16} aria-hidden="true" /></Link>)}</div></div> : null;})}
            </div>)}
            {turn.relatedUnavailable ? <p className={styles.scope}>{labels.partial}</p> : null}
            {!turn.groups.some(group=>group.results.length) ? <>{!turn.browseOnly ? <p className={styles.description}>{strings.recovery}</p> : null}{recoveryLinks(turn.context)}</> : null}
            {index===turns.length-1 ? <div className={styles.followups} aria-label={labels.follow}><button type="button" disabled={pending} onClick={() => void runSearch(turn.context?.entityType==="event"?labels.people:labels.events)}>{turn.context?.entityType==="event"?labels.people:labels.events}</button>{turn.context?.city ? <button type="button" disabled={pending} onClick={() => void runSearch(labels.anywhere)}>{labels.anywhere}</button> : null}</div> : null}
          </>}
        </article>)}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={submit} className={styles.composer}><div className={styles.composerLabel}><span>{strings.ask}</span><span>{query.length}/120</span></div><div className={styles.inputRow}><div className={styles.inputWrap}><Search size={16} aria-hidden="true" /><input ref={inputRef} aria-label={strings.ask} dir="auto" value={query} onChange={event => setQuery(event.target.value)} maxLength={120} placeholder={strings.placeholder} /></div><button type="submit" disabled={pending||query.trim().length<2}>{pending?strings.searching:strings.search}</button></div><p className={styles.scope}>{strings.readOnly}</p><details className={styles.privacy}><summary>{memberNavigatorUtility[language].privacy}</summary><p>{labels.grounded} {labels.privacy}</p></details></form>
    </dialog> : null}
  </>;
}
