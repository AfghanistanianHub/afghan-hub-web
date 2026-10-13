"use client";
import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { translate } from "@/lib/i18n/messages";
const Context = createContext<Locale>("en");
export function LocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) { return <Context.Provider value={locale}>{children}</Context.Provider>; }
export function useLocale() { return useContext(Context); }
export function useMessages() { const locale = useLocale(); return (text: string) => translate(locale, text); }
