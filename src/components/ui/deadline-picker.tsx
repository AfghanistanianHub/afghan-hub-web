"use client";

import { useState } from "react";
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

  const hiddenValue = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : "";

  return (
    <div className="relative">
      <input type="hidden" name="deadline" value={hiddenValue} />

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-left outline-none transition hover:border-slate-600 focus:border-emerald-500"
      >
        <span
          className={
            selectedDate ? "text-slate-100" : "text-slate-500"
          }
        >
          {selectedDate
            ? format(selectedDate, "MMMM d, yyyy")
            : "Select a deadline"}
        </span>

        <span aria-hidden="true" className="text-lg text-slate-400">
          📅
        </span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 z-50 mt-2 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
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

          <div className="mt-3 flex items-center justify-between border-t border-slate-700 pt-3">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(undefined);
                setIsOpen(false);
              }}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
