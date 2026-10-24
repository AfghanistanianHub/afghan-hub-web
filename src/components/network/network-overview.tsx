"use client";
import { ArrowRight, Sparkles, UserPlus, UsersRound } from "lucide-react";
import { ContextualAssistantPrompt } from "@/components/assistant/contextual-assistant-prompt";
import { useNetworkCopy } from "./use-network-copy";
export function NetworkOverview({memberCount,connectionCount,requestCount}:{memberCount:number;connectionCount:number;requestCount:number}) {
 const {language,copy}=useNetworkCopy();
 const stats=[{label:copy.members,value:memberCount,icon:UsersRound},{label:copy.connections,value:connectionCount,icon:ArrowRight},{label:copy.requests,value:requestCount,icon:UserPlus}];
 return <section lang={language} dir={language==="en"?"ltr":"rtl"} data-illustration-trigger className="relative border-b border-border/70 pb-6 pt-2 sm:pt-4">
   <div className="relative max-w-4xl">
     <p className="inline-flex items-center gap-2 text-xs font-semibold text-primary"><Sparkles aria-hidden="true" className="size-3.5"/>{copy.eyebrow}</p>
     <h1 className="mt-3 text-balance text-[clamp(2.1rem,3.8vw,3.6rem)] font-semibold leading-[1.18] tracking-tight text-foreground">{copy.title}</h1>
     <p className="mt-3 max-w-[65ch] text-base leading-7 text-muted-foreground">{copy.description}</p>
     <div className="mt-4 flex flex-wrap gap-2">
      <ContextualAssistantPrompt label={copy.tech} query="Find professionals working in technology"/>
      <ContextualAssistantPrompt label={copy.artists} query="Find artists working in arts and culture"/>
      <ContextualAssistantPrompt label={copy.mentors} query="Find mentors in the community"/>
     </div>
   </div>
   <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 border-t border-border/70 pt-4">
    {stats.map(({label,value,icon:Icon})=><div key={label} className="flex min-h-11 items-center gap-2 text-sm"><Icon aria-hidden="true" className="size-4 text-primary"/><b dir="ltr" className="tabular-nums">{value}</b><span className="text-muted-foreground">{label}</span></div>)}
   </div>
 </section>;
}
