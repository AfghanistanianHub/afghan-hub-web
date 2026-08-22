"use client";

import { useState } from "react";
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
    return {
      hour: "",
      minute: "",
      period: "AM",
    };
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

function toTwentyFourHourTime(
  hour: string,
  minute: string,
  period: string,
) {
  if (!hour || !minute) {
    return "";
  }

  let numericHour = Number.parseInt(hour, 10);

  if (period === "AM" && numericHour === 12) {
    numericHour = 0;
  }

  if (period === "PM" && numericHour !== 12) {
    numericHour += 12;
  }

  return `${String(numericHour).padStart(2, "0")}:${minute}`;
}

export function EventDateTimePicker({
  name,
  label,
  defaultValue,
  required = false,
}: EventDateTimePickerProps) {
  const initialDate = defaultValue
    ? parseISO(defaultValue)
    : undefined;

  const initialTime = toTwelveHourTime(initialDate);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate,
  );
  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);
  const [period, setPeriod] = useState(initialTime.period);
  const [isOpen, setIsOpen] = useState(false);

  const twentyFourHourTime = toTwentyFourHourTime(
    hour,
    minute,
    period,
  );

  const hiddenValue =
    selectedDate && twentyFourHourTime
      ? `${format(selectedDate, "yyyy-MM-dd")}T${twentyFourHourTime}`
      : "";

  const displayValue =
    selectedDate && hour && minute
      ? `${format(selectedDate, "MMMM d, yyyy")} at ${hour}:${minute} ${period}`
      : label;

  return (
    <div className="relative">
      <input
        type="hidden"
        name={name}
        value={hiddenValue}
        required={required}
      />

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-left outline-none transition hover:border-slate-600 focus:border-emerald-500"
      >
        <span
          className={
            selectedDate && hour && minute
              ? "text-slate-100"
              : "text-slate-500"
          }
        >
          {displayValue}
        </span>

        <span aria-hidden="true" className="text-lg text-slate-400">
          📅
        </span>
      </button>

      {isOpen ? (
        <div className="absolute left-0 z-50 mt-2 w-full min-w-[340px] rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={{ before: new Date() }}
          />

          <div className="mt-4 border-t border-slate-700 pt-4">
            <p className="text-sm font-medium">Time</p>

            <div className="mt-2 grid grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor={`${name}-hour`}
                  className="mb-1 block text-xs text-slate-400"
                >
                  Hour
                </label>
                <select
                  id={`${name}-hour`}
                  value={hour}
                  onChange={(event) => setHour(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="">--</option>
                  {Array.from({ length: 12 }, (_, index) => {
                    const value = String(index + 1).padStart(2, "0");

                    return (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label
                  htmlFor={`${name}-minute`}
                  className="mb-1 block text-xs text-slate-400"
                >
                  Minute
                </label>
                <select
                  id={`${name}-minute`}
                  value={minute}
                  onChange={(event) => setMinute(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="">--</option>
                  {["00", "15", "30", "45"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor={`${name}-period`}
                  className="mb-1 block text-xs text-slate-400"
                >
                  AM / PM
                </label>
                <select
                  id={`${name}-period`}
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-700 pt-3">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(undefined);
                setHour("");
                setMinute("");
                setPeriod("AM");
                setIsOpen(false);
              }}
              className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Clear
            </button>

            <button
              type="button"
              disabled={!selectedDate || !hour || !minute}
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
