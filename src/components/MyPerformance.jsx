import { useMemo } from "react";
import { useCases } from "../context/CasesContext";

const WEEK_DAYS = [
  { key: 1, label: "Mon" },
  { key: 2, label: "Tue" },
  { key: 3, label: "Wed" },
  { key: 4, label: "Thu" },
  { key: 5, label: "Fri" },
  { key: 6, label: "Sat" },
  { key: 0, label: "Sun" },
];

export default function MyPerformance({ className = "" }) {
  const { cases } = useCases();
  const todayIdx = new Date().getDay();

  const { data, total } = useMemo(() => {
    // Anchor to Monday of this week
    const now = new Date();
    const monday = new Date(now);
    const dow = monday.getDay(); // 0..6 (Sun..Sat)
    const offset = dow === 0 ? -6 : 1 - dow;
    monday.setDate(monday.getDate() + offset);
    monday.setHours(0, 0, 0, 0);

    const buckets = WEEK_DAYS.map((d, i) => {
      const dayStart = new Date(monday); dayStart.setDate(monday.getDate() + i);
      const dayEnd   = new Date(dayStart); dayEnd.setDate(dayStart.getDate() + 1);
      return { ...d, start: dayStart.getTime(), end: dayEnd.getTime(), tickets: 0 };
    });

    cases.forEach((c) => {
      if (!c.completedAt) return;
      const ts = new Date(c.completedAt).getTime();
      const slot = buckets.find((b) => ts >= b.start && ts < b.end);
      if (slot) slot.tickets += 1;
    });

    return {
      data: buckets,
      total: buckets.reduce((acc, b) => acc + b.tickets, 0),
    };
  }, [cases]);

  const max  = Math.max(1, ...data.map((d) => d.tickets));
  const steps = [
    0,
    Math.round(max * 0.25),
    Math.round(max * 0.5),
    Math.round(max * 0.75),
    max,
  ];

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-lg outline -outline-offset-1 outline-white/10 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-obsidianNight/60 px-5 py-3 min-h-[60px] border-b border-white/10 shrink-0">
        <h3 className="text-base font-semibold leading-6 text-white">
          My Performance
        </h3>
        <p className="text-sm font-medium text-electricBlue">
          Cases resolved this week
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 min-h-0 px-5 py-4 bg-obsidianNight/50">
        <div className="shrink-0 mb-4">
          <span className="text-3xl font-bold text-white">{total}</span>
          <span className="ml-2 text-sm text-gray-400">
            {total === 1 ? "case" : "cases"} resolved
          </span>
        </div>

        <div className="flex flex-col flex-1 min-h-0 justify-around">
          {data.map((entry) => {
            const isToday = entry.key === todayIdx;
            const pct = Math.round((entry.tickets / max) * 100);
            return (
              <div key={entry.label} className="flex items-center gap-2">
                <span className="w-7 shrink-0 text-right text-xs text-gray-500">
                  {entry.label}
                </span>

                <div className="relative flex-1 h-5 rounded-r overflow-hidden bg-white/5 min-w-0">
                  <div
                    className="h-full rounded-r transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      background: isToday
                        ? "hsl(217, 91%, 60%)"
                        : "rgba(59, 130, 246, 0.4)",
                    }}
                  />
                </div>

                <span className="w-5 shrink-0 text-right text-xs text-gray-500">
                  {entry.tickets}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex shrink-0 mt-3 pl-9 pr-5">
          <div className="flex flex-1 justify-between">
            {steps.map((v, i) => (
              <span key={`${v}-${i}`} className="text-[11px] text-gray-600">
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
