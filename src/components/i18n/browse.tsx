"use client";

import type { ReactNode } from "react";

import { formatCopy } from "@/lib/i18n/ui-copy";
import {
  getBrowseCopy,
  type BrowseCopyKey,
} from "@/lib/i18n/browse-copy";
import { formatSiteDate, formatSiteNumber } from "@/lib/i18n/format";
import type { SiteLanguage } from "@/lib/i18n/site-language";
import { useSiteLanguage } from "./localized";

type Values = Record<string, string | number>;

function localizedValues(language: SiteLanguage, values?: Values) {
  if (!values) return {};
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      typeof value === "number" ? formatSiteNumber(language, value) : value,
    ]),
  );
}

/**
 * Client-side access to the discovery catalogue for components that need
 * strings in attributes (placeholders, confirmations, aria labels).
 */
export function useBrowseCopy() {
  const language = useSiteLanguage();
  const t = (key: BrowseCopyKey, values?: Values) =>
    formatCopy(getBrowseCopy(language, key), localizedValues(language, values));
  return { language, t, copy: getBrowseCopy };
}

/** Renders one discovery catalogue string with its own language boundary. */
export function B({
  k,
  values,
  className,
}: {
  k: BrowseCopyKey;
  values?: Values;
  className?: string;
}) {
  const { language, t } = useBrowseCopy();
  return (
    <span lang={language} dir={language === "en" ? "ltr" : "rtl"} className={className}>
      {t(k, values)}
    </span>
  );
}

type BrowseFieldProps = {
  labelKey: BrowseCopyKey;
  name: string;
  className: string;
  labelClassName?: string;
  placeholderKey?: BrowseCopyKey;
  defaultValue?: string;
  type?: "search" | "text";
  id?: string;
  icon?: ReactNode;
  /** Where the icon sits: beside the label, or overlaid inside the field. */
  iconPlacement?: "label" | "field";
};

/**
 * Labelled directory search/text field. Search terms follow the page
 * direction, and the localized placeholder is supplied here so the server
 * page never ships English copy.
 */
export function BrowseField({
  labelKey,
  name,
  className,
  labelClassName = "grid gap-2 text-sm font-medium text-foreground",
  placeholderKey,
  defaultValue,
  type = "search",
  id,
  icon,
  iconPlacement = "label",
}: BrowseFieldProps) {
  const { language, t } = useBrowseCopy();
  const field = (
    <input
      id={id}
      type={type}
      name={name}
      defaultValue={defaultValue}
      placeholder={placeholderKey ? t(placeholderKey) : undefined}
      dir={language === "en" ? "ltr" : "rtl"}
      className={className}
    />
  );

  return (
    <label className={labelClassName} htmlFor={id}>
      <span lang={language} className={iconPlacement === "field" ? undefined : "inline-flex items-center gap-2"}>
        {iconPlacement === "label" ? icon : null}
        {t(labelKey)}
      </span>
      {iconPlacement === "field" ? (
        <span className="relative block">
          {icon ? <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-4 z-10 flex items-center text-muted-foreground">{icon}</span> : null}
          {field}
        </span>
      ) : (
        field
      )}
    </label>
  );
}

type BrowseSelectProps = {
  labelKey: BrowseCopyKey;
  name: string;
  className: string;
  labelClassName?: string;
  wrapperClassName?: string;
  defaultValue?: string;
  options: ReadonlyArray<{ value: string; key: BrowseCopyKey }>;
};

/** Select whose visible options are localized and values stay canonical. */
export function BrowseSelect({
  labelKey,
  name,
  className,
  labelClassName = "grid gap-2 text-sm font-medium text-foreground",
  wrapperClassName,
  defaultValue,
  options,
}: BrowseSelectProps) {
  const { language, t } = useBrowseCopy();
  return (
    <label className={wrapperClassName ?? labelClassName}>
      <span lang={language}>{t(labelKey)}</span>
      <select name={name} defaultValue={defaultValue} className={className}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.key)}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Checkbox filter with a localized label. */
export function BrowseCheckbox({
  name,
  labelKey,
  defaultChecked,
  labelClassName,
  inputClassName = "size-5 shrink-0 rounded border-border accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
}: {
  name: string;
  labelKey: BrowseCopyKey;
  defaultChecked?: boolean;
  labelClassName: string;
  inputClassName?: string;
}) {
  const { language } = useBrowseCopy();
  return (
    <label className={labelClassName} lang={language}>
      <input type="checkbox" name={name} value="only" defaultChecked={defaultChecked} className={inputClassName} />
      <B k={labelKey} />
    </label>
  );
}

type BDateMode =
  | "date"
  | "shortDate"
  | "datetime"
  | "time"
  | "monthDay"
  | "monthShort"
  | "day"
  | "monthYear";
const dateOptions: Record<BDateMode, Intl.DateTimeFormatOptions> = {
  date: { year: "numeric", month: "long", day: "numeric" },
  shortDate: { year: "numeric", month: "short", day: "numeric" },
  datetime: { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" },
  time: { hour: "numeric", minute: "2-digit" },
  monthDay: { month: "short", day: "numeric" },
  monthShort: { month: "short" },
  day: { day: "numeric" },
  monthYear: { month: "long", year: "numeric" },
};

/**
 * Locale-aware Gregorian date/time. Farsi and Pashto get their own month
 * names and digits while the stored Gregorian value is unchanged.
 */
export function BDate({
  value,
  mode = "date",
  className,
  timeZoneName,
}: {
  value: string | Date;
  mode?: BDateMode;
  className?: string;
  timeZoneName?: "short";
}) {
  const language = useSiteLanguage();
  const formatted = formatSiteDate(language, value, {
    ...dateOptions[mode],
    ...(timeZoneName ? { timeZoneName } : {}),
  });
  const iso = value instanceof Date ? value.toISOString() : value;
  return (
    <time dateTime={iso} className={className} lang={language}>
      {formatted}
    </time>
  );
}

/**
 * Catalogue sentence that embeds a locale-formatted date, such as
 * "No matching events in {month}". The date stays a date; only its rendering
 * follows the active language.
 */
export function BDatePhrase({
  k,
  date,
  mode = "monthYear",
  field = "month",
  className,
}: {
  k: BrowseCopyKey;
  date: string | Date;
  mode?: BDateMode;
  /** Placeholder name used by the catalogue sentence, e.g. {date}. */
  field?: string;
  className?: string;
}) {
  const { language, t } = useBrowseCopy();
  return (
    <span lang={language} dir={language === "en" ? "ltr" : "rtl"} className={className}>
      {t(k, { [field]: formatSiteDate(language, date, dateOptions[mode]) })}
    </span>
  );
}

/** Localized weekday headings for the events calendar grid. */
export function BWeekdays({ className }: { className: string }) {
  const language = useSiteLanguage();
  const sunday = Date.UTC(2024, 0, 7);
  return (
    <>
      {Array.from({ length: 7 }, (_, index) => (
        <div key={index} className={className}>
          {formatSiteDate(language, new Date(sunday + index * 86_400_000), { weekday: "short" })}
        </div>
      ))}
    </>
  );
}

/** Localized number, for counts rendered outside a catalogue string. */
export function BNumber({ value }: { value: number }) {
  const language = useSiteLanguage();
  return <span lang={language}>{formatSiteNumber(language, value)}</span>;
}
