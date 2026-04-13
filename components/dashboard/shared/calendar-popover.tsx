"use client";

// CalendarPopover — custom date picker z polskim locale.
// Renderowany przez Portal Popover w task-row.

import { useState } from "react";

const MONTHS_PL = [
  "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
  "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
];
const DAYS_PL = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

function startOfWeekMon(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // 0=Nd → offset 6, 1=Pn → 0, 2=Wt → 1 ...
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function addMonths(d: Date, n: number) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
}

export function CalendarPopover({
  value,
  onSelect,
  onClear,
  onCancel,
}: {
  value: Date | null;
  onSelect: (date: string) => void;
  onClear: () => void;
  onCancel: () => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewMonth, setViewMonth] = useState(value ?? today);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  // Buduj siatkę 6 tygodni
  const firstOfMonth = new Date(year, month, 1);
  const gridStart = startOfWeekMon(firstOfMonth);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(addDays(gridStart, i));
  }

  const handleQuick = (d: Date) => {
    onSelect(toISODate(d));
  };

  return (
    <div className="t-cal">
      {/* Quick dates */}
      <div className="t-cal-quick">
        <button className="t-cal-pill" onClick={() => handleQuick(today)}>Dziś</button>
        <button className="t-cal-pill" onClick={() => handleQuick(addDays(today, 1))}>Jutro</button>
        <button className="t-cal-pill" onClick={() => handleQuick(addDays(today, 7))}>Za tydzień</button>
        <button className="t-cal-pill" onClick={() => handleQuick(addMonths(today, 1))}>Za miesiąc</button>
      </div>

      {/* Header */}
      <div className="t-cal-header">
        <button className="t-cal-nav" onClick={() => setViewMonth(new Date(year, month - 1, 1))}>‹</button>
        <span className="t-cal-title">{MONTHS_PL[month]} {year}</span>
        <button className="t-cal-nav" onClick={() => setViewMonth(new Date(year, month + 1, 1))}>›</button>
      </div>

      {/* Day names */}
      <div className="t-cal-grid">
        {DAYS_PL.map(d => (
          <div key={d} className="t-cal-dayname">{d}</div>
        ))}

        {/* Day cells */}
        {cells.map((d, i) => {
          const isCurrentMonth = d.getMonth() === month;
          const isToday = isSameDay(d, today);
          const isSelected = value && isSameDay(d, value);

          const cls = [
            "t-cal-day",
            !isCurrentMonth ? "t-cal-day--other" : "",
            isToday ? "t-cal-day--today" : "",
            isSelected ? "t-cal-day--selected" : "",
          ].filter(Boolean).join(" ");

          return (
            <button
              key={i}
              className={cls}
              onClick={() => onSelect(toISODate(d))}
            >
              {d.getDate()}
              {isToday && <span className="t-cal-today-dot" />}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="t-cal-footer">
        {value ? (
          <button className="t-cal-footer-btn" onClick={onClear}>Usuń datę</button>
        ) : <span />}
        <button className="t-cal-footer-btn" onClick={onCancel}>Anuluj</button>
      </div>
    </div>
  );
}
