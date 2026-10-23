"use client";

import { useId, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import styles from "./calendar-field.module.css";
import { format, parseISO } from "date-fns";
import { DayPicker } from "@daypicker/react";
import "@daypicker/react/style.css";
import { useSiteLanguage } from "@/components/i18n/localized";
import { useWorkspaceCopy } from "@/components/i18n/workspace";
import type { WorkspaceCopyKey } from "@/lib/i18n/workspace-copy";
import { formatSiteDate } from "@/lib/i18n/format";

type EventDateTimePickerProps = {
  name: string;
  /** Catalog key for the placeholder and accessible name. */
  labelKey?: WorkspaceCopyKey;
  /** Literal fallback for a server-provided label that is already localized. */
  label?: string;
  defaultValue?: string | null;
  required?: boolean;
};

function toTwelveHourTime(date?: Date) {
  if (!date) {
    return { hour: "", minute: "", period: "AM" };
  }

  const hours = date.getHours();
  const period = hours >= 12 ? "PM" : "AM";
  const hour = hours % 12 || 12;

  return {
    hour: String(hour).padStart(2, "0"),
    minute: String(date.getMinutes()).padStart(2, "0"),
    period,
  };
}

function toTwentyFourHourTime(hour: string, minute: string, period: string) {
  if (!hour || !minute) return "";

  let numericHour = Number.parseInt(hour, 10);
  if (period === "AM" && numericHour === 12) numericHour = 0;
  if (period === "PM" && numericHour !== 12) numericHour += 12;

  return `${String(numericHour).padStart(2, "0")}:${minute}`;
}

export function EventDateTimePicker({
  name,
  labelKey,
  label,
  defaultValue,
  required = false,
}: EventDateTimePickerProps) {
  const initialDate = defaultValue ? parseISO(defaultValue) : undefined;
  const initialTime = toTwelveHourTime(initialDate);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);
  const [period, setPeriod] = useState(initialTime.period);
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const closePanel = () => {
    setIsOpen(false);
    trigger.current?.focus();
  };

  const language = useSiteLanguage();
  const { t } = useWorkspaceCopy();
  const resolvedLabel = labelKey ? t(labelKey) : label ?? "";
  const twentyFourHourTime = toTwentyFourHourTime(hour, minute, period);
  const hiddenValue = selectedDate && twentyFourHourTime
    ? `${format(selectedDate, "yyyy-MM-dd")}T${twentyFourHourTime}`
    : "";
  const periodLabel = period === "AM" ? t("eventPicker.am") : t("eventPicker.pm");
  const displayValue = selectedDate && hour && minute
    ? `${formatSiteDate(language, selectedDate, { year: "numeric", month: "long", day: "numeric" })} ${t("eventPicker.at")} ${hour}:${minute} ${periodLabel}`
    : resolvedLabel;

  const fieldClass =
    "w-full rounded-[var(--radius)] border border-input bg-background px-3 py-3 text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20";

  return (
    <div className={styles.root} onKeyDown={(event) => {
      if (isOpen && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closePanel();
      }
    }}>
      <input type="hidden" name={name} value={hiddenValue} required={required} />

      <button
        ref={trigger}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={`${resolvedLabel}: ${displayValue}`}
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        aria-haspopup="dialog"
        className={`${styles.trigger} flex w-full items-center justify-between rounded-[var(--radius)] border border-input bg-background px-4 py-3 text-left text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-ring/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
      >
        <span className={selectedDate && hour && minute ? "text-foreground" : "text-muted-foreground"}>
          {displayValue}
        </span>
        <CalendarDays aria-hidden="true" className="size-5 shrink-0 text-primary" />
      </button>

      {isOpen ? (
        <div id={panelId} role="dialog" aria-label={`${resolvedLabel} ${t("eventPicker.dateTime")}`} className={styles.panel}>
          <DayPicker
            autoFocus
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={{ before: new Date() }}
          />

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-semibold">{t("eventPicker.time")}</p>
            <div className="mt-2 grid grid-cols-3 gap-3">
              <div>
                <label htmlFor={`${name}-hour`} className="mb-1 block text-xs text-muted-foreground">{t("eventPicker.hour")}</label>
                <select id={`${name}-hour`} value={hour} onChange={(event) => setHour(event.target.value)} className={fieldClass}>
                  <option value="">--</option>
                  {Array.from({ length: 12 }, (_, index) => {
                    const value = String(index + 1).padStart(2, "0");
                    return <option key={value} value={value}>{value}</option>;
                  })}
                </select>
              </div>

              <div>
                <label htmlFor={`${name}-minute`} className="mb-1 block text-xs text-muted-foreground">{t("eventPicker.minute")}</label>
                <select id={`${name}-minute`} value={minute} onChange={(event) => setMinute(event.target.value)} className={fieldClass}>
                  <option value="">--</option>
                  {["00", "15", "30", "45"].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor={`${name}-period`} className="mb-1 block text-xs text-muted-foreground">{t("eventPicker.period")}</label>
                <select id={`${name}-period`} value={period} onChange={(event) => setPeriod(event.target.value)} className={fieldClass}>
                  <option value="AM">{t("eventPicker.am")}</option>
                  <option value="PM">{t("eventPicker.pm")}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(undefined);
                setHour("");
                setMinute("");
                setPeriod("AM");
                closePanel();
              }}
              className={`${styles.control} rounded-[var(--radius)] px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
            >
              {t("eventPicker.clear")}
            </button>

            <button
              type="button"
              disabled={!selectedDate || !hour || !minute}
              onClick={closePanel}
              className={`${styles.control} rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition  hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {t("eventPicker.done")}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
