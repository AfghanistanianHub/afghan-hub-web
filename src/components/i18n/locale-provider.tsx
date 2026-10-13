"use client";
import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { translate } from "@/lib/i18n/messages";
const Context = createContext<Locale>("en");
const NavigatorContext = createContext<Locale>("en");
export function LocaleProvider({ locale, navigatorLocale = locale, children }: { locale: Locale; navigatorLocale?: Locale; children: React.ReactNode }) { return <Context.Provider value={locale}><NavigatorContext.Provider value={navigatorLocale}>{children}</NavigatorContext.Provider></Context.Provider>; }
export function useNavigatorLocale() { return useContext(NavigatorContext); }
export function useLocale() { return useContext(Context); }
export function useMessages() { const locale = useLocale(); return (text: string) => translate(locale, text); }
