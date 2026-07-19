import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Dropdown from "./Dropdowns";

const TIME_OPTIONS = [
  { label: "This week",    days: 7  },
  { label: "Last 30 days", days: 30 },
];

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function fmtDayShort(d) {
  return DAY_SHORT[d.getDay()];
}
function fmtDayDate(d) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

// ─── Fake but realistic demo series ───────────────────────────────────────────
// Values are hand-picked to look like a healthy operating helpdesk —
// weekdays busier than weekends, resolved trailing opened slightly.
// Dates are still calendar-accurate (rolling 7 / 30 days ending today) so
// the labels always feel current, only the counts are static.
const WEEK_FAKE     = [7, 12, 9, 15, 11, 4, 3];       // opened per weekday, oldest → newest
const WEEK_RESOLVED = [5, 10, 8, 12, 13, 6, 4];       // resolved trails a day behind
const MONTH_FAKE_OPENED   = [
  8, 12, 10, 15, 11,  4,  3,
  9, 14, 11, 16, 13,  5,  4,
  10, 15, 12, 17, 14,  6,  5,
  11, 16, 13, 18, 15,  7,  6,
  12, 17,
];
const MONTH_FAKE_RESOLVED = [
  6, 10,  8, 12, 13, 6, 4,
  7, 12, 10, 14, 14, 7, 5,
  8, 13, 11, 15, 15, 8, 6,
  9, 14, 12, 16, 16, 9, 7,
  10, 15,
];

function buildSeries(days) {
  const now    = new Date();
  const cutoff = new Date(now); cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));

  const opened   = days <= 7 ? WEEK_FAKE          : MONTH_FAKE_OPENED;
  const resolved = days <= 7 ? WEEK_RESOLVED      : MONTH_FAKE_RESOLVED;

  const out = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(cutoff); d.setDate(cutoff.getDate() + i);
    out.push({
      day:      days <= 7 ? fmtDayShort(d) : fmtDayDate(d),
      opened:   opened[i]   ?? 0,
      resolved: resolved[i] ?? 0,
    });
  }
  return out;
}

export default function CasesVsWOChart({
  className = "",
  graphHeight = "240",
}) {
  const [range, setRange] = useState(TIME_OPTIONS[0].label);

  const data = useMemo(() => {
    const opt = TIME_OPTIONS.find((o) => o.label === range) ?? TIME_OPTIONS[0];
    return buildSeries(opt.days);
  }, [range]);

  const totals = useMemo(() => data.reduce(
    (acc, d) => ({ opened: acc.opened + d.opened, resolved: acc.resolved + d.resolved }),
    { opened: 0, resolved: 0 }
  ), [data]);

  return (
    <div className={`divide-y divide-white/10 overflow-hidden rounded-lg outline -outline-offset-1 outline-white/10 ${className}`}>
      <div className="px-5 flex items-center justify-between bg-obsidianNight/60 h-[60px]">
        <div className="flex items-center gap-4">
          <h3 className="text-base font-semibold text-white text-left truncate">
            Cases Vs Work Orders
          </h3>
          <span className="hidden md:inline-flex items-center gap-3 text-[11px] text-white/45">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-blue-400" /> {totals.opened} opened</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-400" /> {totals.resolved} completed</span>
          </span>
        </div>

        <Dropdown
          optionList={TIME_OPTIONS.map((o) => o.label)}
          defaultValue={range}
          onChange={(v) => setRange(v ?? TIME_OPTIONS[0].label)}
          dropdownBtnCls="bg-obsidianNight/60 rounded-lg outline-1 -outline-offset-1 outline-white/10 px-3 py-1.5"
          optionPlaceholder="This week"
          className="w-40"
        />
      </div>

      <div className="px-5 py-4 flex justify-center bg-obsidianNight/50">
        <ResponsiveContainer width="100%" height={graphHeight}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="openedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="hsl(217, 91%, 50%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" vertical={false} />
            <XAxis dataKey="day"    axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(220 9% 46%)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0 0% 100%)",
                border: "1px solid hsl(220 13% 91%)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Area type="monotone" dataKey="opened"   stroke="hsl(217, 91%, 50%)" fill="url(#openedGrad)"   strokeWidth={2} name="Opened" />
            <Area type="monotone" dataKey="resolved" stroke="hsl(142, 71%, 45%)" fill="url(#resolvedGrad)" strokeWidth={2} name="Resolved" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
