"use client";

import { useId, useState } from "react";
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

  const hiddenValue = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : "";

  return (
    <div className="relative">
      <input type="hidden" name="deadline" value={hiddenValue} />

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-haspopup="dialog"
        className="flex w-full items-center justify-between rounded-xl border border-input bg-background px-4 py-3 text-left outline-none transition hover:border-primary/35 focus:border-primary focus:ring-2 focus:ring-ring/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <span className={selectedDate ? "text-foreground" : "text-muted-foreground"}>
          {selectedDate
            ? format(selectedDate, "MMMM d, yyyy")
            : "Select a deadline"}
        </span>

        <span aria-hidden="true" className="text-lg text-muted-foreground">
          📅
        </span>
      </button>

      {isOpen ? (
        <div id={panelId} role="dialog" aria-label="Choose deadline" className="absolute left-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-xl">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);

              if (date) {
                setIsOpen(false);
              }
            }}
            disabled={{ before: new Date() }}
          />

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(undefined);
                setIsOpen(false);
              }}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
