"use client";

import { useId, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import styles from "./calendar-field.module.css";
import { format, parseISO } from "date-fns";
import { DayPicker } from "@daypicker/react";
import "@daypicker/react/style.css";

type DeadlinePickerProps = {
  defaultValue?: string | null;
};

export function DeadlinePicker({
  defaultValue,
}: DeadlinePickerProps) {
  const initialDate = defaultValue
    ? parseISO(defaultValue.slice(0, 10))
    : undefined;

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate,
  );
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const trigger = useRef<HTMLButtonElement>(null);
  const closePanel = () => {
    setIsOpen(false);
    trigger.current?.focus();
  };

  const hiddenValue = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : "";

  return (
    <div className={styles.root} onKeyDown={(event) => {
      if (isOpen && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closePanel();
      }
    }}>
      <input type="hidden" name="deadline" value={hiddenValue} />

      <button
        ref={trigger}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
        className={`${styles.trigger} flex w-full items-center justify-between rounded-[var(--radius)] border border-input bg-background px-4 py-3 text-left outline-none transition hover:border-primary/35 focus:border-primary focus:ring-2 focus:ring-ring/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
      >
        <span className={selectedDate ? "text-foreground" : "text-muted-foreground"}>
          {selectedDate
            ? format(selectedDate, "MMMM d, yyyy")
            : "Select a deadline"}
        </span>

        <CalendarDays aria-hidden="true" className="size-5 shrink-0 text-primary" />
      </button>

      {isOpen ? (
        <div id={panelId} role="dialog" aria-label="Choose deadline" className={styles.panel}>
          <DayPicker
            autoFocus
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);

              if (date) {
                closePanel();
              }
            }}
            disabled={{ before: new Date() }}
          />

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(undefined);
                closePanel();
              }}
              className={`${styles.control} rounded-[var(--radius)] px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
            >
              Clear
            </button>

            <button
              type="button"
              onClick={closePanel}
              className={`${styles.control} rounded-[var(--radius)] bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition  hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary`}
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
