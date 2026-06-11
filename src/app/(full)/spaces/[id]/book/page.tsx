"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { Button } from "@/components/ui";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type Day = { y: number; m: number; d: number; key: string };

/** Local YYYY-MM-DD key (timezone-safe, matches stored booking dates). */
function dateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function buildMonth(year: number, month: number): (Day | null)[] {
  const first = new Date(year, month, 1).getDay();
  const total = new Date(year, month + 1, 0).getDate();
  const cells: (Day | null)[] = Array(first).fill(null);
  for (let d = 1; d <= total; d++) {
    cells.push({ y: year, m: month, d, key: `${year}-${month}-${d}` });
  }
  return cells;
}

export default function BookingDatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const today = new Date();

  // Selection is intentionally ephemeral — it is NOT saved. If you leave
  // without booking, returning shows a clean calendar.
  const [sel, setSel] = useState<{
    start: Day | null;
    end: Day | null;
    viewYear: number;
  }>({ start: null, end: null, viewYear: today.getFullYear() });
  const { start, end, viewYear } = sel;

  // Dates already booked for this room (across everyone) — shown as unavailable.
  const [booked, setBooked] = useState<Set<string>>(new Set());
  useEffect(() => {
    fetch(`/api/bookings?spaceId=${id}`)
      .then((r) => r.json())
      .then((d) => setBooked(new Set<string>(d.booked ?? [])))
      .catch(() => {});
  }, [id]);

  // Show every month of the selected year; the arrows switch year.
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, m) => ({ y: viewYear, m })),
    [viewYear]
  );

  function ord(day: Day) {
    return new Date(day.y, day.m, day.d).getTime();
  }
  function isBooked(day: Day) {
    return booked.has(dateKey(day.y, day.m, day.d));
  }
  function rangeHasBooked(a: number, b: number) {
    for (let t = a; t <= b; t += 86400000) {
      const dt = new Date(t);
      if (booked.has(dateKey(dt.getFullYear(), dt.getMonth(), dt.getDate())))
        return true;
    }
    return false;
  }

  function selectDay(day: Day) {
    if (ord(day) < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime())
      return;
    if (isBooked(day)) return; // can't select an already-booked date
    let nextStart = start;
    let nextEnd = end;
    if (!start || (start && end)) {
      nextStart = day;
      nextEnd = null;
    } else if (ord(day) < ord(start)) {
      nextStart = day;
    } else if (rangeHasBooked(ord(start), ord(day))) {
      // Range would cover a booked night — start a fresh selection instead.
      nextStart = day;
      nextEnd = null;
    } else {
      nextEnd = day;
    }
    setSel({ start: nextStart, end: nextEnd, viewYear });
  }

  function state(day: Day): "none" | "start" | "end" | "mid" | "single" {
    if (start && !end && day.key === start.key) return "single";
    if (start && day.key === start.key) return "start";
    if (end && day.key === end.key) return "end";
    if (start && end && ord(day) > ord(start) && ord(day) < ord(end)) return "mid";
    return "none";
  }

  const nights =
    start && end
      ? Math.round((ord(end) - ord(start)) / 86400000)
      : start
        ? 1
        : 0;

  function confirm() {
    if (!start) return;
    const last = end ?? start;
    const dates: string[] = [];
    for (let t = ord(start); t <= ord(last); t += 86400000) {
      const dt = new Date(t);
      dates.push(dateKey(dt.getFullYear(), dt.getMonth(), dt.getDate()));
    }
    sessionStorage.setItem(
      "jiva_booking",
      JSON.stringify({ spaceId: id, dates, nights: Math.max(nights, 1) })
    );
    router.push(`/booking/${id}/payment`);
  }

  return (
    <main className="flex flex-1 flex-col pb-24">
      <div className="screen screen-wide flex-1">
        <header className="flex items-center justify-center py-4">
          <h1 className="font-display text-xl font-semibold">Choose Booking Date</h1>
        </header>

        <div className="flex items-center justify-center gap-8 py-2">
          <button onClick={() => setSel({ ...sel, viewYear: viewYear - 1 })} aria-label="Previous year" className="text-[var(--color-accent)]">
            <ChevronLeft />
          </button>
          <span className="font-display text-2xl font-semibold text-[var(--color-accent)]">
            {viewYear}
          </span>
          <button onClick={() => setSel({ ...sel, viewYear: viewYear + 1 })} aria-label="Next year" className="text-[var(--color-accent)]">
            <ChevronRight />
          </button>
        </div>

        <div className="mt-2 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {months.map(({ y, m }) => (
            <section key={`${y}-${m}`}>
              <h2 className="mb-3 font-display text-lg font-semibold">
                {MONTHS[m]}
              </h2>
              <div className="grid grid-cols-7 gap-y-2 text-center text-[11px] text-[var(--color-faint)]">
                {WEEKDAYS.map((w) => (
                  <span key={w}>{w}</span>
                ))}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-y-1">
                {buildMonth(y, m).map((day, i) => {
                  if (!day) return <span key={i} />;
                  const s = state(day);
                  const past =
                    ord(day) <
                    new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate()
                    ).getTime();
                  // Highlighted as booked only until the date passes.
                  const taken = !past && isBooked(day);
                  const inRange = s === "start" || s === "end" || s === "mid";
                  return (
                    <div
                      key={day.key}
                      className={[
                        "flex justify-center py-1",
                        inRange
                          ? "border-y border-[var(--color-accent)] bg-[var(--color-accent)]/80"
                          : "",
                        s === "start" ? "rounded-l-full border-l" : "",
                        s === "end" ? "rounded-r-full border-r" : "",
                      ].join(" ")}
                    >
                      <button
                        disabled={past || taken}
                        title={taken ? "Already booked" : undefined}
                        onClick={() => selectDay(day)}
                        className={`grid h-9 w-9 place-items-center rounded-full text-sm transition ${
                          s === "single"
                            ? "bg-[var(--color-accent)] font-semibold text-white"
                            : inRange
                              ? `bg-[var(--color-surface-2)] ${
                                  s === "mid"
                                    ? "text-[var(--color-accent)]"
                                    : "font-semibold text-white"
                                }`
                              : taken
                                ? "bg-[var(--color-accent)]/20 font-medium text-[var(--color-accent)]/70 line-through"
                                : past
                                  ? "bg-[var(--color-surface-2)]/40 text-[var(--color-faint)]"
                                  : "bg-[var(--color-surface-2)] text-[var(--color-accent)] hover:bg-[var(--color-surface)]"
                        }`}
                      >
                        {day.d}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-bg-soft)]/95 backdrop-blur">
        <div className="screen screen-wide flex items-center gap-3 py-3">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button onClick={confirm} disabled={!start}>
            {nights > 0 ? `Confirm · ${nights} night${nights > 1 ? "s" : ""}` : "Confirm"}
          </Button>
        </div>
      </div>
    </main>
  );
}
