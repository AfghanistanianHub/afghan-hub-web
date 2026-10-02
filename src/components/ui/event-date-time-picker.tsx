"use client";

import { useId, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import styles from "./calendar-field.module.css";
import { format, parseISO } from "date-fns";
import { DayPicker } from "@daypicker/react";
import "@daypicker/react/style.css";

type EventDateTimePickerProps = {
  name: string;
  label: string;
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

  const twentyFourHourTime = toTwentyFourHourTime(hour, minute, period);
  const hiddenValue = selectedDate && twentyFourHourTime
    ? `${format(selectedDate, "yyyy-MM-dd")}T${twentyFourHourTime}`
    : "";
  const displayValue = selectedDate && hour && minute
    ? `${format(selectedDate, "MMMM d, yyyy")} at ${hour}:${minute} ${period}`
    : label;

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
        aria-label={`${label}: ${displayValue}`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
        className={`${styles.trigger} flex w-full items-center justify-between rounded-[var(--radius)] border border-input bg-background px-4 py-3 text-left text-foreground outline-none transition hover:border-primary/50 hover:bg-muted/40 focus:border-primary focus:ring-2 focus:ring-ring/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
      >
        <span className={selectedDate && hour && minute ? "text-foreground" : "text-muted-foreground"}>
          {displayValue}
        </span>
        <CalendarDays aria-hidden="true" className="size-5 shrink-0 text-primary" />
      </button>

      {isOpen ? (
        <div id={panelId} role="dialog" aria-label={`${label} date and time`} className={styles.panel}>
          <DayPicker
            autoFocus
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={{ before: new Date() }}
          />

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-sm font-semibold">Time</p>
            <div className="mt-2 grid grid-cols-3 gap-3">
              <div>
                <label htmlFor={`${name}-hour`} className="mb-1 block text-xs text-muted-foreground">Hour</label>
                <select id={`${name}-hour`} value={hour} onChange={(event) => setHour(event.target.value)} className={fieldClass}>
                  <option value="">--</option>
                  {Array.from({ length: 12 }, (_, index) => {
                    const value = String(index + 1).padStart(2, "0");
                    return <option key={value} value={value}>{value}</option>;
                  })}
                </select>
              </div>

              <div>
                <label htmlFor={`${name}-minute`} className="mb-1 block text-xs text-muted-foreground">Minute</label>
                <select id={`${name}-minute`} value={minute} onChange={(event) => setMinute(event.target.value)} className={fieldClass}>
                  <option value="">--</option>
                  {["00", "15", "30", "45"].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor={`${name}-period`} className="mb-1 block text-xs text-muted-foreground">AM / PM</label>
                <select id={`${name}-period`} value={period} onChange={(event) => setPeriod(event.target.value)} className={fieldClass}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
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
              Clear
            </button>

            <button
              type="button"
              disabled={!selectedDate || !hour || !minute}
              onClick={closePanel}
              className={`${styles.control} rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition  hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
