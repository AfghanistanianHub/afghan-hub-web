import { enUS } from "date-fns/locale";
import { faIR } from "@daypicker/react/locale";
import type { Locale } from "date-fns";

import type { SiteLanguage } from "./site-language";

const pashtoMonths = [
  "جنوري",
  "فبروري",
  "مارچ",
  "اپریل",
  "مې",
  "جون",
  "جولای",
  "اګست",
  "سپتمبر",
  "اکتوبر",
  "نومبر",
  "دسمبر",
];

const pashtoWeekdays = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنجشنبه",
  "جمعه",
  "شنبه",
];

/**
 * Pashto Gregorian calendar names for the day picker. date-fns ships no `ps`
 * locale, so the English one provides the format patterns while month,
 * weekday and ordinal text come from the arrays above.
 */
const pashtoLocale: Locale = {
  ...enUS,
  code: "ps",
  localize: {
    ...enUS.localize,
    month: (index: number) => pashtoMonths[index],
    day: (index: number) => pashtoWeekdays[index],
    ordinalNumber: (value: number) => String(value),
  },
  options: { ...enUS.options, weekStartsOn: 6 },
};

/** Calendar locale for the day picker; the grid otherwise defaults to English. */
export function getCalendarLocale(language: SiteLanguage) {
  if (language === "fa") return faIR;
  if (language === "ps") return pashtoLocale;
  return enUS;
}
